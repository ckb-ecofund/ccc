import { ccc, Client, ScriptLike } from "@ckb-ccc/core";
import { initConfig } from "@joyid/ckb";
import { connect as joyidConnect } from "@joyid/ckb";


/**
 * A class extending SignerCkbScriptReadonly that provides additional functionalities.
 */
export class Signer extends ccc.SignerCkbScriptReadonly {
  
  /**
   * Creates an instance of Signer.
   *
   * @param client - The client instance used for communication.
   * @param script - The script associated with the signer.
   */
  constructor(client: Client, script: ScriptLike) {
    super(client, script);
  }

  async connect():Promise<void> {
    initConfig({
      network: process.env.NODE_ENV === 'development' ? 'testnet': 'mainnet'
    })
    await joyidConnect();
  }

  /**
   * Replace the client and return a new instance of Signer.
   *
   * @param client - The new client instance.
   * @returns A promise that resolves to a new Signer instance.
   */
  async replaceClient(client: Client): Promise<Signer> {
    const script = (this as any).script as ScriptLike;
    return new Signer(client, script);
  }

  // Add any additional methods or override existing methods here
  // For example, if you want to add a signTransaction method, you can define it like this:

  /**
   * Sign a transaction.
   *
   * @param transaction - The transaction to be signed.
   * @returns A promise that resolves to the signed transaction.
   */
  async signTransaction(transaction: any): Promise<any> {
    // Implement your signing logic here
    throw new Error("Signing operation is not supported in read-only mode.");
  }
}
