import { ccc } from "@ckb-ccc/core";
import { Provider } from "./advancedBarrel";
import { SignerBtc } from "./btc";
import { SignerCkb } from "./ckb";

export function getUtxoGlobalSigners(client: ccc.Client): ccc.SignerInfo[] {
  const windowRef = window as {
    utxoGlobal?: {
      bitcoinSigner: Provider;
      ckbSigner: Provider;
    };
  };

  if (typeof windowRef.utxoGlobal === "undefined") {
    return [];
  }

  return [
    {
      name: "CKB",
      signer: new SignerCkb(client, windowRef.utxoGlobal.ckbSigner),
    },
    {
      name: "BTC",
      signer: new SignerBtc(client, windowRef.utxoGlobal.bitcoinSigner),
    },
  ];
}
