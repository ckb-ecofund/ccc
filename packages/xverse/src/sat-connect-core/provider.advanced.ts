import * as v from "valibot";
import { Params, Requests } from "./requests.advanced";
import { RpcResponse } from "./types.advanced";

// accountChange
export const accountChangeEventName = "accountChange";
export const accountChangeSchema = v.object({
  type: v.literal(accountChangeEventName),
});
export type AccountChangeEvent = v.InferOutput<typeof accountChangeSchema>;

// networkChange
export const networkChangeEventName = "networkChange";
export const networkChangeSchema = v.object({
  type: v.literal(networkChangeEventName),
});
export type NetworkChangeEvent = v.InferOutput<typeof networkChangeSchema>;

// disconnect
export const disconnectEventName = "disconnect";
export const disconnectSchema = v.object({
  type: v.literal(disconnectEventName),
});
export type DisconnectEvent = v.InferOutput<typeof disconnectSchema>;

export const walletEventSchema = v.variant("type", [
  accountChangeSchema,
  networkChangeSchema,
  disconnectSchema,
]);

export type WalletEvent = v.InferOutput<typeof walletEventSchema>;
export type AddListener = <const WalletEventName extends WalletEvent["type"]>(
  eventName: WalletEventName,
  cb: (event: Extract<WalletEvent, { type: WalletEventName }>) => void,
) => () => void;

/**
 * Interface representing a provider for interacting with accounts and signing messages.
 */
export interface BtcProvider {
  request: <Method extends keyof Requests>(
    method: Method,
    options: Params<Method>,
    providerId?: string,
  ) => Promise<RpcResponse<Method>>;

  addListener: AddListener;
}

export interface Provider {
  id: string;
  name: string;
  icon: string;
  webUrl?: string;
  chromeWebStoreUrl?: string;
  mozillaAddOnsUrl?: string;
  googlePlayStoreUrl?: string;
  iOSAppStoreUrl?: string;
  methods?: string[];
}
