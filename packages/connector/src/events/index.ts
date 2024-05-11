import { ccc } from "@ckb-ccc/ccc";
import { ConnectorStatus } from "../status";

export class SignerChangedEvent extends Event {
  constructor(
    public readonly wallet?: ccc.Wallet,
    public readonly signerInfo?: ccc.SignerInfo,
  ) {
    super("signerChanged", { composed: true });
  }
}

export class StatusChangedEvent extends Event {
  constructor(public readonly status: ConnectorStatus) {
    super("statusChanged", { composed: true });
  }
}

export class CloseEvent extends Event {
  constructor() {
    super("close", { composed: true });
  }
}
