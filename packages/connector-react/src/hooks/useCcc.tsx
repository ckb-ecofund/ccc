import { ccc } from "@ckb-ccc/connector";
import React, { createContext, useState } from "react";
import { Connector } from "../components";

const CCC_CONTEXT = createContext<{
  open: () => unknown;
  disconnect: () => unknown;
  wallet?: ccc.Wallet;
  signerInfo?: ccc.SignerInfo;
  status: ccc.ConnectorStatus;
}>({
  open: () => {},
  disconnect: () => {},
  status: ccc.ConnectorStatus.SelectingSigner,
});

export function Provider({
  children,
  connectorProps,
}: {
  children: React.ReactNode;
  connectorProps?: React.HTMLAttributes<{}>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [wallet, setWallet] = useState<ccc.Wallet | undefined>();
  const [signerInfo, setSignerInfo] = useState<ccc.SignerInfo | undefined>();
  const [status, setStatus] = useState<ccc.ConnectorStatus>(
    ccc.ConnectorStatus.SelectingSigner,
  );

  return (
    <CCC_CONTEXT.Provider
      value={{
        open: () => setIsOpen(true),
        disconnect: () => {
          setWallet(undefined);
          setSignerInfo(undefined);
          setStatus(ccc.ConnectorStatus.SelectingSigner);
        },

        ...([
          ccc.ConnectorStatus.SelectingSigner,
          ccc.ConnectorStatus.Connecting,
        ].includes(status)
          ? {
              wallet: undefined,
              signerInfo: undefined,
            }
          : {
              wallet,
              signerInfo,
            }),
        status,
      }}
    >
      <Connector
        isOpen={isOpen}
        wallet={wallet}
        signer={signerInfo}
        status={status}
        onClose={() => setIsOpen(false)}
        onSignerChanged={({ wallet, signerInfo }) => {
          setWallet(wallet);
          setSignerInfo(signerInfo);
        }}
        onStatusChanged={({ status }) => setStatus(status)}
        {...{
          ...connectorProps,
          style: {
            ...connectorProps?.style,
            zIndex: connectorProps?.style?.zIndex ?? 999,
          },
        }}
      />
      {children}
    </CCC_CONTEXT.Provider>
  );
}

export function useCcc() {
  return React.useContext(CCC_CONTEXT);
}
