import { ccc } from "@ckb-ccc/core";
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
    private readonly _uri?: string,
    private readonly connectionsRepo: ConnectionsRepo = new ConnectionsRepoLocalStorage(),
  ) {
    super(client);
  }

  async replaceClient(client: ccc.Client): Promise<CkbSigner> {
    return new CkbSigner(client, this._uri);
  }

  private async getUri(): Promise<string> {
    if (this._uri) {
      return this._uri;
    }

    return (await this.client.getAddressPrefix()) === "ckb"
      ? "https://app.joy.id"
      : "https://testnet.joyid.dev";
  }

  async connect(): Promise<void> {
    const uri = await this.getUri();
    const res = await authWithPopup({
      joyidAppURL: uri,
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

  async getAddressObjs(): Promise<ccc.Address[]> {
    return [
      await ccc.Address.fromString(
        await this.getInternalAddress(),
        this.client,
      ),
    ];
  }

  async prepareTransaction(
    txLike: ccc.TransactionLike,
  ): Promise<ccc.Transaction> {
    const tx = ccc.Transaction.from(txLike);
    const position = await tx.findInputIndexByLock(
      (await this.getAddressObjs())[0].script,
      this.client,
    );
    if (position === undefined) {
      return tx;
    }

    const witness = tx.getWitnessArgsAt(position) ?? ccc.WitnessArgs.from({});
    witness.lock = "0x";
    return tx.setWitnessArgsAt(position, witness);
  }

  async signOnlyTransaction(
    txLike: ccc.TransactionLike,
  ): Promise<ccc.Transaction> {
    const popup = openPopup("");
    if (!popup) {
      return createBlockDialog(async () => this.signOnlyTransaction(txLike));
    }

    popup.location.href = buildJoyIDURL(
      {
        joyidAppURL: await this.getUri(),
        tx: JSON.parse(ccc.Transaction.from(txLike).stringify()),
        signerAddress: (await this.assertConnection()).address,
        redirectURL: location.href,
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
