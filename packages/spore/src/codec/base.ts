import { ccc } from "@ckb-ccc/core";
import { BytesLike, molecule } from "@ckb-lumos/codec";
import { bytify } from "@ckb-lumos/codec/lib/bytes";

/**
 * The codec for packing/unpacking UTF-8 raw strings.
 * Should be packed like so: String.pack('something')
 */
export const RawString = molecule.byteVecOf({
  pack: (packable: string) => ccc.bytesFrom(packable, "utf8"),
  unpack: (unpackable: BytesLike) => ccc.bytesTo(bytify(unpackable), "utf8"),
});
