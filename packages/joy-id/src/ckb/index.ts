import { ccc } from "@ckb-ccc/core";
import { Aggregator } from "@joyid/ckb";
import { DappRequestType, buildJoyIDURL } from "@joyid/common";
import { createPopup } from "../common";
import {
  Connection,
  ConnectionsRepo,
  ConnectionsRepoLocalStorage,
} from "../connectionsStorage";

export class CkbSigner extends ccc.Signer {
  get type(): ccc.SignerType {
    return ccc.SignerType.CKB;
  }

  get signType(): ccc.SignerSignType {
    return ccc.SignerSignType.JoyId;
  }

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
    private readonly _appUri?: string,
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
      this._appUri,
      this._aggregatorUri,
      this.connectionsRepo,
    );
  }

  private getConfig() {
    return {
      redirectURL: location.href,
      joyidAppURL:
        this._appUri ?? this.client.addressPrefix === "ckb"
          ? "https://app.joy.id"
          : "https://testnet.joyid.dev",
      name: this.name,
      logo: this.icon,
    };
  }

  private getAggregatorUri(): string {
    if (this._aggregatorUri) {
      return this._aggregatorUri;
    }

    return this.client.addressPrefix === "ckb"
      ? "https://cota.nervina.dev/mainnet-aggregator"
      : "https://cota.nervina.dev/aggregator";
  }

  async connect(): Promise<void> {
    const config = this.getConfig();

    const res = await createPopup(buildJoyIDURL(config, "popup", "/auth"), {
      ...config,
      type: DappRequestType.Auth,
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

  async getIdentity(): Promise<string> {
    const connection = await this.assertConnection();
    return JSON.stringify({
      keyType: connection.keyType,
      publicKey: connection.publicKey.slice(2),
    });
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
    const tx = ccc.Transaction.from(txLike);
    const { script } = await this.getAddressObj();

    const config = this.getConfig();
    const res = await createPopup(
      buildJoyIDURL(
        {
          ...config,
          tx: JSON.parse(tx.stringify()),
          signerAddress: (await this.assertConnection()).address,
          witnessIndex: await tx.findInputIndexByLock(script, this.client),
        },
        "popup",
        "/sign-ckb-raw-tx",
      ),
      {
        ...config,
        type: DappRequestType.SignCkbRawTx,
      },
    );

    return ccc.Transaction.from(res.tx);
  }

  async signMessageRaw(message: string | ccc.BytesLike): Promise<string> {
    const { address } = await this.assertConnection();

    const challenge =
      typeof message === "string" ? message : ccc.hexFrom(message).slice(2);

    const config = this.getConfig();
    const res = await createPopup(
      buildJoyIDURL(
        {
          ...config,
          challenge,
          isData: typeof message !== "string",
          address,
        },
        "popup",
        "/sign-message",
      ),
      { ...config, type: DappRequestType.SignMessage },
    );
    return JSON.stringify({
      signature: res.signature,
      alg: res.alg,
      message: res.message,
    });
  }

  private async saveConnection() {
    return this.connectionsRepo.set(
      {
        uri: this.getConfig().joyidAppURL,
        addressType: "ckb",
      },
      this.connection,
    );
  }

  private async restoreConnection() {
    this.connection = await this.connectionsRepo.get({
      uri: this.getConfig().joyidAppURL,
      addressType: "ckb",
    });
  }
}
