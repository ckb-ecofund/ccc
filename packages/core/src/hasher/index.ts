import blake2b, { Blake2b } from "blake2b";
import { BytesLike, bytesFrom } from "../bytes";
import { Hex } from "../hex";
import { CKB_BLAKE2B_PERSONAL } from "./advanced";

export class Hasher {
  hasher: Blake2b;

  constructor(outLength = 32, personal = CKB_BLAKE2B_PERSONAL) {
    this.hasher = blake2b(
      outLength,
      undefined,
      undefined,
      bytesFrom(personal, "utf8"),
    );
  }

  update(data: BytesLike): Hasher {
    this.hasher.update(bytesFrom(data));
    return this;
  }

  digest(): Hex {
    return `0x${this.hasher.digest("hex")}`;
  }
}

export function ckbHash(data: BytesLike): Hex {
  return new Hasher().update(data).digest();
}
