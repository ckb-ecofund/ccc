import { Address, ccc, Client, ScriptLike, SignerCkbScriptReadonly, TransactionLike } from "@ckb-ccc/core";
import { CKBTransaction, initConfig, signRawTransaction } from "@joyid/ckb";
import { connect as joyidConnect } from "@joyid/ckb";

/**
 * A class extending SignerCkbScriptReadonly that provides additional functionalities.
 */
export class Signer extends ccc.Signer {
  
  private address: string;

  /**
   * Creates an instance of Signer.
   *
   * @param client - The client instance used for communication.
   * @param script - The script associated with the signer.
   */
  
  constructor(client: Client) {
    super(client);
    this.address = ""
  }

  private async initJoyidConfig(): Promise<void> {
    const prefix = await this.client.getAddressPrefix();
    initConfig({
      joyidAppURL: prefix === 'ckt' ? 'https://testnet.joyid.dev' : "https://app.joy.id/",
    });
  }

  async connect(): Promise<void> {
    await this.initJoyidConfig(); 
    const addressInfo = await joyidConnect();
    this.address = addressInfo.address;
  }

  async isConnected(): Promise<boolean> {
    return !!this.address;
  }

  async getInternalAddress(): Promise<string> {
    return this.address;
  }

  async getAddressObjs(): Promise<ccc.Address[]> {
    return [await Address.fromString(this.address, this.client)];
  }

  /**
   * Replace the client and return a new instance of Signer.
   *
   * @param client - The new client instance.
   * @returns A promise that resolves to a new Signer instance.
   */
  
  async replaceClient(client: Client): Promise<Signer> {
    let replacedSigner = new Signer(client);
    await replacedSigner.connect();
    return replacedSigner;
  }

  async sendTransaction(tx: ccc.TransactionLike): Promise<ccc.Hex> {
    //@ts-ignore
    const signedTx = await signRawTransaction(tx, this.address);
    return this.client.sendTransaction(signedTx);
  }
}
