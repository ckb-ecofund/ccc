import { WebComponentConnector, ccc } from "@ckb-ccc/connector";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  name,
  icon,
  signerFilter,
  defaultClient,
  preferredNetworks,
}: {
  children: React.ReactNode;
  connectorProps?: React.HTMLAttributes<{}>;
  name?: string;
  icon?: string;
  signerFilter?: (
    signerInfo: ccc.SignerInfo,
    wallet: ccc.Wallet,
  ) => Promise<boolean>;
  defaultClient?: ccc.Client;
  preferredNetworks?: ccc.NetworkPreference[];
}) {
  const [ref, setRef] = useState<WebComponentConnector | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [_, setFlag] = useState(0);

  const client = useMemo(
    () => ref?.client ?? new ccc.ClientPublicTestnet(),
    [ref?.client],
  );
  const open = useCallback(() => {
    setIsOpen(true);
    ref?.requestUpdate();
  }, [setIsOpen, ref, ref?.requestUpdate]);
  const disconnect = useMemo(
    () => ref?.disconnect.bind(ref) ?? (() => {}),
    [ref, ref?.disconnect],
  );
  const setClient = useMemo(
    () => ref?.setClient.bind(ref) ?? (() => {}),
    [ref, ref?.setClient],
  );

  useEffect(() => {
    if (defaultClient) {
      setClient(defaultClient);
    }
  }, [setClient]);

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
        name={name}
        icon={icon}
        signerFilter={signerFilter}
        ref={setRef}
        onWillUpdate={() => setFlag((f) => f + 1)}
        onClose={() => setIsOpen(false)}
        preferredNetworks={preferredNetworks}
        {...{
          ...connectorProps,
          style: {
            ...connectorProps?.style,
            zIndex: connectorProps?.style?.zIndex ?? 999,
            ...(isOpen ? {} : { display: "none" }),
            ...({
              "--background": "#fff",
              "--divider": "#eee",
              "--btn-primary": "#f8f8f8",
              "--btn-primary-hover": "#efeeee",
              "--btn-secondary": "#ddd",
              "--btn-secondary-hover": "#ccc",
              color: "#1e1e1e",
              "--tip-color": "#666",
            } as React.CSSProperties),
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
