import { ccc } from "@ckb-ccc/core";
import { authWithPopup, signMessageWithPopup } from "@joyid/common";
import {
  Connection,
  ConnectionsRepo,
  ConnectionsRepoLocalStorage,
} from "../connectionsStorage";

export class BitcoinSigner extends ccc.SignerBtc {
  private connection?: Connection;

  private assertConnection() {
    if (!this.isConnected() || !this.connection) {
      throw new Error("Not connected");
    }

    return this.connection;
  }

  constructor(
    client: ccc.Client,
    private readonly name: string,
    private readonly icon: string,
    private readonly addressType: "auto" | "p2wpkh" | "p2tr" = "auto",
    private readonly uri = "https://app.joy.id",
    private readonly connectionsRepo: ConnectionsRepo = new ConnectionsRepoLocalStorage(),
  ) {
    super(client);
  }

  async replaceClient(client: ccc.Client): Promise<BitcoinSigner> {
    return new BitcoinSigner(
      client,
      this.name,
      this.icon,
      this.addressType,
      this.uri,
      this.connectionsRepo,
    );
  }

  async getBtcAccount(): Promise<string> {
    const { address } = this.assertConnection();
    return address;
  }

  async getBtcPublicKey(): Promise<ccc.Hex> {
    const { publicKey } = this.assertConnection();
    return publicKey;
  }

  async connect(): Promise<void> {
    const res = await authWithPopup({
      joyidAppURL: this.uri,
      name: this.name,
      logo: this.icon,
      redirectURL: location.href,
      requestNetwork: `btc-${this.addressType}`,
    });

    const { address, pubkey } = (() => {
      if (this.addressType === "auto") {
        return res.btcAddressType === "p2wpkh" ? res.nativeSegwit : res.taproot;
      }
      return res.btcAddressType === "p2wpkh" ? res.nativeSegwit : res.taproot;
    })();

    this.connection = {
      address,
      publicKey: ccc.hexFrom(pubkey),
      keyType: res.keyType,
    };
    await Promise.all([
      this.connectionsRepo.set(
        { uri: this.uri, addressType: `btc-${res.btcAddressType}` },
        this.connection,
      ),
      this.connectionsRepo.set(
        { uri: this.uri, addressType: "btc-auto" },
        this.connection,
      ),
    ]);
  }

  async isConnected(): Promise<boolean> {
    if (this.connection) {
      return true;
    }

    this.connection = await this.connectionsRepo.get({
      uri: this.uri,
      addressType: `btc-${this.addressType}`,
    });
    return this.connection !== undefined;
  }

  async signMessage(message: string | ccc.BytesLike): Promise<string> {
    const { address } = this.assertConnection();

    const challenge =
      typeof message === "string" ? message : ccc.hexFrom(message).slice(2);

    const { signature } = await signMessageWithPopup({
      joyidAppURL: this.uri,
      name: this.name,
      logo: this.icon,
      requestNetwork: `btc-${this.addressType}`,
      challenge,
      address,
      signMessageType: "ecdsa",
      redirectURL: location.href,
    });
    return signature;
  }
}
