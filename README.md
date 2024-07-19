<p align="center">
  <a href="https://ckbccc-demo.vercel.app/">
    <img alt="Logo" src="https://raw.githubusercontent.com/ckb-ecofund/ccc/master/assets/logo.svg" width="20%" />
  </a>
</p>

<h1 align="center" style="font-size: 64px;">
  CCC
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@ckb-ccc/ccc"><img
    alt="NPM Version" src="https://img.shields.io/npm/v/%40ckb-ccc%2Fccc"
  /></a>
  <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/ckb-ecofund/ccc" />
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/ckb-ecofund/ccc/master" />
  <img alt="GitHub deployments" src="https://img.shields.io/github/deployments/ckb-ecofund/ccc/production" />
  <a href="https://ckbccc-demo.vercel.app/"><img
    alt="Demo" src="https://img.shields.io/website?url=https%3A%2F%2Fckbccc-demo.vercel.app%2F&label=Demo"
  /></a>
</p>

<p align="center">
  "CCC - CKBers' Codebase" is the next step of "Common Chains Connector".
  <br />
  Empower yourself with CCC to discover the unlimited potential of CKB.
  <br />
  Interoperate with wallets from different chain ecosystems.
  <br />
  Fully enabling CKB's Turing completeness and cryptographic freedom power.
</p>

## Preview

<p align="center">
  <a href="https://ckbccc-demo.vercel.app/">
    <img src="https://raw.githubusercontent.com/ckb-ecofund/ccc/master/assets/preview.png" width="30%" />
  </a>
</p>

This project is still under active development, and we are looking forward to your feedback. [Try its demo now here](https://ckbccc-demo.vercel.app/). It showcases how to use CCC for some basic scenarios in CKB.

## Transaction Composing

Here's an example for transferring CKB:

```typescript
const tx = ccc.Transaction.from({
  outputs: [{ lock: toLock, capacity: ccc.fixedPointFrom(amount) }],
});
```

Tell CCC what you need, and then...

```typescript
await tx.completeInputsByCapacity(signer);
await tx.completeFeeBy(signer, 1000); // Transaction fee rate
const txHash = await signer.sendTransaction(tx);
```

We have done everything! Check [the demo source code](./packages/demo) for complete examples.

## Installing

We design CCC for both front-end and back-end developers. You need only one package to fulfil all your needs:

- [NodeJS](https://www.npmjs.com/package/@ckb-ccc/ccc): `npm install @ckb-ccc/ccc`
- [Web Component](https://www.npmjs.com/package/@ckb-ccc/connector): `npm install @ckb-ccc/connector`
- [React](https://www.npmjs.com/package/@ckb-ccc/connector-react): `npm install @ckb-ccc/connector-react`

CCC exports everything on the `ccc` object:

```typescript
import { ccc } from "@ckb-ccc/<package-name>";
```

## Lumos Patches

For developers who use Lumos to compose CKB transactions, CCC provides patches to:

- Support the JoyID Wallet.
- Support the Nostr Wallet.

See [lumos-patches](https://www.npmjs.com/package/@ckb-ccc/lumos-patches): `npm install @ckb-ccc/lumos-patches`

You can apply patches by:

```typescript
import { generateDefaultScriptInfos } from "@ckb-ccc/lumos-patches";

// Before using Lumos. You don't need @ckb-lumos/joyid anymore.
registerCustomLockScriptInfos(generateDefaultScriptInfos());
```

## Links

- [Nervos CKB Docs](https://docs.nervos.org/) is the documentation website of Nervos CKB.
- [Lumos](https://github.com/ckb-js/lumos) and its [Docs](https://lumos-website.vercel.app/): Lumos provides utils to help compose CKB transactions.
- [RGB++ SDK](https://github.com/ckb-cell/rgbpp-sdk) and its [Design](https://github.com/ckb-cell/RGBPlusPlus-design): RGB++ is a protocol for issuing assets with Turing-completed VM on BTC L1.
- [Spore SDK](https://github.com/sporeprotocol/spore-sdk) and its [Docs](https://docs.spore.pro/): The on-chain digital object (DOBs) protocol designed to empower ownership, distribution, and value capture.
