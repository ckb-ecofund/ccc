import { Provider as EIP1193Provider } from "./eip1193.advanced.js";

/**
 * Interface representing an event announcing a provider.
 * @interface
 */
export interface AnnounceProviderEvent {
  /**
   * The detail of the provider.
   * @type {ProviderDetail}
   */
  detail: ProviderDetail;
}

/**
 * Interface representing the details of a provider.
 * @interface
 */
export interface ProviderDetail {
  /**
   * The information about the provider.
   * @type {ProviderInfo}
   */
  info: ProviderInfo;

  /**
   * The provider instance compliant with EIP-1193.
   * @type {EIP1193Provider}
   */
  provider: EIP1193Provider;
}

/**
 * Interface representing information about a provider.
 * @interface
 */
export interface ProviderInfo {
  /**
   * The reverse DNS name of the provider.
   * @type {string}
   */
  rdns: string;

  /**
   * The UUID of the provider.
   * @type {string}
   */
  uuid: string;

  /**
   * The name of the provider.
   * @type {string}
   */
  name: string;

  /**
   * The icon URL of the provider.
   * @type {string}
   */
  icon: string;
}
