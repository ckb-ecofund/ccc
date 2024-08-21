/* eslint-disable @next/next/no-img-element */
"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { ReactNode, useEffect, useState } from "react";
import { Background } from "@/src/components/Background";
import { useGetExplorerLink } from "@/src/utils";
import { FlaskConical, FlaskConicalOff, Home, Search } from "lucide-react";
import Link from "next/link";
import { AppProvider, useApp } from "@/src/context";
import { usePathname } from "next/navigation";
import { Button } from "../components/Button";

function Links() {
  const { index } = useGetExplorerLink();

  return (
    <div className="align-center absolute left-1/2 top-12 flex grow translate-x-[-50%] justify-center gap-8 lg:top-0">
      <Link href="/" className="h-6 w-6">
        <img
          src="https://raw.githubusercontent.com/ckb-ecofund/ccc/master/assets/logo.svg"
          alt="CCC"
        />
      </Link>
      <Link href="https://github.com/ckb-ecofund/ccc" target="_blank">
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          id="github"
        >
          <path d="M7.999 0C3.582 0 0 3.596 0 8.032a8.031 8.031 0 0 0 5.472 7.621c.4.074.546-.174.546-.387 0-.191-.007-.696-.011-1.366-2.225.485-2.695-1.077-2.695-1.077-.363-.928-.888-1.175-.888-1.175-.727-.498.054-.488.054-.488.803.057 1.225.828 1.225.828.714 1.227 1.873.873 2.329.667.072-.519.279-.873.508-1.074-1.776-.203-3.644-.892-3.644-3.969 0-.877.312-1.594.824-2.156-.083-.203-.357-1.02.078-2.125 0 0 .672-.216 2.2.823a7.633 7.633 0 0 1 2.003-.27 7.65 7.65 0 0 1 2.003.271c1.527-1.039 2.198-.823 2.198-.823.436 1.106.162 1.922.08 2.125.513.562.822 1.279.822 2.156 0 3.085-1.87 3.764-3.652 3.963.287.248.543.738.543 1.487 0 1.074-.01 1.94-.01 2.203 0 .215.144.465.55.386A8.032 8.032 0 0 0 16 8.032C16 3.596 12.418 0 7.999 0z"></path>
        </svg>
      </Link>
      <Link href="https://x.com/CKBDevrel" target="_blank">
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
        </svg>
      </Link>
      <Link href="https://faucet.nervos.org/" target="_blank">
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 360 360"
        >
          <path
            d="M102.342,246.475C99.541,242.42,94.928,240,90,240s-9.541,2.42-12.342,6.475
		c-0.32,0.463-7.925,11.497-15.633,24.785C46.765,297.566,45,308.822,45,315c0,24.813,20.187,45,45,45s45-20.187,45-45
		c0-6.178-1.765-17.434-17.025-43.74C110.267,257.972,102.662,246.938,102.342,246.475z"
          />
          <path
            d="M300,60h-60h-15V30h15c8.284,0,15-6.716,15-15s-6.716-15-15-15h-60c-8.284,0-15,6.716-15,15s6.716,15,15,15
		h15v30h-15h-60c-41.355,0-75,33.645-75,75v60c0,8.284,6.716,15,15,15h60c8.284,0,15-6.716,15-15v-45h45h60h60
		c8.284,0,15-6.716,15-15V75C315,66.716,308.284,60,300,60z"
          />
        </svg>
      </Link>
      <Link href="https://www.nervos.org/" target="_blank">
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 207.6765 206.318"
          fill="#000"
        >
          <polygon points="0 0 0 206.318 53.151 206.318 53.151 93.897 93.896 93.897 0 0" />
          <polygon points="154.525 0 154.525 112.422 113.781 112.422 207.676 206.318 207.676 0 154.525 0" />
        </svg>
      </Link>
      <Link href={index} target="_blank">
        <Search className="h-6 w-6" strokeWidth={4} />
      </Link>
    </div>
  );
}

function ClientSwitcher() {
  const { setClient } = ccc.useCcc();
  const [isTestnet, setIsTestnet] = useState(true);

  useEffect(() => {
    setClient(
      isTestnet ? new ccc.ClientPublicTestnet() : new ccc.ClientPublicMainnet(),
    );
  }, [isTestnet, setClient]);

  return (
    <button onClick={() => setIsTestnet(!isTestnet)} className="flex gap-2">
      {isTestnet ? (
        <FlaskConical className="h-6 w-6" />
      ) : (
        <FlaskConicalOff className="h-6 w-6" />
      )}
      {isTestnet ? "Testnet" : "Mainnet"}
    </button>
  );
}

function WalletInfo() {
  const { signer, openAction, openSigner } = useApp();

  const [balance, setBalance] = useState(ccc.Zero);
  useEffect(() => {
    if (!signer) {
      return;
    }

    signer.getBalance().then((v) => setBalance(v));
  }, [signer]);

  if (!signer) {
    return (
      <Button
        disabled
        className="mx-3 h-7 py-0 text-sm"
        style={{ paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
      >
        Not Connected
      </Button>
    );
  }

  return (
    <div className="flex items-center">
      <p className="font-bold">
        {ccc.fixedPointToString(balance / ccc.fixedPointFrom("1", 6), 2)} CKB
      </p>
      <Button
        onClick={openSigner}
        className="mx-3 h-7 py-0 text-sm"
        style={{ paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
      >
        {openAction}
      </Button>
    </div>
  );
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <ccc.Provider
    /*
      defaultClient={new ccc.ClientPublicTestnet()} // Default client used by connector
      connectorProps={{ style: { backgroundColor: "#f00" } }} // Custom props on the connector element
      name="Custom name" // Custom name for your application, default to website title
      icon="https://custom.icon" // Custom icon for your application, default to website icon
      signerFilter={async (signerInfo, wallet) => true} // Filter out signers that you don't want
      preferredNetworks={[
        {
          addressPrefix: "ckt",
          signerType: ccc.SignerType.BTC,
          network: "btc",
        },
      ]}
    */
    >
      <AppProvider>
        <div className="flex grow flex-col">
          <Background />
          <header className="relative my-4 flex items-center justify-between pb-10 lg:pb-0">
            {["/connected", "/"].includes(pathname) ? (
              <div className="h-6 w-6"></div>
            ) : (
              <Link href="/" prefetch={true}>
                <Home className="ml-4 h-6 w-6" />
              </Link>
            )}
            <WalletInfo />
            <Links />
          </header>
          <main className="flex grow flex-col items-center justify-center px-6 md:px-24">
            {children}
          </main>
          <footer className="my-4 flex flex-col items-center">
            <ClientSwitcher />
          </footer>
        </div>
      </AppProvider>
    </ccc.Provider>
  );
}
