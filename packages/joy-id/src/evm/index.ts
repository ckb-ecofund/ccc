import { ccc } from "@ckb-ccc/core";
import { DappRequestType, buildJoyIDURL } from "@joyid/common";
import { createPopup } from "../common";
import {
  Connection,
  ConnectionsRepo,
  ConnectionsRepoLocalStorage,
} from "../connectionsStorage";

export class EvmSigner extends ccc.SignerEvm {
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
    private readonly appUri = "https://app.joy.id",
    private readonly connectionsRepo: ConnectionsRepo = new ConnectionsRepoLocalStorage(),
  ) {
    super(client);
  }

  private getConfig() {
    return {
      redirectURL: location.href,
      joyidAppURL: this.appUri,
      requestNetwork: `ethereum`,
      name: this.name,
      logo: this.icon,
    };
  }

  async getEvmAccount() {
    return this.assertConnection().address;
  }

  async connect(): Promise<void> {
    const config = await this.getConfig();

    const res = await createPopup(buildJoyIDURL(config, "popup", "/auth"), {
      ...config,
      type: DappRequestType.Auth,
    });

    this.connection = {
      address: res.ethAddress,
      publicKey: ccc.hexFrom(res.pubkey),
      keyType: res.keyType,
    };
    await this.saveConnection();
  }

  async isConnected(): Promise<boolean> {
    if (this.connection) {
      return true;
    }
    await this.restoreConnection();
    return this.connection !== undefined;
  }

  async signMessageRaw(message: string | ccc.BytesLike): Promise<ccc.Hex> {
    const { address } = this.assertConnection();

    const challenge =
      typeof message === "string" ? message : ccc.hexFrom(message).slice(2);

    const config = this.getConfig();
    const { signature } = await createPopup(
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
    return ccc.hexFrom(signature);
  }

  private async saveConnection() {
    return this.connectionsRepo.set(
      {
        uri: this.getConfig().joyidAppURL,
        addressType: "ethereum",
      },
      this.connection,
    );
  }

  private async restoreConnection() {
    this.connection = await this.connectionsRepo.get({
      uri: this.getConfig().joyidAppURL,
      addressType: "ethereum",
    });
  }
}
