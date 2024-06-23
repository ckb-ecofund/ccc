import { ccc } from "@ckb-ccc/core";
import { Aggregator } from "@joyid/ckb";
import {
  DappRequestType,
  authWithPopup,
  buildJoyIDURL,
  createBlockDialog,
  openPopup,
  runPopup,
} from "@joyid/common";
import {
  Connection,
  ConnectionsRepo,
  ConnectionsRepoLocalStorage,
} from "../connectionsStorage";

export class CkbSigner extends ccc.Signer {
  private connection?: Connection;

  private async assertConnection(): Promise<Connection> {
    if (!(await this.isConnected()) || !this.connection) {
      throw new Error("Not connected");
    }

    return this.connection;
  }

  constructor(
    client: ccc.Client,
    private readonly name: string,
    private readonly icon: string,
    private readonly _uri?: string,
    private readonly _aggregatorUri?: string,
    private readonly connectionsRepo: ConnectionsRepo = new ConnectionsRepoLocalStorage(),
  ) {
    super(client);
  }

  async replaceClient(client: ccc.Client): Promise<CkbSigner> {
    return new CkbSigner(
      client,
      this.name,
      this.icon,
      this._uri,
      this._aggregatorUri,
      this.connectionsRepo,
    );
  }

  private async getUri(): Promise<string> {
    if (this._uri) {
      return this._uri;
    }

    return (await this.client.getAddressPrefix()) === "ckb"
      ? "https://app.joy.id"
      : "https://testnet.joyid.dev";
  }

  private async getAggregatorUri(): Promise<string> {
    if (this._aggregatorUri) {
      return this._aggregatorUri;
    }

    return (await this.client.getAddressPrefix()) === "ckb"
      ? "https://cota.nervina.dev/mainnet-aggregator"
      : "https://cota.nervina.dev/aggregator";
  }

  async connect(): Promise<void> {
    const uri = await this.getUri();
    const res = await authWithPopup({
      joyidAppURL: uri,
      name: this.name,
      logo: this.icon,
      redirectURL: location.href,
    });

    this.connection = {
      address: res.address,
      publicKey: ccc.hexFrom(res.pubkey),
      keyType: res.keyType,
    };
    await this.saveConnection();
  }

  async disconnect(): Promise<void> {
    this.connection = undefined;
    await this.saveConnection();
  }

  async isConnected(): Promise<boolean> {
    if (this.connection) {
      return true;
    }
    await this.restoreConnection();
    return this.connection !== undefined;
  }

  async getInternalAddress(): Promise<string> {
    return (await this.assertConnection()).address;
  }

  async getAddressObj(): Promise<ccc.Address> {
    return await ccc.Address.fromString(
      await this.getInternalAddress(),
      this.client,
    );
  }

  async getAddressObjs(): Promise<ccc.Address[]> {
    return [await this.getAddressObj()];
  }

  async prepareTransaction(
    txLike: ccc.TransactionLike,
  ): Promise<ccc.Transaction> {
    const tx = ccc.Transaction.from(txLike);
    const position = await tx.findInputIndexByLock(
      (await this.getAddressObj()).script,
      this.client,
    );
    if (position === undefined) {
      return tx;
    }

    const witness = tx.getWitnessArgsAt(position) ?? ccc.WitnessArgs.from({});
    witness.lock = "0x";
    await this.prepareTransactionForSubKey(tx, witness);
    return tx.setWitnessArgsAt(position, witness);
  }

  private async prepareTransactionForSubKey(
    tx: ccc.Transaction,
    witness: ccc.WitnessArgs,
  ) {
    if (this.connection?.keyType !== "sub_key") {
      return [];
    }

    const pubkeyHash = ccc.ckbHash(this.connection.publicKey).substring(0, 42);
    const lock = (await this.getAddressObj()).script;
    const aggregator = new Aggregator(await this.getAggregatorUri());
    const { unlock_entry: unlockEntry } =
      await aggregator.generateSubkeyUnlockSmt({
        alg_index: 1,
        pubkey_hash: pubkeyHash,
        lock_script: ccc.hexFrom(lock.toBytes()),
      });
    witness.outputType = ccc.hexFrom(unlockEntry);

    const cotaDeps: ccc.CellDep[] = [];
    for await (const cell of this.client.findCellsByLockAndType(lock, {
      ...(await this.client.getKnownScript(ccc.KnownScript.COTA)),
      args: "0x",
    })) {
      cotaDeps.push(
        ccc.CellDep.from({
          depType: "code",
          outPoint: cell.outPoint,
        }),
      );
    }

    if (cotaDeps.length === 0) {
      throw new Error("No COTA cells for sub key wallet");
    }

    tx.cellDeps.unshift(...cotaDeps);
  }

  async signOnlyTransaction(
    txLike: ccc.TransactionLike,
  ): Promise<ccc.Transaction> {
    const popup = openPopup("");
    if (!popup) {
      return createBlockDialog(async () => this.signOnlyTransaction(txLike));
    }
    const tx = ccc.Transaction.from(txLike);
    const { script } = await this.getAddressObj();

    popup.location.href = buildJoyIDURL(
      {
        joyidAppURL: await this.getUri(),
        name: this.name,
        logo: this.icon,
        tx: JSON.parse(tx.stringify()),
        signerAddress: (await this.assertConnection()).address,
        redirectURL: location.href,
        witnessIndex: await tx.findInputIndexByLock(script, this.client),
      },
      "popup",
      "/sign-ckb-raw-tx",
    );

    const res = await runPopup({
      timeoutInSeconds: 3600,
      popup,
      type: DappRequestType.SignCkbRawTx,
    });

    return ccc.Transaction.from(res.tx);
  }

  private async saveConnection() {
    return this.connectionsRepo.set(
      {
        uri: await this.getUri(),
        addressType: "ckb",
      },
      this.connection,
    );
  }

  private async restoreConnection() {
    this.connection = await this.connectionsRepo.get({
      uri: await this.getUri(),
      addressType: "ckb",
    });
  }
}
