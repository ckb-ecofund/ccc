import { ccc } from "@ckb-ccc/connector-react";
import { ReactNode } from "react";

export type TabProps = {
  sendMessage: (...msg: ReactNode[]) => void;
  signer: ccc.Signer | undefined;
};
