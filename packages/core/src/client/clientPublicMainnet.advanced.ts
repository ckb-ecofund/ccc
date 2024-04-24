import { Script } from "../ckb";
import { KnownScript } from "./client";

export const MAINNET_SCRIPTS: Record<KnownScript, Omit<Script, "args">> = {
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
      "0xd369597ff47f29fbc0d47d2e3775370d1250b85140c670e4718af712983a2354",
    hashType: "type",
  },
  [KnownScript.JoyId]: {
    codeHash:
      "0xd00c84f0ec8fd441c38bc3f87a371f547190f2fcff88e642bc5bf54b9e318323",
    hashType: "type",
  },
  [KnownScript.OmniLock]: {
    codeHash:
      "0x9b819793a64463aed77c615d6cb226eea5487ccfc0783043a587254cda2b6f26",
    hashType: "type",
  },
};
