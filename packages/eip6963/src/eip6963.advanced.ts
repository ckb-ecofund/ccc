import { Provider as EIP1193Provider } from "./eip1193.advanced";

export interface AnnounceProviderEvent {
  detail: ProviderDetail;
}

export interface ProviderDetail {
  info: ProviderInfo;
  provider: EIP1193Provider;
}

export interface ProviderInfo {
  rdns: string;
  uuid: string;
  name: string;
  icon: string;
}
