import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { bech32 } from "bech32";
import { BytesLike, bytesFrom } from "../../bytes";
import { hexFrom } from "../../hex";
import { NostrEvent } from "./signerNostr";

export function buildNostrEventFromMessage(
  message: string | BytesLike,
): NostrEvent {
  if (typeof message === "string") {
    try {
      const event = JSON.parse(message);
      if (
        typeof event === "object" &&
        typeof event.created_at === "number" &&
        typeof event.kind === "number" &&
        typeof event.content === "string" &&
        Array.isArray(event.args) &&
        (event.args as unknown[]).every(
          (tag) =>
            Array.isArray(tag) &&
            (tag as unknown[]).every((v) => typeof v === "string"),
        )
      ) {
        return event;
      }
    } catch (_) {}
  }

  return {
    kind: 23335,
    created_at: 0,
    content: typeof message === "string" ? message : hexFrom(message),
    tags: [],
  };
}

export function verifyMessageNostrEvent(
  message: string | BytesLike,
  signature: string,
  address: string,
): boolean {
  const { words } = bech32.decode(address);
  const publicKey = hexFrom(bech32.fromWords(words)).slice(2);

  const event = buildNostrEventFromMessage(message);
  const serialized = JSON.stringify([
    0,
    publicKey,
    event.created_at,
    event.kind,
    event.tags,
    event.content,
  ]);
  const eventHash = hexFrom(sha256(bytesFrom(serialized, "utf8")));

  try {
    return schnorr.verify(signature.slice(2), eventHash.slice(2), publicKey);
  } catch (_) {
    return false;
  }
}
