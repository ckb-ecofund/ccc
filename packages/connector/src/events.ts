import { SignerInfo } from "@ckb-ccc/ccc";

export class ConnectedEvent extends Event {
  constructor(public readonly signerInfo: SignerInfo) {
    super("connected", { composed: true });
  }
}

export class CloseEvent extends Event {
  constructor() {
    super("close", { composed: true });
  }
}
