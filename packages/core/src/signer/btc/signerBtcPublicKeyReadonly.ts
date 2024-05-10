import { Client } from "../../client";
import { Hex, HexLike, hexFrom } from "../../hex";
import { SignerBtc } from "./signerBtc";

export class SignerBtcPublicKeyReadonly extends SignerBtc {
  private readonly publicKey: Hex;

  constructor(
    client: Client,
    private readonly account: string,
    publicKey: HexLike,
  ) {
    super(client);

    this.publicKey = hexFrom(publicKey);
  }

  async connect(): Promise<void> {}

  async getBtcAccount(): Promise<string> {
    return this.account;
  }

  async getBtcPublicKey(): Promise<Hex> {
    return this.publicKey;
  }
}
