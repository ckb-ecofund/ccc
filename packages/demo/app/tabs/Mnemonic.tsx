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
              ...(await Promise.all(
                Array.from(new Array(count), async (_, i) => {
                  const { publicKey, privateKey, path } =
                    extendedPrivateKey.privateKeyInfo(
                      hd.AddressType.Receiving,
                      accounts.length + i,
                    );
                  const signer = new ccc.SignerCkbPublicKey(client, publicKey);
                  return {
                    privateKey,
                    path,
                    address: await signer.getRecommendedAddress(),
                  };
                }),
              )),
            ]);
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
            <p key={address}>
              {path}, {address}, {privateKey}
            </p>
          ))}
        </div>
      ) : undefined}
    </div>
  );
}
