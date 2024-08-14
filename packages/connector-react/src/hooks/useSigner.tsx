import { ccc } from "@ckb-ccc/connector";
import { useCcc } from "./useCcc.js";

export function useSigner(): ccc.Signer | undefined {
  return useCcc().signerInfo?.signer;
}
