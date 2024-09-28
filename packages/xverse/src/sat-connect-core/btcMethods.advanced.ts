// From https://github.com/secretkeylabs/sats-connect-core/

/**
 * Represents the types and interfaces related to BTC methods.
 */

import * as v from "valibot";
import {
  MethodParamsAndResult,
  rpcRequestMessageSchema,
} from "./types.advanced";
import { walletTypeSchema } from "./walletMethods.advanced";

export enum AddressPurpose {
  Ordinals = "ordinals",
  Payment = "payment",
  Stacks = "stacks",
}

export enum AddressType {
  p2pkh = "p2pkh",
  p2sh = "p2sh",
  p2wpkh = "p2wpkh",
  p2wsh = "p2wsh",
  p2tr = "p2tr",
  stacks = "stacks",
}

export const addressSchema = v.object({
  address: v.string(),
  publicKey: v.string(),
  purpose: v.enum(AddressPurpose),
  addressType: v.enum(AddressType),
});
export type Address = v.InferOutput<typeof addressSchema>;

export const getInfoMethodName = "getInfo";
export const getInfoParamsSchema = v.nullish(v.null());
export type GetInfoParams = v.InferOutput<typeof getInfoParamsSchema>;
export const getInfoResultSchema = v.object({
  /**
   * Version of the wallet.
   */
  version: v.string(),

  /**
   * [WBIP](https://wbips.netlify.app/wbips/WBIP002) methods supported by the wallet.
   */
  methods: v.optional(v.array(v.string())),

  /**
   * List of WBIP standards supported by the wallet. Not currently used.
   */
  supports: v.array(v.string()),
});
export type GetInfoResult = v.InferOutput<typeof getInfoResultSchema>;
export const getInfoRequestMessageSchema = v.object({
  ...rpcRequestMessageSchema.entries,
  ...v.object({
    method: v.literal(getInfoMethodName),
    params: getInfoParamsSchema,
    id: v.string(),
  }).entries,
});
export type GetInfoRequestMessage = v.InferOutput<
  typeof getInfoRequestMessageSchema
>;
export type GetInfo = MethodParamsAndResult<
  v.InferOutput<typeof getInfoParamsSchema>,
  v.InferOutput<typeof getInfoResultSchema>
>;

export const getAddressesMethodName = "getAddresses";
export const getAddressesParamsSchema = v.object({
  /**
   * The purposes for which to generate addresses. See
   * {@linkcode AddressPurpose} for available purposes.
   */
  purposes: v.array(v.enum(AddressPurpose)),
  /**
   * A message to be displayed to the user in the request prompt.
   */
  message: v.optional(v.string()),
});
export type GetAddressesParams = v.InferOutput<typeof getAddressesParamsSchema>;
export const getAddressesResultSchema = v.object({
  /**
   * The addresses generated for the given purposes.
   */
  addresses: v.array(addressSchema),
});
export type GetAddressesResult = v.InferOutput<typeof getAddressesResultSchema>;
export const getAddressesRequestMessageSchema = v.object({
  ...rpcRequestMessageSchema.entries,
  ...v.object({
    method: v.literal(getAddressesMethodName),
    params: getAddressesParamsSchema,
    id: v.string(),
  }).entries,
});
export type GetAddressesRequestMessage = v.InferOutput<
  typeof getAddressesRequestMessageSchema
>;
export type GetAddresses = MethodParamsAndResult<
  v.InferOutput<typeof getAddressesParamsSchema>,
  v.InferOutput<typeof getAddressesResultSchema>
>;

export const signMessageMethodName = "signMessage";

export enum MessageSigningProtocols {
  ECDSA = "ECDSA",
  BIP322 = "BIP322",
}

export const signMessageParamsSchema = v.object({
  /**
   * The address used for signing.
   **/
  address: v.string(),
  /**
   * The message to sign.
   **/
  message: v.string(),
  /**
   * The protocol to use for signing the message.
   */
  protocol: v.optional(v.enum(MessageSigningProtocols)),
});
export type SignMessageParams = v.InferOutput<typeof signMessageParamsSchema>;
export const signMessageResultSchema = v.object({
  /**
   * The signature of the message.
   */
  signature: v.string(),
  /**
   * hash of the message.
   */
  messageHash: v.string(),
  /**
   * The address used for signing.
   */
  address: v.string(),
  /**
   * The protocol to use for signing the message.
   */
  protocol: v.enum(MessageSigningProtocols),
});
export type SignMessageResult = v.InferOutput<typeof signMessageResultSchema>;
export const signMessageRequestMessageSchema = v.object({
  ...rpcRequestMessageSchema.entries,
  ...v.object({
    method: v.literal(signMessageMethodName),
    params: signMessageParamsSchema,
    id: v.string(),
  }).entries,
});
export type SignMessageRequestMessage = v.InferOutput<
  typeof signMessageRequestMessageSchema
>;
export type SignMessage = MethodParamsAndResult<
  v.InferOutput<typeof signMessageParamsSchema>,
  v.InferOutput<typeof signMessageResultSchema>
>;

type Recipient = {
  /**
   * The recipient's address.
   **/
  address: string;
  /**
   * The amount to send to the recipient in satoshis.
   */
  amount: number;
};

export type SendTransferParams = {
  /**
   * Array of recipients to send to.
   * The amount to send to each recipient is in satoshis.
   */
  recipients: Array<Recipient>;
};
type SendTransferResult = {
  /**
   * The transaction id as a hex-encoded string.
   */
  txid: string;
};

export type SendTransfer = MethodParamsAndResult<
  SendTransferParams,
  SendTransferResult
>;

export type SignPsbtParams = {
  /**
   * The base64 encoded PSBT to sign.
   */
  psbt: string;
  /**
   * The inputs to sign.
   * The key is the address and the value is an array of indexes of the inputs to sign.
   */
  signInputs: Record<string, number[]>;
  /**
   * the sigHash type to use for signing.
   * will default to the sighash type of the input if not provided.
   **/
  allowedSignHash?: number;
  /**
   * Whether to broadcast the transaction after signing.
   **/
  broadcast?: boolean;
};

export type SignPsbtResult = {
  /**
   * The base64 encoded PSBT after signing.
   */
  psbt: string;
  /**
   * The transaction id as a hex-encoded string.
   * This is only returned if the transaction was broadcast.
   **/
  txid?: string;
};

export type SignPsbt = MethodParamsAndResult<SignPsbtParams, SignPsbtResult>;

export const getAccountsMethodName = "getAccounts";
export const getAccountsParamsSchema = v.object({
  /**
   * The purposes for which to generate addresses. See
   * {@linkcode AddressPurpose} for available purposes.
   */
  purposes: v.array(v.enum(AddressPurpose)),
  /**
   * A message to be displayed to the user in the request prompt.
   */
  message: v.optional(v.string()),
});
export type GetAccountsParams = v.InferOutput<typeof getAccountsParamsSchema>;

export const getAccountsResultSchema = v.array(
  v.object({
    ...addressSchema.entries,
    ...v.object({
      walletType: walletTypeSchema,
    }).entries,
  }),
);
export type GetAccountsResult = v.InferOutput<typeof getAccountsResultSchema>;
export const getAccountsRequestMessageSchema = v.object({
  ...rpcRequestMessageSchema.entries,
  ...v.object({
    method: v.literal(getAccountsMethodName),
    params: getAccountsParamsSchema,
    id: v.string(),
  }).entries,
});
export type GetAccountsRequestMessage = v.InferOutput<
  typeof getAccountsRequestMessageSchema
>;
export type GetAccounts = MethodParamsAndResult<
  v.InferOutput<typeof getAccountsParamsSchema>,
  v.InferOutput<typeof getAccountsResultSchema>
>;

export const getBalanceMethodName = "getBalance";
export const getBalanceParamsSchema = v.nullish(v.null());
export const getBalanceResultSchema = v.object({
  /**
   * The confirmed balance of the wallet in sats. Using a string due to chrome
   * messages not supporting bigint
   * (https://issues.chromium.org/issues/40116184).
   */
  confirmed: v.string(),

  /**
   * The unconfirmed balance of the wallet in sats. Using a string due to chrome
   * messages not supporting bigint
   * (https://issues.chromium.org/issues/40116184).
   */
  unconfirmed: v.string(),

  /**
   * The total balance (both confirmed and unconfrimed UTXOs) of the wallet in
   * sats. Using a string due to chrome messages not supporting bigint
   * (https://issues.chromium.org/issues/40116184).
   */
  total: v.string(),
});
export const getBalanceRequestMessageSchema = v.object({
  ...rpcRequestMessageSchema.entries,
  ...v.object({
    method: v.literal(getBalanceMethodName),
    id: v.string(),
  }).entries,
});
export type GetBalance = MethodParamsAndResult<
  v.InferOutput<typeof getBalanceParamsSchema>,
  v.InferOutput<typeof getBalanceResultSchema>
>;
