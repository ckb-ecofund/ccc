import { ccc } from "@ckb-ccc/connector-react";

export type TabProps = {
  sendMessage: (...msg: string[]) => void;
  signer: ccc.Signer | undefined;
};
