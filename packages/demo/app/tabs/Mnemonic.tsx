import { ccc, useCcc } from "@ckb-ccc/connector-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { TextInput } from "../components/Input";
import * as hd from "@ckb-lumos/hd";

export function Mnemonic() {
  const { client } = useCcc();

  const [mnemonic, setMnemonic] = useState<string>("");
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
    () => hd.mnemonic.validateMnemonic(mnemonic),
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
            setMnemonic(hd.mnemonic.generateMnemonic());
          }}
        >
          Generate Random Mnemonic
        </Button>
        <Button
          className="ml-2"
          onClick={async () => {
            const count = parseInt(countStr, 10);
            const seed = await hd.mnemonic.mnemonicToSeed(mnemonic);
            const extendedPrivateKey = hd.ExtendedPrivateKey.fromSeed(seed);
            setAccount([
              ...accounts,
              ...Array.from(new Array(count), (_, i) => {
                const { publicKey, privateKey, path } =
                  extendedPrivateKey.privateKeyInfo(
                    hd.AddressType.Receiving,
                    accounts.length + i,
                  );
                return {
                  publicKey,
                  privateKey,
                  path,
                  address: "",
                };
              }),
            ]);
          }}
          disabled={!isValid || Number.isNaN(parseInt(countStr, 10))}
        >
          Generate more accounts
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
