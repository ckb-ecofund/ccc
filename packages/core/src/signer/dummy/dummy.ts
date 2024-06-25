import { Address } from "../../address";
import { Client } from "../../client";
import { Signer, SignerSignType, SignerType } from "../signer";

export abstract class SignerDummy extends Signer {
  get signType(): SignerSignType {
    return SignerSignType.Unknown;
  }

  constructor(
    client: Client,
    public readonly type: SignerType,
  ) {
    super(client);
  }

  async isConnected(): Promise<boolean> {
    return false;
  }

  async getInternalAddress(): Promise<string> {
    throw new Error("Can't get address from SignerDummy");
  }

  async getAddressObjs(): Promise<Address[]> {
    throw new Error("Can't get addresses from SignerDummy");
  }
}
