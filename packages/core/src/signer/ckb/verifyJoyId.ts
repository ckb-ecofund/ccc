import { verifySignature } from "@joyid/ckb";
import { BytesLike } from "../../bytes/index.js";
import { hexFrom } from "../../hex/index.js";

export function verifyMessageJoyId(
  message: string | BytesLike,
  signature: string,
  identity: string,
): Promise<boolean> {
  const challenge =
    typeof message === "string" ? message : hexFrom(message).slice(2);
  const { publicKey, keyType } = JSON.parse(identity);

  return verifySignature({
    challenge,
    pubkey: publicKey,
    keyType,
    ...JSON.parse(signature),
  });
}
