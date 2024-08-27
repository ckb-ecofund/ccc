import { ccc } from "@ckb-ccc/core";
import { Provider } from "./eip1193.advanced.js";
import {
  AnnounceProviderEvent as EIP6963AnnounceProviderEvent,
  ProviderDetail,
} from "./eip6963.advanced.js";
import { Signer } from "./signer.js";

/**
 * Class representing a factory for creating and managing Signer instances.
 * @public
 */
export class SignerFactory {
  private readonly existedUuids: string[] = [];

  /**
   * Creates an instance of SignerFactory.
   * @param client - The client instance.
   */
  constructor(private readonly client: ccc.Client) {}

  /**
   * Subscribes to new signers and triggers a callback when a new signer is available.
   * @param callback - The callback to trigger with the new signer.
   * @returns A function to unsubscribe from the signer events.
   */
  subscribeSigners(
    callback: (newSigner: Signer, detail?: ProviderDetail) => unknown,
  ): () => void {
    const onNewProvider = (event: Event) => {
      const { detail } = event as unknown as EIP6963AnnounceProviderEvent;
      const { uuid } = detail.info;

      if (this.existedUuids.includes(uuid)) {
        return;
      }

      this.existedUuids.push(uuid);
      const signer = new Signer(this.client, detail.provider);
      callback(signer, detail);
    };

    window.addEventListener("eip6963:announceProvider", onNewProvider);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    const windowRef = window as { ethereum?: Provider };

    if (typeof windowRef.ethereum !== "undefined") {
      callback(new Signer(this.client, windowRef.ethereum));
    }

    return () =>
      window.removeEventListener("eip6963:announceProvider", onNewProvider);
  }
}
