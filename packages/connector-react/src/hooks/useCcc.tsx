import { ccc } from "@ckb-ccc/connector";
import * as React from "react";
import { ReactNode, createContext, useState } from "react";
import { Connector } from "../components";

const CCC_CONTEXT = createContext<{
  open: () => unknown;
  disconnect: () => unknown;
  wallet?: ccc.Wallet;
  signerInfo?: ccc.SignerInfo;
}>({ open: () => {}, disconnect: () => {} });

export function Provider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [wallet, setWallet] = useState<ccc.Wallet | undefined>();
  const [signerInfo, setSignerInfo] = useState<ccc.SignerInfo | undefined>();

  return (
    <CCC_CONTEXT.Provider
      value={{
        open: () => setIsOpen(true),
        disconnect: () => setSignerInfo(undefined),
        wallet,
        signerInfo,
      }}
    >
      <Connector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConnected={({ wallet, signerInfo }) => {
          setWallet(wallet);
          setSignerInfo(signerInfo);
        }}
      />
      {children}
    </CCC_CONTEXT.Provider>
  );
}

export function useCcc() {
  return React.useContext(CCC_CONTEXT);
}
