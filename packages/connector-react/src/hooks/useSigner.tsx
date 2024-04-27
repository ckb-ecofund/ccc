import { useCcc } from "./useCcc";

export function useSigner() {
  return useCcc().signerInfo?.signer;
}
