export const BECH32_LIMIT = 1023;

export enum AddressFormat {
  /**
   * full version identifies the hashType
   */
  Full = 0x00,
  /**
   * @deprecated
   * short version for locks with Known codeHash, deprecated
   */
  Short = 0x01,
  /**
   * @deprecated
   * full version with hashType = "Data", deprecated
   */
  FullData = 0x02,
  /**
   * @deprecated
   * full version with hashType = "Type", deprecated
   */
  FullType = 0x04,
}
