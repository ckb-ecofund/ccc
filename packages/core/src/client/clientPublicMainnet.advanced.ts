import { Script } from "../ckb";
import { CellDepInfoLike, KnownScript } from "./client";

export const MAINNET_SCRIPTS: Record<
  KnownScript,
  | (Pick<Script, "codeHash" | "hashType"> & { cellDeps: CellDepInfoLike[] })
  | undefined
> = {
  [KnownScript.Secp256k1Blake160]: {
    codeHash:
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c",
            index: 0,
          },
          depType: "depGroup",
        },
      },
    ],
  },
  [KnownScript.Secp256k1Multisig]: {
    codeHash:
      "0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c",
            index: 1,
          },
          depType: "depGroup",
        },
      },
    ],
  },
  [KnownScript.AnyoneCanPay]: {
    codeHash:
      "0xd369597ff47f29fbc0d47d2e3775370d1250b85140c670e4718af712983a2354",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x4153a2014952d7cac45f285ce9a7c5c0c0e1b21f2d378b82ac1433cb11c25c4d",
            index: 0,
          },
          depType: "depGroup",
        },
      },
    ],
  },
  [KnownScript.TypeId]: {
    codeHash:
      "0x00000000000000000000000000000000000000000000000000545950455f4944",
    hashType: "type",
    cellDeps: [],
  },
  [KnownScript.XUdt]: {
    codeHash:
      "0x50bd8d6680b8b9cf98b73f3c08faf8b2a21914311954118ad6609be6e78a1b95",
    hashType: "data1",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0xc07844ce21b38e4b071dd0e1ee3b0e27afd8d7532491327f39b786343f558ab7",
            index: 0,
          },
          depType: "code",
        },
      },
    ],
  },
  [KnownScript.JoyId]: {
    codeHash:
      "0xd00c84f0ec8fd441c38bc3f87a371f547190f2fcff88e642bc5bf54b9e318323",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0xf05188e5f3a6767fc4687faf45ba5f1a6e25d3ada6129dae8722cb282f262493",
            index: 0,
          },
          depType: "depGroup",
        },
      },
    ],
  },
  [KnownScript.COTA]: {
    codeHash:
      "0x1122a4fb54697cf2e6e3a96c9d80fd398a936559b90954c6e88eb7ba0cf652df",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0xabaa25237554f0d6c586dc010e7e85e6870bcfd9fb8773257ecacfbe1fd738a0",
            index: 0,
          },
          depType: "depGroup",
        },
      },
    ],
  },
  [KnownScript.OmniLock]: {
    codeHash:
      "0x9b819793a64463aed77c615d6cb226eea5487ccfc0783043a587254cda2b6f26",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c",
            index: 0,
          },
          depType: "depGroup",
        },
      },
      {
        cellDep: {
          outPoint: {
            txHash:
              "0xc76edf469816aa22f416503c38d0b533d2a018e253e379f134c3985b3472c842",
            index: 0,
          },
          depType: "code",
        },
        type: {
          codeHash:
            "0x00000000000000000000000000000000000000000000000000545950455f4944",
          hashType: "type",
          args: "0x855508fe0f0ca25b935b070452ecaee48f6c9f1d66cd15f046616b99e948236a",
        },
      },
    ],
  },
  [KnownScript.NostrLock]: undefined,
  [KnownScript.SingleUseLock]: undefined,
  [KnownScript.OutputTypeProxyLock]: undefined,
};
