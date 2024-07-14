import { ccc } from "@ckb-ccc/core";
import { AnnounceProviderEvent as EIP6963AnnounceProviderEvent } from "./eip6963.advanced";
import { Signer as EIP6963Signer } from "./signer";

/**
 * Class representing a factory for creating and managing Signer instances.
 * @class
 */
export class SignerFactory {
  private readonly existedUuids: string[] = [];

  /**
   * Creates an instance of SignerFactory.
   * @param {ccc.Client} client - The client instance.
   */
  constructor(private readonly client: ccc.Client) {}

  /**
   * Subscribes to new signers and triggers a callback when a new signer is available.
   * @param {(newSigner: EIP6963Signer) => unknown} callback - The callback to trigger with the new signer.
   * @returns {() => void} A function to unsubscribe from the signer events.
   */
  subscribeSigners(
    callback: (newSigner: EIP6963Signer) => unknown,
  ): () => void {
    const onNewProvider = (event: Event) => {
      const { detail } = event as unknown as EIP6963AnnounceProviderEvent;
      const { uuid } = detail.info;

      if (this.existedUuids.includes(uuid)) {
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
