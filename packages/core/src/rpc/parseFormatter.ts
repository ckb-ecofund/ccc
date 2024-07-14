import { ScriptLike } from "../ckb";
import { GetCellsSearchKey, GetTransactionsSearchKey, SearchFilter, SearchKey } from "./rpc.advanced";

export function toCamel(s: string): string {
  return s.replace(/([-_][a-z])/gi, match => match[1].toUpperCase());
}

export function deepCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(deepCamel);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = toCamel(key);
      result[camelKey] = deepCamel((obj as Record<string, unknown>)[key]);
      return result;
    }, {} as Record<string, unknown>);
  } else {
    return obj;
  }
}

const toScript = (data: ScriptLike): ScriptLike => ({
  codeHash: data.codeHash,
  hashType: data.hashType,
  args: data.args,
});

const toSearchFilter = (data: SearchFilter): SearchFilter => ({
  script: data.script ? toScript(data.script) : undefined,
  outputDataLenRange: data.outputDataLenRange,
  outputCapacityRange: data.outputCapacityRange,
  blockRange: data.blockRange,
  scriptLenRange: data.scriptLenRange,
});

const toSearchKey = (data: SearchKey): SearchKey => ({
  script: toScript(data.script),
  scriptType: data.scriptType,
  filter: data.filter ? toSearchFilter(data.filter) : undefined,
  scriptSearchMode: data.scriptSearchMode ?? "prefix",
});

const convert = <T, R>(data: T, converter: (data: T) => R): R => {
  return converter(data);
};

const toGetCellsSearchKey = (data: GetCellsSearchKey): GetCellsSearchKey => {
  return {
    ...convert(data, toSearchKey),
    withData: data.withData,
  };
};

const toGetTransactionsSearchKey = (
  data: GetTransactionsSearchKey<boolean>
): GetTransactionsSearchKey => {
  return {
    ...convert(data, toSearchKey),
    groupByTransaction: data.groupByTransaction,
  };
};

export {
  toScript,
  toSearchKey,
  toGetCellsSearchKey,
  toGetTransactionsSearchKey,
  toSearchFilter,
};