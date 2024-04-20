export * from "./client";
import * as clientPublicMainnetAdvanced from "./clientPublicMainnet.advanced";
export * from "./clientPublicMainnet";
import * as clientPublicTestnetAdvanced from "./clientPublicTestnet.advanced";
export * from "./clientPublicTestnet";

export const AdvancedClient = {
  ...clientPublicMainnetAdvanced,
  ...clientPublicTestnetAdvanced,
};
