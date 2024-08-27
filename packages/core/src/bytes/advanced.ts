/**
 * Represents the possible encoding formats for converting bytes.
 * @public
 */
export type BytesFromEncoding =
  | "utf8" // UTF-8 encoding
  | "utf16le" // UTF-16 Little Endian encoding
  | "latin1" // Latin-1 (ISO-8859-1) encoding
  | "base64" // Base64 encoding
  | "base64url" // Base64 URL encoding
  | "hex" // Hexadecimal encoding
  | "ascii" // ASCII encoding
  | "binary" // Binary encoding
  | "ucs2"; // UCS-2 (alias of UTF-16LE) encoding
