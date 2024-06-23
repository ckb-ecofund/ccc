import { ccc } from "@ckb-ccc/core";
import { BitcoinSigner } from "../btc";
import { CkbSigner } from "../ckb";
import { EvmSigner } from "../evm";

export function getJoyIdSigners(
  client: ccc.Client,
  name: string,
  icon: string,
): ccc.SignerInfo[] {
  return [
    {
      type: ccc.SignerType.CKB,
      name: "CKB",
      signer: new CkbSigner(client, name, icon),
    },
    {
      type: ccc.SignerType.BTC,
      name: "BTC",
      signer: new BitcoinSigner(client, name, icon),
    },
    {
      type: ccc.SignerType.EVM,
      name: "EVM",
      signer: new EvmSigner(client, name, icon),
    },
    {
      type: ccc.SignerType.BTC,
      name: "BTC (P2WPKH)",
      signer: new BitcoinSigner(client, name, icon, "p2wpkh"),
    },
    {
      type: ccc.SignerType.BTC,
      name: "BTC (P2TR)",
      signer: new BitcoinSigner(client, name, icon, "p2tr"),
    },
  ];
}
