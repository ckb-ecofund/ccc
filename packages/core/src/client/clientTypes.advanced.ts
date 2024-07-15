import { ScriptLike } from "../ckb";
import { HexLike } from "../hex";
import { Num, numFrom, NumLike } from "../num";

export function clientSearchKeyRangeFrom([a, b]: [NumLike, NumLike]): [
  Num,
  Num,
] {
  return [numFrom(a), numFrom(b)];
}

export type ClientCollectableSearchKeyFilterLike = {
  script?: ScriptLike;
  scriptLenRange?: [NumLike, NumLike];
  outputData?: HexLike;
  outputDataSearchMode?: "prefix" | "exact" | "partial";
  outputDataLenRange?: [NumLike, NumLike];
  outputCapacityRange?: [NumLike, NumLike];
};
export type ClientCollectableSearchKeyLike = {
  script: ScriptLike;
  scriptType: "lock" | "type";
  scriptSearchMode: "prefix" | "exact" | "partial";
  filter?: ClientCollectableSearchKeyFilterLike;
  withData?: boolean;
};
