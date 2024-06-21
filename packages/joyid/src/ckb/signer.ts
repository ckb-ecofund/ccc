import { Address, bytesFrom, ccc, Client, numToBytes, numToHex } from "@ckb-ccc/core";
import { Transaction as LumosTransaction } from '@ckb-lumos/base';
import {
  initConfig,
  connect as joyIdConnect,
  signRawTransaction,
} from "@joyid/ckb";

/**
 * A class extending SignerCkbScriptReadonly that provides additional functionalities.
 */
export class Signer extends ccc.Signer {
  private address: string;
  private authData: any;

  /**
   * Creates an instance of Signer.
   *
   * @param client - The client instance used for communication.
   * @param script - The script associated with the signer.
   */

  constructor(client: Client) {
    super(client);
    this.address = "";
    this.authData = {};
  }

  private async initJoyidConfig(): Promise<void> {
    const prefix = await this.client.getAddressPrefix();
    initConfig({
      joyidAppURL:
        prefix === "ckt" ? "https://testnet.joyid.dev" : "https://app.joy.id/",
    });
  }

  async connect(): Promise<void> {
    await this.initJoyidConfig();
    const addressInfo = await joyIdConnect();
    this.address = addressInfo.address;
    this.authData = addressInfo;
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

  async signOnlyTransaction(_: ccc.TransactionLike): Promise<ccc.Transaction> {
    const tx = JSON.parse(JSON.stringify(_, (key, value) => {
      if (typeof value === 'bigint') {
        return numToHex(value)
      }
      return value
    }))
    const signedTx = await signRawTransaction(tx, this.address);
    return ccc.Transaction.from(signedTx);
  }

  async sendTransaction(tx: ccc.TransactionLike): Promise<ccc.Hex> {
    return this.client.sendTransaction(await this.signOnlyTransaction(tx));
  }
}
