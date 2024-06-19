import { ccc, Client, ScriptLike, SignerCkbScriptReadonly, TransactionLike } from "@ckb-ccc/core";
import { initConfig, signRawTransaction } from "@joyid/ckb";
import { connect as joyidConnect } from "@joyid/ckb";
import { helpers } from '@ckb-lumos/lumos';
import { bytes, number } from '@ckb-lumos/codec';
import { blockchain } from '@ckb-lumos/base';

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
  async replaceClient(client: Client): Promise<SignerCkbScriptReadonly> {
    const script = (this as any).script as ScriptLike;
    return new SignerCkbScriptReadonly(client, script);
  }
  
  async sendTransactionWithAddress(tx: helpers.TransactionSkeletonType, address: string): Promise<ccc.Hex> {
    const txSkeleton = helpers.createTransactionFromSkeleton(tx);
    //@ts-ignore
    const signedTx = await signRawTransaction(tx, address);
    return this.client.sendTransaction(signedTx);
  }
}
