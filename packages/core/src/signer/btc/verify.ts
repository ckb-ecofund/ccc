import { secp256k1 } from "@noble/curves/secp256k1";
import { magicHash } from "bitcoinjs-message";
import { BytesLike, bytesFrom } from "../../bytes";
import { hexFrom } from "../../hex";

export function verifyMessageBtcEcdsa(
  message: string | BytesLike,
  signature: string,
  publicKey: string,
): boolean {
  const challenge =
    typeof message === "string" ? message : hexFrom(message).slice(2);

  const [_, ...rawSign] = bytesFrom(signature, "base64");

  return secp256k1.verify(bytesFrom(rawSign), magicHash(challenge), publicKey);
}
