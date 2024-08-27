import { verifyMessage } from "ethers";
import { BytesLike, bytesFrom } from "../../bytes/index.js";

/**
 * @public
 */
export function verifyMessageEvmPersonal(
  message: string | BytesLike,
  signature: string,
  address: string,
): boolean {
  return (
    address.toLowerCase() ===
    verifyMessage(
      typeof message === "string" ? message : bytesFrom(message),
      signature,
    ).toLowerCase()
  );
}
