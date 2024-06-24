import { verifyMessage } from "@unisat/wallet-utils";
import { BytesLike } from "../../bytes";
import { hexFrom } from "../../hex";

export function verifyMessageBtcEcdsa(
  message: string | BytesLike,
  signature: string,
  publicKey: string,
): boolean {
  const challenge =
    typeof message === "string" ? message : hexFrom(message).slice(2);

  return verifyMessage(publicKey, challenge, signature);
}
