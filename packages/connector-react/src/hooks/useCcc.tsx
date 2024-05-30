import { ccc } from "@ckb-ccc/connector";
import React, { createContext, useState } from "react";
import { Connector } from "../components";

const CCC_CONTEXT = createContext<
  | {
      open: () => unknown;
      disconnect: () => unknown;
      setClient: (client: ccc.Client) => unknown;
      client: ccc.Client;
      wallet?: ccc.Wallet;
      signerInfo?: ccc.SignerInfo;
      status: ccc.ConnectorStatus;
    }
  | undefined
>(undefined);

export function Provider({
  children,
  connectorProps,
}: {
  children: React.ReactNode;
  connectorProps?: React.HTMLAttributes<{}>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [client, setClient] = useState<ccc.Client>(
    () => new ccc.ClientPublicTestnet(),
  );
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
        setClient,

        client,
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
        client={client}
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
  const context = React.useContext(CCC_CONTEXT);
  if (!context) {
    throw Error(
      "The component which invokes the useCcc hook should be placed in a ccc.Provider.",
    );
  }
  return context;
}
