import { SporeScript, SporeScriptInfo } from "./base.js";

// note: no mainnet scripts
//
// export const SPORE_MAINNET_SCRIPTS: SporeScriptInfo = Object.freeze({
//     ...
// });

export const SPORE_TESTNET_SCRIPTS: SporeScriptInfo = Object.freeze({
  [SporeScript.Spore]: {
    codeHash:
      "0xbbad126377d45f90a8ee120da988a2d7332c78ba8fd679aab478a19d6c133494",
    hashType: "data1",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0xfd694382e621f175ddf81ce91ce2ecf8bfc027d53d7d31b8438f7d26fc37fd19",
            index: 0,
          },
          depType: "code",
        },
      },
    ],
  },
  [SporeScript.Cluster]: {
    codeHash:
      "0x598d793defef36e2eeba54a9b45130e4ca92822e1d193671f490950c3b856080",
    hashType: "data1",
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash:
              "0x49551a20dfe39231e7db49431d26c9c08ceec96a29024eef3acc936deeb2ca76",
            index: 0,
          },
          depType: "code",
        },
      },
    ],
  },
});
