import { ccc } from "@ckb-ccc/core";
import { EIP6963AnnounceProviderEvent } from "./advanced";
import { EIP6963Signer } from "./signer";

export class EIP6963Manager {
  private signers: EIP6963Signer[] = [];

  constructor(private readonly client: ccc.Client) {}

  getSigners() {
    return this.signers;
  }

  subscribeEIP6963Signers(
    callback: (signers: EIP6963Signer[], newProvider: EIP6963Signer) => unknown,
  ) {
    const onNewProvider = (event: Event) => {
      const signer = new EIP6963Signer(
        this.client,
        (event as unknown as EIP6963AnnounceProviderEvent).detail,
      );
      if (
        this.signers.some((p) => p.detail.info.uuid === signer.detail.info.uuid)
      ) {
        return;
      }
      this.signers = [...this.signers, signer];
      callback(this.signers, signer);
    };

    window.addEventListener("eip6963:announceProvider", onNewProvider);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () =>
      window.removeEventListener("eip6963:announceProvider", onNewProvider);
  }
}
