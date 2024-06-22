import { ccc } from "@ckb-ccc/core";
import { BitcoinSigner } from "../btc";
import { CkbSigner } from "../ckb";

export function getJoyIdSigners(client: ccc.Client): ccc.SignerInfo[] {
  return [
    {
      type: ccc.SignerType.CKB,
      name: "CKB",
      signer: new CkbSigner(client),
    },
    {
      type: ccc.SignerType.BTC,
      name: "BTC",
      signer: new BitcoinSigner(client),
    },
    {
      type: ccc.SignerType.BTC,
      name: "BTC (P2WPKH)",
      signer: new BitcoinSigner(client, "p2wpkh"),
    },
    {
      type: ccc.SignerType.BTC,
      name: "BTC (P2TR)",
      signer: new BitcoinSigner(client, "p2tr"),
    },
  ];
}
