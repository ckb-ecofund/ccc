import { secp256k1 } from "@noble/curves/secp256k1";
import { BytesLike, bytesFrom } from "../../bytes";
import { hashCkb } from "../../hasher";
import { Hex, hexFrom } from "../../hex";
import { numFrom } from "../../num";

export function messageHashCkbSecp256k1(message: string | BytesLike): Hex {
  const msg = typeof message === "string" ? message : hexFrom(message);
  const buffer = bytesFrom(`Nervos Message:${msg}`, "utf8");
  return hashCkb(buffer);
}

export function verifyMessageCkbSecp256k1(
  message: string | BytesLike,
  signature: string,
  publicKey: string,
): boolean {
  const signatureBytes = bytesFrom(signature);
  return secp256k1.verify(
    new secp256k1.Signature(
      numFrom(signatureBytes.slice(0, 32)),
      numFrom(signatureBytes.slice(32, 64)),
    ).addRecoveryBit(Number(numFrom(signatureBytes.slice(64, 65)))),
    bytesFrom(messageHashCkbSecp256k1(message)),
    bytesFrom(publicKey),
  );
}
