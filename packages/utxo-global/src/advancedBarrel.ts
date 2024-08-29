export interface Provider {
  requestAccounts(): Promise<string[]>;
  getAccount(): Promise<string[]>;
  getPublicKey(): Promise<{ address: string; publicKey: string }[]>;
  connect(): Promise<void>;
  isConnected(): Promise<boolean>;
  signMessage(msg: string, address: string): Promise<string>;
  signTransaction(tx: any): Promise<any>;
  getNetwork(): Promise<string>;
  switchNetwork(network: string): Promise<void>;

  on: OnMethod;
  removeListener(
    eventName: string,
    listener: (...args: unknown[]) => unknown,
  ): Provider;
}

export interface OnMethod {
  (eventName: string, listener: (...args: unknown[]) => unknown): Provider;
}
