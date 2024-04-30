export interface Provider {
  requestAccounts(): Promise<string[]>;
  getAccounts(): Promise<string[]>;
  getPublicKey(): Promise<string>;
  signMessage(msg: string, type: "ecdsa" | "bip322-simple"): Promise<string>;

  on: OnMethod;
  removeListener(
    eventName: string,
    listener: (...args: unknown[]) => unknown,
  ): Provider;
}

export interface OnMethod {
  (eventName: string, listener: (...args: unknown[]) => unknown): Provider;
}
