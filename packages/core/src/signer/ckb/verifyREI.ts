import { secp256k1 } from "@noble/curves/secp256k1";
import { BytesLike, bytesFrom } from "../../bytes/index.js";
import { hashCkb } from "../../hasher/index.js";
import { Hex, hexFrom } from "../../hex/index.js";
import { numFrom } from "../../num/index.js";

export function messageHashREI(message: string | BytesLike): string {
  const msg = typeof message === "string" ? message : hexFrom(message);
  let newMessage
  if (!/^0x([0-9a-fA-F][0-9a-fA-F])*$/.test(msg)) {

    const buffer = bytesFrom(message, "utf8");
    newMessage = hashCkb(buffer);
  }else{
    newMessage = msg;
  }
  return newMessage;
}

export function verifyMessageREI(
    message: string | BytesLike ,
    signature: string,
    publicKey: string,
): boolean {
  const signatureBytes = bytesFrom(signature);
  return secp256k1.verify(
      new secp256k1.Signature(
          numFrom(signatureBytes.slice(0, 32)),
          numFrom(signatureBytes.slice(32, 64)),
      ).addRecoveryBit(Number(numFrom(signatureBytes.slice(64, 65)))),
      bytesFrom(messageHashREI(message)),
      bytesFrom(publicKey),
  );
}
