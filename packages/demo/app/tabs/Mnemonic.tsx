import { ccc, hexFrom, useCcc } from "@ckb-ccc/connector-react";
import { useEffect, useMemo, useState } from "react";
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
  const [mnemonic, setMnemonic] = useState<string>("");
  const [countStr, setCountStr] = useState<string>("10");
  const [accounts, setAccount] = useState<
    Array<{
      publicKey: string;
      privateKey: string;
      address: string;
      path: string;
    }>
  >([]);
  const [hdPath, setHdPath] = useState<string>("m/44'/309'/0'/0/0");

  const isValid = useMemo(
    () => hd.mnemonic.validateMnemonic(mnemonic),
    [mnemonic],
  );

  function generateMnemonic(strength: 128 | 160 | 192 | 224 | 256 = 128) {
    setMnemonic(bip39GenerateMnemonic(english.wordlist, strength));
  }

  function expendPrivateKey(count: number, startIndex: number = 0) {
    const seed = mnemonicToSeedSync(mnemonic);
    const hdKey = HDKey.fromMasterSeed(seed);

    return Array.from({ length: count }, (_, i) => {
      const index = startIndex + i;
      const path = `${hdPath.slice(0, -1)}${index}`;
      const derivedKey = hdKey.derive(path);

      if (!derivedKey.privateKey) {
        throw new Error(`Failed to derive private key for path: ${path}`);
      }

      const privateKey = hexFrom(derivedKey.privateKey);
      const publicKey = hexFrom(
        secp256k1.getPublicKey(derivedKey.privateKey, true),
      );

      return { publicKey, privateKey, path, address: "" };
    });
  }

  function generateMoreAccounts() {
    const count = parseInt(countStr, 10);
    if (isNaN(count)) return;

    const newAccounts = expendPrivateKey(count, accounts.length);
    setAccount((prevAccounts) => [...prevAccounts, ...newAccounts]);
  }

  useEffect(() => {
    generateMnemonic();
  }, []);

  useEffect(() => {
    setAccount([]);
  }, [mnemonic]);

  useEffect(() => {
    if (!client) return;
    (async () => {
      const newAccounts = await Promise.all(
        accounts.map(async (acc) => ({
          ...acc,
          address: await new ccc.SignerCkbPublicKey(
            client,
            acc.publicKey,
          ).getRecommendedAddress(),
        })),
      );
      setAccount(newAccounts);
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
        <Button onClick={() => generateMnemonic()}>
          Generate Random Mnemonic
        </Button>
        <Button
          className="ml-2"
          onClick={generateMoreAccounts}
          disabled={!isValid || Number.isNaN(parseInt(countStr, 10))}
        >
          Generate more accounts
        </Button>
      </div>
      {accounts.length > 0 && (
        <div className="mt-2 w-full overflow-scroll whitespace-nowrap">
          <p>path, address, private key</p>
          {accounts.map(({ privateKey, address, path }) => (
            <p key={path}>
              {path}, {address}, {privateKey}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
