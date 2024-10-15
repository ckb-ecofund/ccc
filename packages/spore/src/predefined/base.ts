import { ccc } from "@ckb-ccc/core";

export const COBUILD_INFO_HASH = ccc.hashCkb(
  ccc.bytesFrom("hello, cobuild", "utf8"),
);

export enum SporeScript {
  Spore = "spore",
  Cluster = "cluster",
}

export enum SporeVersion {
  V1 = "V1",
  V2 = "V2",
  DID = "DID",
}

export const SPORE_DEFAULT_VERSION = SporeVersion.V2;

export type ScriptInfo = Pick<ccc.Script, "codeHash" | "hashType"> & {
  cellDeps: ccc.CellDepInfoLike[];
  dynamicCelldep?: ccc.ScriptLike;
  cobuild?: boolean;
};

export type SporeScriptInfo = Record<
  SporeScript,
  Record<SporeVersion, ScriptInfo | undefined>
>;
