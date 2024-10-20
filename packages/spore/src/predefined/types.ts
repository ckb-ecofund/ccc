import { ccc } from "@ckb-ccc/core";

export const DEFAULT_COBUILD_INFO_HASH = ccc.hashCkb(
  ccc.bytesFrom("CCC_DEFAULT_COBUILD_INFO", "utf8"),
);

export enum SporeVersion {
  V1 = "V1",
  V2 = "V2",
  DID = "DID",
}

export const SPORE_VERSION_DEFAULT = SporeVersion.V2;

export type SporeScriptInfoLike = ccc.ScriptInfoLike & {
  cobuild?: boolean;
};

export class SporeScriptInfo extends ccc.ScriptInfo {
  constructor(
    codeHash: ccc.Hex,
    hashType: ccc.HashType,
    cellDeps: ccc.CellDepInfo[],
    public cobuild?: boolean,
  ) {
    super(codeHash, hashType, cellDeps);
  }

  static from(scriptInfoLike: SporeScriptInfoLike): SporeScriptInfo {
    return new SporeScriptInfo(
      ccc.hexFrom(scriptInfoLike.codeHash),
      ccc.hashTypeFrom(scriptInfoLike.hashType),
      scriptInfoLike.cellDeps.map((c) => ccc.CellDepInfo.from(c)),
      scriptInfoLike.cobuild,
    );
  }
}
