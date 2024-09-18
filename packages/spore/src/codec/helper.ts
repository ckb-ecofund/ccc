import { ccc } from "@ckb-ccc/core";
import { bytes, BytesLike } from "@ckb-lumos/codec";

export function bytifyRawString(text: string): Uint8Array {
  return ccc.bytesFrom(text, "utf8");
}

export function bufferToRawString(source: BytesLike): string {
  const buffer = bytes.bytify(source);
  return ccc.bytesTo(buffer, "utf8");
}

export function hexify(raw: string | undefined): ccc.Hex | undefined {
  if (!raw) {
    return undefined;
  }
  return ccc.hexFrom(raw);
}
