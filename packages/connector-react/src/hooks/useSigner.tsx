import { ccc } from "..";
import { useCcc } from "./useCcc";

export function useSigner(): ccc.Signer | undefined {
  return useCcc().signerInfo?.signer;
}
