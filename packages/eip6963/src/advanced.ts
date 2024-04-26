import { Hex } from "@ckb-ccc/core";

export interface EIP6963AnnounceProviderEvent {
  detail: EIP6963ProviderDetail;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

export interface EIP6963ProviderInfo {
  rdns: string;
  uuid: string;
  name: string;
  icon: string;
}

export interface EIP1193Provider {
  request: EIP1193RequestMethod;
  on: EIP1193OnMethod;
  removeListener(
    eventName: string,
    listener: (...args: unknown[]) => unknown,
  ): EIP1193Provider;
}

export interface EIP1193RequestMethod {
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

export interface EIP1193OnMethod {
  (
    eventName: string,
    listener: (...args: unknown[]) => unknown,
  ): EIP1193Provider;
}
