import { ccc } from "@ckb-ccc/ccc";

export class ConnectedEvent extends Event {
  constructor(
    public readonly wallet: ccc.Wallet,
    public readonly signerInfo: ccc.SignerInfo,
  ) {
    super("connected", { composed: true });
  }
}

export class CloseEvent extends Event {
  constructor() {
    super("close", { composed: true });
  }
}
