import { Provider as EIP1193Provider } from "./eip1193.advanced.js";

/**
 * Interface representing an event announcing a provider.
 */
export interface AnnounceProviderEvent {
  /**
   * The detail of the provider.
   */
  detail: ProviderDetail;
}

/**
 * Interface representing the details of a provider.
 */
export interface ProviderDetail {
  /**
   * The information about the provider.
   */
  info: ProviderInfo;

  /**
   * The provider instance compliant with EIP-1193.
   */
  provider: EIP1193Provider;
}

/**
 * Interface representing information about a provider.
 */
export interface ProviderInfo {
  /**
   * The reverse DNS name of the provider.
   */
  rdns: string;

  /**
   * The UUID of the provider.
   */
  uuid: string;

  /**
   * The name of the provider.
   */
  name: string;

  /**
   * The icon URL of the provider.
   */
  icon: string;
}
