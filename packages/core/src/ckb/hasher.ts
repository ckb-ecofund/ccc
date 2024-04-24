import blake2b, { Blake2b } from "blake2b";
import { BytesLike, Hex } from "../primitive";
import { encodeUtf8, toBytes } from "../bytes";
import { CKB_BLAKE2B_PERSONAL } from "./hasher.advanced";

export class Hasher {
  hasher: Blake2b;

  constructor(outLength = 32, personal = CKB_BLAKE2B_PERSONAL) {
    this.hasher = blake2b(
      outLength,
      undefined,
      undefined,
      encodeUtf8(personal),
    );
  }

  update(data: BytesLike): Hasher {
    this.hasher.update(toBytes(data));
    return this;
  }

  digest(): Hex {
    return `0x${this.hasher.digest("hex")}`;
  }
}

export function ckbHash(data: BytesLike): Hex {
  return new Hasher().update(data).digest();
}
