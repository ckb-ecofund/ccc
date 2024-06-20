import { ccc } from "@ckb-ccc/core";
import { Signer } from './signer';

export function getJoyidCkbSigner(
  client: ccc.Client,
): Signer | undefined {
  
  return new Signer(client)
}