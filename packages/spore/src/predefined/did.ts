import { SporeScript, SporeScriptInfo } from "./base.js";
import { SPORE_MAINNET_SCRIPTS, SPORE_TESTNET_SCRIPTS } from "./spore_v2.js";

export const DID_MAINNET_SCRIPTS: SporeScriptInfo = Object.freeze({
  [SporeScript.Spore]: {
    codeHash:
      "0xcfba73b58b6f30e70caed8a999748781b164ef9a1e218424a6fb55ebf641cb33",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x37c80ba8124780920bc8fe06b49e3535b43ca339bb9a97fb462b16d575bfa9a6",
            index: 0,
          },
          depType: "code",
        },
      },
    ],
    dynamicCelldep: {
      codeHash:
        "0x00000000000000000000000000000000000000000000000000545950455f4944",
      hashType: "type",
      args: "0x62312cd846659e188b05da11dc3f080b083c27371ea701d6026e11e713e0e3de",
    },
    cobuild: true,
  },
  [SporeScript.Cluster]: SPORE_MAINNET_SCRIPTS[SporeScript.Cluster],
});

export const DID_TESTNET_SCRIPTS: SporeScriptInfo = Object.freeze({
  [SporeScript.Spore]: {
    codeHash:
      "0x0b1f412fbae26853ff7d082d422c2bdd9e2ff94ee8aaec11240a5b34cc6e890f",
    hashType: "type",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x306961e0eb04ed972c60cb89a0aed1b0ef065d96d2fc0000c62db5275e32dc6f",
            index: 0,
          },
          depType: "code",
        },
      },
    ],
    dynamicCelldep: {
      codeHash:
        "0x00000000000000000000000000000000000000000000000000545950455f4944",
      hashType: "type",
      args: "0x80f0d4bf6b3951911aa6b98cc609d477a8a10b903b35cfd528d098e95c36f680",
    },
    cobuild: true,
  },
  [SporeScript.Cluster]: SPORE_TESTNET_SCRIPTS[SporeScript.Cluster],
});
