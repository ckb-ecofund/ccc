import { Script } from "../ckb";
import { KnownScript } from "./client";

export const TESTNET_SCRIPTS: Record<
  KnownScript,
  Pick<Script, "codeHash" | "hashType">
> = {
  [KnownScript.Secp256k1Blake160]: {
    codeHash:
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    hashType: "type",
  },
  [KnownScript.Secp256k1Multisig]: {
    codeHash:
      "0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8",
    hashType: "type",
  },
  [KnownScript.AnyoneCanPay]: {
    codeHash:
      "0x3419a1c09eb2567f6552ee7a8ecffd64155cffe0f1796e6e61ec088d740c1356",
    hashType: "type",
  },
  [KnownScript.JoyId]: {
    codeHash:
      "0xd23761b364210735c19c60561d213fb3beae2fd6172743719eff6920e020baac",
    hashType: "type",
  },
  [KnownScript.OmniLock]: {
    codeHash:
      "0xf329effd1c475a2978453c8600e1eaf0bc2087ee093c3ee64cc96ec6847752cb",
    hashType: "type",
  },
};
