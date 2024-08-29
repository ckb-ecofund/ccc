import { ccc } from "@ckb-ccc/connector";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Connector } from "../components/index.js";

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

class SignersControllerWithFilter extends ccc.SignersController {
  constructor(
    public filter?: (
      signerInfo: ccc.SignerInfo,
      wallet: ccc.Wallet,
    ) => Promise<boolean>,
  ) {
    super();
  }

  async addSigner(
    walletName: string,
    icon: string,
    signerInfo: ccc.SignerInfo,
    context: ccc.SignersControllerRefreshContext,
  ) {
    if (
      this.filter &&
      !(await this.filter(signerInfo, { name: walletName, icon }))
    ) {
      return;
    }

    return super.addSigner(walletName, icon, signerInfo, context);
  }
}

export function Provider({
  children,
  connectorProps,
  name,
  icon,
  signerFilter,
  signersController,
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
  signersController?: ccc.SignersController;
  defaultClient?: ccc.Client;
  preferredNetworks?: ccc.NetworkPreference[];
}) {
  const [ref, setRef] = useState<ccc.WebComponentConnector | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [_, setFlag] = useState(0);
  const defautlSignersController = useRef<
    SignersControllerWithFilter | undefined
  >(undefined);

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
  useEffect(() => {
    if (!defautlSignersController.current) {
      defautlSignersController.current = new SignersControllerWithFilter(
        signerFilter,
      );
    } else {
      defautlSignersController.current.filter = signerFilter;
    }
  }, [signerFilter]);

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
        signersController={
          signersController ?? defautlSignersController.current
        }
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
