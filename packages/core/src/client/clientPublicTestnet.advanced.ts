import { Script } from "../ckb";
import { CellDepInfoLike, KnownScript } from "./client";

export const TESTNET_SCRIPTS: Record<
  KnownScript,
  Pick<Script, "codeHash" | "hashType"> & { cellDeps: CellDepInfoLike[] }
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
              "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
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
              "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
            index: 1,
          },
          depType: "depGroup",
        },
      },
    ],
  },
  [KnownScript.AnyoneCanPay]: {
    codeHash:
      "0x3419a1c09eb2567f6552ee7a8ecffd64155cffe0f1796e6e61ec088d740c1356",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0xec26b0f85ed839ece5f11c4c4e837ec359f5adc4420410f6453b1f6b60fb96a6",
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
      "0x25c29dc317811a6f6f3985a7a9ebc4838bd388d19d0feeecf0bcd60f6c0975bb",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0xbf6fb538763efec2a70a6a3dcb7242787087e1030c4e7d86585bc63a9d337f5f",
            index: 0,
          },
          depType: "code",
        },
        type: {
          codeHash:
            "0x00000000000000000000000000000000000000000000000000545950455f4944",
          hashType: "type",
          args: "0x44ec8b96663e06cc94c8c468a4d46d7d9af69eaf418f6390c9f11bb763dda0ae",
        },
      },
    ],
  },
  [KnownScript.JoyId]: {
    codeHash:
      "0xd23761b364210735c19c60561d213fb3beae2fd6172743719eff6920e020baac",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x4dcf3f3b09efac8995d6cbee87c5345e812d310094651e0c3d9a730f32dc9263",
            index: 0,
          },
          depType: "depGroup",
        },
      },
    ],
  },
  [KnownScript.COTA]: {
    codeHash:
      "0x89cd8003a0eaf8e65e0c31525b7d1d5c1becefd2ea75bb4cff87810ae37764d8",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x636a786001f87cb615acfcf408be0f9a1f077001f0bbc75ca54eadfe7e221713",
            index: 0,
          },
          depType: "depGroup",
        },
      },
    ],
  },
  [KnownScript.OmniLock]: {
    codeHash:
      "0xf329effd1c475a2978453c8600e1eaf0bc2087ee093c3ee64cc96ec6847752cb",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
            index: 0,
          },
          depType: "depGroup",
        },
      },
      {
        cellDep: {
          outPoint: {
            txHash:
              "0xec18bf0d857c981c3d1f4e17999b9b90c484b303378e94de1a57b0872f5d4602",
            index: 0,
          },
          depType: "code",
        },
        type: {
          codeHash:
            "0x00000000000000000000000000000000000000000000000000545950455f4944",
          hashType: "type",
          args: "0x761f51fc9cd6a504c32c6ae64b3746594d1af27629b427c5ccf6c9a725a89144",
        },
      },
    ],
  },
  [KnownScript.NostrLock]: {
    codeHash:
      "0x6ae5ee0cb887b2df5a9a18137315b9bdc55be8d52637b2de0624092d5f0c91d5",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0xa2a434dcdbe280b9ed75bb7d6c7d68186a842456aba0fc506657dc5ed7c01d68",
            index: 0,
          },
          depType: "code",
        },
        type: {
          codeHash:
            "0x00000000000000000000000000000000000000000000000000545950455f4944",
          hashType: "type",
          args: "0x8dc56c6f35f0c535e23ded1629b1f20535477a1b43e59f14617d11e32c50e0aa",
        },
      },
    ],
  },
  [KnownScript.UniqueType]: {
    codeHash:
      "0x8e341bcfec6393dcd41e635733ff2dca00a6af546949f70c57a706c0f344df8b",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0xff91b063c78ed06f10a1ed436122bd7d671f9a72ef5f5fa28d05252c17cf4cef",
            index: 0,
          },
          depType: "code",
        },
        type: {
          codeHash:
            "0x00000000000000000000000000000000000000000000000000545950455f4944",
          hashType: "type",
          args: "0xe04976b67600fd25ac50305f77b33aee2c12e3c18e63ece9119e5b32117884b5",
        },
      },
    ],
  },
  [KnownScript.SingleUseLock]: {
    codeHash:
      "0x8290467a512e5b9a6b816469b0edabba1f4ac474e28ffdd604c2a7c76446bbaf",
    hashType: "data1",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0xb4f171c9c9caf7401f54a8e56225ae21d95032150a87a4678eac3f66a3137b93",
            index: 4,
          },
          depType: "code",
        },
      },
    ],
  },
  [KnownScript.OutputTypeProxyLock]: {
    codeHash:
      "0x2df53b592db3ae3685b7787adcfef0332a611edb83ca3feca435809964c3aff2",
    hashType: "data1",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0xb4f171c9c9caf7401f54a8e56225ae21d95032150a87a4678eac3f66a3137b93",
            index: 2,
          },
          depType: "code",
        },
      },
    ],
  },
};
