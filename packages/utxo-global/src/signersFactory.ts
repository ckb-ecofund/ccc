import { ccc } from "@ckb-ccc/core";
import { Provider } from "./advancedBarrel.js";
import { SignerBtc } from "./btc/index.js";
import { SignerCkb } from "./ckb/index.js";

/**
 * @public
 */
const UTXO_GLOBAL_SIGNERS: ccc.SignerInfo[] = [];
export function getUtxoGlobalSigners(
  client: ccc.Client,
  preferredNetworks?: ccc.NetworkPreference[],
): ccc.SignerInfo[] {
  const windowRef = window as {
    utxoGlobal?: {
      bitcoinSigner: Provider;
      ckbSigner: Provider;
    };
  };

  if (typeof windowRef.utxoGlobal === "undefined") {
    return [];
  }

  if (UTXO_GLOBAL_SIGNERS.length === 0) {
    UTXO_GLOBAL_SIGNERS.push(
      ...[
        {
          name: "CKB",
          signer: new SignerCkb(client, windowRef.utxoGlobal.ckbSigner),
        },
        {
          name: "BTC",
          signer: new SignerBtc(
            client,
            windowRef.utxoGlobal.bitcoinSigner,
            preferredNetworks,
          ),
        },
      ],
    );
  }

  return UTXO_GLOBAL_SIGNERS.map((item) => {
    item.signer.client = client;
    return item;
  });
}
