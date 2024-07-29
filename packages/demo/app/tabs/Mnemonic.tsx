import {
  ccc,
  hexFrom,
  SignerMnemonicphrase,
  useCcc,
} from "@ckb-ccc/connector-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { TextInput } from "../components/Input";
import * as hd from "@ckb-lumos/hd";
import { HDKey } from "@scure/bip32";
import {
  mnemonicToSeedSync,
  generateMnemonic as bip39GenerateMnemonic,
} from "@scure/bip39";
import * as english from "@scure/bip39/wordlists/english";
import { secp256k1 } from "@noble/curves/secp256k1";

export function Mnemonic() {
  const { client } = useCcc();

  const MnemonicSigner = new ccc.SignerMnemonicphrase(client);
  const [mnemonic, setMnemonic] = useState<string>(
    MnemonicSigner.getMnemonic(),
  );
  const [countStr, setCountStr] = useState<string>("10");
  const [hdPath, setHdPath] = useState<string>("m/44'/309'/0'/0/0");
  const [accounts, setAccount] = useState<
    {
      publicKey: string;
      privateKey: string;
      address: string;
      path: string;
    }[]
  >([]);

  const isValid = useMemo(
    () => hd.mnemonic.validateMnemonic(mnemonic),
    [mnemonic],
  );

  const generateMnemonic = (strength: 128 | 160 | 192 | 224 | 256 = 128) => {
    setMnemonic(bip39GenerateMnemonic(english.wordlist, strength));
  };

  const derivePrivateKey = (mnemonic: string, hdPath: string): string => {
    const seed = mnemonicToSeedSync(mnemonic);
    const hdKey = HDKey.fromMasterSeed(seed);
    const derivedKey = hdKey.derive(hdPath);

    if (!derivedKey.privateKey) {
      throw new Error("Failed to derive private key from mnemonic");
    }

    return hexFrom(derivedKey.privateKey);
  };

  const getSeed = (_mnemonic: string): Uint8Array => {
    return mnemonicToSeedSync(_mnemonic);
  };

  const getSeedHex = (_mnemonic: string): string => {
    const seed = getSeed(mnemonic);
    return hexFrom(seed);
  };

  const expendPrivateKey = (
    count: number,
    startIndex: number = 0,
    seed?: Uint8Array,
  ): Array<{ publicKey: string; privateKey: string; path: string }> => {
    let hdKey: HDKey;

    if (seed) {
      hdKey = HDKey.fromMasterSeed(seed);
    } else {
      hdKey = HDKey.fromMasterSeed(getSeed(mnemonic));
    }

    return Array.from({ length: count }, (_, i) => {
      const index = startIndex + i;
      const path = `${hdPath.slice(0, -1)}${index}`;
      const expendedPrivatekey = hdKey.derive(path);

      if (!expendedPrivatekey.privateKey) {
        throw new Error(`Failed to derive private key for path: ${path}`);
      }

      const privateKey = hexFrom(expendedPrivatekey.privateKey);
      const publicKey = hexFrom(
        secp256k1.getPublicKey(expendedPrivatekey.privateKey, true),
      );

      return { publicKey, privateKey, path };
    });
  };

  const generateMoreAccounts = () => {
    const count = parseInt(countStr, 10);
    if (isNaN(count)) return;

    const newAccounts = expendPrivateKey(count, accounts.length);
    setAccount((prevAccounts) => [
      ...prevAccounts,
      ...newAccounts.map((account) => ({
        ...account,
        address: "",
      })),
    ]);
  };

  useEffect(() => setAccount([]), [mnemonic]);

  useEffect(() => {
    (async () => {
      let modified = false;
      const newAccounts = await Promise.all(
        accounts.map(async (acc) => {
          const address = await new ccc.SignerCkbPublicKey(
            client,
            acc.publicKey,
          ).getRecommendedAddress();
          if (address !== acc.address) {
            modified = true;
          }
          acc.address = address;
          return acc;
        }),
      );
      if (modified) {
        setAccount(newAccounts);
      }
    })();
  }, [client, accounts]);

  return (
    <div className="mb-1 flex w-full flex-col items-center">
      <TextInput
        className="mb-1 w-9/12"
        placeholder="Mnemonic"
        state={[mnemonic, setMnemonic]}
      />
      <TextInput
        className="mb-1 w-9/12"
        placeholder="Accounts count"
        state={[countStr, setCountStr]}
      />
      <div className="flex">
        <Button
          onClick={() => {
            generateMnemonic();
          }}
        >
          Generate Random Mnemonic
        </Button>
        <Button
          className="ml-2"
          onClick={async () => {
            generateMoreAccounts();
          }}
          disabled={!isValid || Number.isNaN(parseInt(countStr, 10))}
        >
          Generate more accounts
        </Button>
      </div>
      {accounts.length !== 0 ? (
        <div className="mt-2 w-full overflow-scroll whitespace-nowrap">
          <p>path, address, private key</p>
          {accounts.map(({ privateKey, address, path }) => (
            <p key={path}>
              {path}, {address}, {privateKey}
            </p>
          ))}
        </div>
      ) : undefined}
    </div>
  );
}
