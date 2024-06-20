import { Address, ccc, Client, ScriptLike, SignerCkbScriptReadonly, TransactionLike } from "@ckb-ccc/core";
import { initConfig, signRawTransaction } from "@joyid/ckb";
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
      network: prefix === 'ckt' ? 'testnet' : 'mainnet'
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

  // async sendTransactionWithAddress(tx: helpers.TransactionSkeletonType, address: string): Promise<ccc.Hex> {
  //   const txSkeleton = helpers.createTransactionFromSkeleton(tx);
  //   //@ts-ignore
  //   const signedTx = await signRawTransaction(tx, address);
  //   return this.client.sendTransaction(signedTx);
  // }

  async sendTransaction(tx: ccc.TransactionLike): Promise<ccc.Hex> {
    const fromTx = ccc.Transaction.from(tx);
    //@ts-ignore
    const signedTx = await signRawTransaction(fromTx, this.address);
    return this.client.sendTransaction(signedTx);
  }
}
