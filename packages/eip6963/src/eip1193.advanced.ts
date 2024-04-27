import { Hex } from "@ckb-ccc/core";

export interface Provider {
  request: RequestMethod;
  on: OnMethod;
  removeListener(
    eventName: string,
    listener: (...args: unknown[]) => unknown,
  ): Provider;
}

export interface RequestMethod {
  (request: { method: "personal_sign"; params: [string, Hex] }): Promise<Hex>;
  (request: {
    method: "eth_requestAccounts";
    params?: undefined;
  }): Promise<Hex[]>;
  (request: { method: "eth_accounts"; params?: undefined }): Promise<Hex[]>;
  (request: {
    method: string;
    params?: Array<unknown> | Record<string, unknown>;
  }): Promise<unknown>;
}

export interface OnMethod {
  (eventName: string, listener: (...args: unknown[]) => unknown): Provider;
}
