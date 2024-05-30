import { ccc } from "@ckb-ccc/core";
import { AnnounceProviderEvent as EIP6963AnnounceProviderEvent } from "./eip6963.advanced";
import { Signer as EIP6963Signer } from "./signer";

export class SignerFactory {
  private readonly existedUuids: string[] = [];

  constructor(private readonly client: ccc.Client) {}

  subscribeSigners(callback: (newSigner: EIP6963Signer) => unknown) {
    const onNewProvider = (event: Event) => {
      const { detail } = event as unknown as EIP6963AnnounceProviderEvent;
      const { uuid } = detail.info;

      if (this.existedUuids.indexOf(uuid) !== -1) {
        return;
      }

      this.existedUuids.push(uuid);
      const signer = new EIP6963Signer(this.client, detail);
      callback(signer);
    };

    window.addEventListener("eip6963:announceProvider", onNewProvider);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () =>
      window.removeEventListener("eip6963:announceProvider", onNewProvider);
  }
}
