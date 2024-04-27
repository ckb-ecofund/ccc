import { SignerInfo } from "@ckb-ccc/connector";
import * as React from "react";
import { ReactNode, createContext, useState } from "react";
import { Connector } from "../components";

const CCC_CONTEXT = createContext<{
  open: () => unknown;
  disconnect: () => unknown;
  signerInfo?: SignerInfo;
}>({ open: () => {}, disconnect: () => {} });

export function Provider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [signerInfo, setSignerInfo] = useState<SignerInfo | undefined>();

  return (
    <CCC_CONTEXT.Provider
      value={{
        open: () => setIsOpen(true),
        disconnect: () => setSignerInfo(undefined),
        signerInfo,
      }}
    >
      <Connector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConnected={({ signerInfo }) => setSignerInfo(signerInfo)}
      />
      {children}
    </CCC_CONTEXT.Provider>
  );
}

export function useCcc() {
  return React.useContext(CCC_CONTEXT);
}
