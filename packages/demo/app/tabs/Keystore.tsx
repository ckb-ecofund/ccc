import { ccc, useCcc } from "@ckb-ccc/connector-react";
import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { TextInput } from "../components/Input";
import { HDKey } from "@scure/bip32";
import { TabProps } from "../types";
import { Textarea } from "../components/Textarea";

export function Keystore({ sendMessage }: TabProps) {
  const { client } = useCcc();

  const [keystore, setKeystore] = useState<string>("");
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
  const [hdKey, setHdKey] = useState<HDKey | undefined>(undefined);

  useEffect(() => {
    setAccount([]);
    setHdKey(undefined);
  }, [keystore, password]);

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
      <Textarea
        label="keystore"
        className="mb-1 w-9/12"
        placeholder="Keystore"
        state={[keystore, setKeystore]}
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
          onClick={async () => {
            try {
              const { privateKey, chainCode } = await ccc.keystoreDecrypt(
                JSON.parse(keystore),
                password,
              );
              console.log(privateKey, chainCode);
              setHdKey(new HDKey({ privateKey, chainCode }));
            } catch (err) {
              console.log(err);
              throw "Invalid";
            }
            sendMessage("Valid");
          }}
        >
          Verify Keystore
        </Button>
        <Button
          className="ml-2"
          onClick={async () => {
            if (!hdKey) {
              return;
            }
            const count = parseInt(countStr, 10);
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
          disabled={!hdKey || Number.isNaN(parseInt(countStr, 10))}
        >
          More accounts
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
