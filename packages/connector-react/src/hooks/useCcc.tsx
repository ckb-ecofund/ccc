import { WebComponentConnector, ccc } from "@ckb-ccc/connector";
import React, { createContext, useCallback, useMemo, useState } from "react";
import { Connector } from "../components";

const CCC_CONTEXT = createContext<
  | {
      open: () => unknown;
      disconnect: () => unknown;
      setClient: (client: ccc.Client) => unknown;
      client: ccc.Client;
      wallet?: ccc.Wallet;
      signerInfo?: ccc.SignerInfo;
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
  const [ref, setRef] = useState<WebComponentConnector | null>(null);
  const [_, setFlag] = useState(0);

  const client = useMemo(
    () => ref?.client ?? new ccc.ClientPublicTestnet(),
    [ref?.client],
  );
  const open = useCallback(() => ref?.setIsOpen(true), [ref, ref?.setIsOpen]);
  const disconnect = useMemo(
    () => ref?.disconnect.bind(ref) ?? (() => {}),
    [ref, ref?.disconnect],
  );
  const setClient = useMemo(
    () => ref?.setClient.bind(ref) ?? (() => {}),
    [ref, ref?.setClient],
  );

  return (
    <CCC_CONTEXT.Provider
      value={{
        open,
        disconnect,
        setClient,

        client,
        wallet: ref?.wallet,
        signerInfo: ref?.signer,
      }}
    >
      <Connector
        ref={setRef}
        onWillUpdate={() => setFlag((f) => f + 1)}
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
