import { ccc } from '@ckb-ccc/core';
import { Provider } from './joyid.btc.advanced';
import { getPublicKey as getJoyIDPublicKey, initConfig, requestAccounts, getAccounts, signMessage as signBtcMessage } from '@joyid/bitcoin';

export class BitcoinSigner extends ccc.SignerBtc {
  constructor(
    client: ccc.Client,
  ) {
    super(client);
  }

  async initJoyidConfig() {
    initConfig({
      joyidAppURL: await this.client.getAddressPrefix() === "ckt" ? "https://testnet.joyid.dev" : "https://app.joy.id",
      requestAddressType: 'p2tr',
    });
  }
  
  async getBtcAccount(): Promise<string> {
    await this.initJoyidConfig();
    const accounts = await getAccounts();
    return accounts[0];
  }

  async getBtcPublicKey(): Promise<ccc.HexLike> {
        await this.initJoyidConfig();

    const publicKey = await getJoyIDPublicKey();
    return publicKey!!;
  }

  async replaceClient(client: ccc.Client): Promise<ccc.Signer> {
    return new BitcoinSigner(client);
  }

  async connect(): Promise<void> {
    await this.initJoyidConfig();
    await requestAccounts();
  }

  async isConnected(): Promise<boolean> {
    await this.initJoyidConfig();
    const accounts = await getAccounts();
    return accounts[0] ? true : false;
  }

  async signMessage(_: string | ccc.BytesLike): Promise<string> {
    const message = await signBtcMessage(_ as string);
    return message
  }
}
