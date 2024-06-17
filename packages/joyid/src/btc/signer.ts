import { ccc } from '@ckb-ccc/core';
import { Provider } from './joyid-btc.advanced';
import { getPublicKey as getJoyIDPublicKey, initConfig, requestAccounts } from '@joyid/bitcoin';

export class BitcoinSigner extends ccc.SignerBtc {
  private static configInitialized = false;

  constructor(
    client: ccc.Client,
    public readonly provider: Provider,
  ) {
    super(client);
    if (!BitcoinSigner.configInitialized) {
      initConfig({
        name: "ccc wallet connect",
        joyidAppURL: process.env.NODE_ENV === "development" ? "https://testnet.joyid.dev" : "https://app.joy.id",
        requestAddressType: 'p2tr',
      });
      BitcoinSigner.configInitialized = true;
    }
  }
  
  async getBtcAccount(): Promise<string> {
    try {
      let accounts = await requestAccounts();
      if (accounts && accounts.length > 0) {
        return accounts[0];
      }
      throw new Error('No accounts found.');
    } catch (error) {
      throw new Error(`Get BTC Account Error: ${error}`);
    }
  }

  async getBtcPublicKey(): Promise<ccc.HexLike> {
    try {
      let publicKey = await getJoyIDPublicKey();
      if (publicKey) {
        return publicKey;
      }
      throw new Error('Get JoyID Public Key ERROR.');
    } catch (error) {
      throw new Error(`Get BTC Public Key Error: ${error}`);
    }
  }

  async replaceClient(client: ccc.Client): Promise<ccc.Signer> {
    return new BitcoinSigner(client, this.provider);
  }

  async connect(): Promise<void> {
    try {
      await requestAccounts();
    } catch (error) {
      throw new Error(`Connect Error: ${error}`);
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      let accounts = await requestAccounts();
      return accounts && accounts.length > 0;
    } catch (error) {
      return false;
    }
  }
}
