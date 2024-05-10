import { Address } from "../../address";
import { Script, ScriptLike } from "../../ckb";
import { Client } from "../../client";
import { Signer } from "../signer";

export class SignerCkbScriptReadonly extends Signer {
  private readonly script: Script;

  constructor(client: Client, script: ScriptLike) {
    super(client);

    this.script = Script.from(script);
  }

  async connect(): Promise<void> {}

  async getInternalAddress(): Promise<string> {
    return this.getRecommendedAddress();
  }

  async getAddressObjs(): Promise<Address[]> {
    return [await Address.fromScript(this.script, this.client)];
  }
}
