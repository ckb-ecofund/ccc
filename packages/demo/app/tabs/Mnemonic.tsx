import { ccc, useCcc } from "@ckb-ccc/connector-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { TextInput } from "../components/Input";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { HDKey } from "@scure/bip32";
import { TabProps } from "../types";

export function Mnemonic({ sendMessage }: TabProps) {
  const { client } = useCcc();

  const [mnemonic, setMnemonic] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [countStr, setCountStr] = useState<string>("10");
  const [accounts, setAccount] = useState<
    {
      publicKey: string;
      privateKey: string;
      address: string;
      path: string;
    }[]
  >([]);
  const isValid = useMemo(
    () => bip39.validateMnemonic(mnemonic, wordlist),
    [mnemonic],
  );

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
    <div className="mb-1 flex w-full flex-col items-center gap-1">
      <TextInput
        label="Mnemonic"
        className="mb-1 w-9/12"
        placeholder="Mnemonic"
        state={[mnemonic, setMnemonic]}
      />
      <TextInput
        label="Accounts count"
        className="mb-1 w-9/12"
        placeholder="Accounts count"
        state={[countStr, setCountStr]}
      />
      <TextInput
        label="Password"
        className="mb-1 w-9/12"
        placeholder="Password"
        state={[password, setPassword]}
      />
      <div className="flex">
        <Button
          onClick={() => {
            setMnemonic(bip39.generateMnemonic(wordlist));
          }}
        >
          Random Mnemonic
        </Button>
        <Button
          className="ml-2"
          onClick={async () => {
            const count = parseInt(countStr, 10);
            const seed = await bip39.mnemonicToSeed(mnemonic);
            const hdKey = HDKey.fromMasterSeed(seed);
            setAccount([
              ...accounts,
              ...Array.from(new Array(count), (_, i) => {
                const path = `m/44'/309'/0'/0/${i}`;
                const derivedKey = hdKey.derive(path);
                return {
                  publicKey: ccc.hexFrom(derivedKey.publicKey!),
                  privateKey: ccc.hexFrom(derivedKey.privateKey!),
                  path,
                  address: "",
                };
              }),
            ]);
          }}
          disabled={!isValid || Number.isNaN(parseInt(countStr, 10))}
        >
          More accounts
        </Button>
        <Button
          className="ml-2"
          onClick={async () => {
            const seed = await bip39.mnemonicToSeed(mnemonic);
            const hdKey = HDKey.fromMasterSeed(seed);
            sendMessage(
              JSON.stringify(
                await ccc.keystoreEncrypt(
                  hdKey.privateKey!,
                  hdKey.chainCode!,
                  password,
                ),
              ),
            );
          }}
          disabled={!isValid}
        >
          To Keystore
        </Button>
      </div>
      {accounts.length !== 0 ? (
        <>
          <a
            className="mt-2 flex items-center rounded-full bg-black px-5 py-3 text-white"
            href={`data:application/octet-stream,path%2C%20address%2C%20private%20key%0A${accounts
              .map(({ privateKey, address, path }) =>
                encodeURIComponent(`${path}, ${address}, ${privateKey}`),
              )
              .join("\n")}`}
            download={`ckb_accounts_${Date.now()}.csv`}
          >
            Save as CSV
          </a>
          <div className="mt-1 w-full overflow-scroll whitespace-nowrap">
            <p>path, address, private key</p>
            {accounts.map(({ privateKey, address, path }) => (
              <p key={path}>
                {path}, {address}, {privateKey}
              </p>
            ))}
          </div>
        </>
      ) : undefined}
    </div>
  );
}
