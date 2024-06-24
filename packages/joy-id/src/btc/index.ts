import { ccc } from "@ckb-ccc/core";
import { DappRequestType, buildJoyIDURL } from "@joyid/common";
import { createPopup } from "../common";
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
    private readonly appUri = "https://app.joy.id",
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
      this.appUri,
      this.connectionsRepo,
    );
  }

  private getConfig() {
    return {
      redirectURL: location.href,
      joyidAppURL: this.appUri,
      requestNetwork: `btc-${this.addressType}`,
      name: this.name,
      logo: this.icon,
    };
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
    const config = this.getConfig();
    const res = await createPopup(buildJoyIDURL(config, "popup", "/auth"), {
      ...config,
      type: DappRequestType.Auth,
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
        { uri: this.appUri, addressType: `btc-${res.btcAddressType}` },
        this.connection,
      ),
      this.connectionsRepo.set(
        { uri: this.appUri, addressType: "btc-auto" },
        this.connection,
      ),
    ]);
  }

  async isConnected(): Promise<boolean> {
    if (this.connection) {
      return true;
    }

    this.connection = await this.connectionsRepo.get({
      uri: this.appUri,
      addressType: `btc-${this.addressType}`,
    });
    return this.connection !== undefined;
  }

  async signMessageRaw(message: string | ccc.BytesLike): Promise<string> {
    const { address } = this.assertConnection();

    const challenge =
      typeof message === "string" ? message : ccc.hexFrom(message).slice(2);

    const config = this.getConfig();
    const { signature } = await createPopup(
      buildJoyIDURL(
        {
          ...config,
          challenge,
          address,
          signMessageType: "ecdsa",
        },
        "popup",
        "/sign-message",
      ),
      { ...config, type: DappRequestType.SignMessage },
    );
    return signature;
  }
}
