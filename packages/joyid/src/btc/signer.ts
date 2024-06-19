import { ccc } from '@ckb-ccc/core';
import { Provider } from './joyid-btc.advanced';
import { getPublicKey as getJoyIDPublicKey, initConfig, requestAccounts, getAccounts, signMessage } from '@joyid/bitcoin';

export class BitcoinSigner extends ccc.SignerBtc {
  constructor(
    client: ccc.Client,
    public readonly provider: Provider,
  ) {
    super(client);
  }
  
  async getBtcAccount(): Promise<string> {
    initConfig({
      name: "ccc wallet connect",
      joyidAppURL: process.env.NODE_ENV === "development" ? "https://testnet.joyid.dev" : "https://app.joy.id",
      requestAddressType: 'p2tr',
    });
    const accounts = await getAccounts();
    return accounts[0];
  }

  async getBtcPublicKey(): Promise<ccc.HexLike> {
    initConfig({
      name: "ccc wallet connect",
      joyidAppURL: process.env.NODE_ENV === "development" ? "https://testnet.joyid.dev" : "https://app.joy.id",
      requestAddressType: 'p2tr',
    });
    const publicKey = await getJoyIDPublicKey();
    return publicKey!!;
  }

  async replaceClient(client: ccc.Client): Promise<ccc.Signer> {
    return new BitcoinSigner(client, this.provider);
  }

  async connect(): Promise<void> {
    initConfig({
      name: "ccc wallet connect",
      joyidAppURL: process.env.NODE_ENV === "development" ? "https://testnet.joyid.dev" : "https://app.joy.id",
      requestAddressType: 'p2tr',
    });
    await requestAccounts();
  }

  async isConnected(): Promise<boolean> {
    initConfig({
      name: "ccc wallet connect",
      joyidAppURL: process.env.NODE_ENV === "development" ? "https://testnet.joyid.dev" : "https://app.joy.id",
      requestAddressType: 'p2tr',
    });
    const accounts = await getAccounts();
    return accounts[0] ? true : false;
  }

  async signBTCMessage(message: string):Promise<string|null> {
    initConfig({
      name: "ccc wallet connect",
      joyidAppURL: process.env.NODE_ENV === "development" ? "https://testnet.joyid.dev" : "https://app.joy.id",
      requestAddressType: 'p2tr',
    });
    const res = await signMessage(message);
    return res
  } 
}
