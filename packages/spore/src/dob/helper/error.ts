const errors = {
  1001: "DnaLengthNotMatch",
  1002: "SporeIdLengthInvalid",
  1003: "NativeDecoderNotFound",
  1004: "SporeIdNotFound",
  1005: "SporeDataUncompatible",
  1006: "SporeDataContentTypeUncompatible",
  1007: "DOBVersionUnexpected",
  1008: "ClusterIdNotSet",
  1009: "ClusterIdNotFound",
  1010: "ClusterDataUncompatible",
  1011: "DecoderIdNotFound",
  1012: "DecoderOutputInvalid",
  1013: "HexedDNAParseError",
  1014: "HexedSporeIdParseError",
  1015: "DecoderBinaryPathInvalid",
  1016: "DecoderExecutionError",
  1017: "DecoderExecutionInternalError",
  1018: "FetchLiveCellsError",
  1019: "FetchTransactionError",
  1020: "NoOutputCellInTransaction",
  1021: "DOBContentUnexpected",
  1022: "DOBMetadataUnexpected",
  1023: "DOBRenderCacheNotFound",
  1024: "DOBRenderCacheModified",
  1025: "DecoderBinaryHashInvalid",
  1026: "DecoderBinaryNotFoundInCell",
  1027: "JsonRpcRequestError",
  1028: "SystemTimeError",
  1029: "DecoderHashNotFound",
  1030: "DecoderScriptNotFound",
  1031: "DecoderChainIsEmpty",
};

export function getErrorByCode(code: number): string {
  const errorIndex = Object.keys(errors).indexOf(code.toString());
  if (errorIndex < 0) {
    throw new Error(`Error code ${code} not found`);
  }
  return Object.values(errors)[errorIndex];
}
