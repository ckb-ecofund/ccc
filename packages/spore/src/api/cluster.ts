import { ccc } from "@ckb-ccc/core";
import {
  assembleCreateClusterAction,
  assembleTransferClusterAction,
  prepareSporeTransaction,
} from "../advanced.js";
import { ClusterData, packRawClusterData } from "../codec/index.js";
import { computeTypeId, injectOneCapacityCell } from "../helper.js";
import {
  SporeScript,
  SporeScriptInfo,
  buildSporeCellDep,
  buildSporeScript,
} from "../predefined.js";

/**
 * Create a new Cluster cell
 *
 * @param signer who takes the responsibility to balance and sign the transaction
 * @param data specific format of data required by Cluster protocol
 * @param to the owner of the Cluster cell, which will be replaced with signer if not provided
 * @param sporeScriptInfo the script config of Spore cells, if not provided, the default script info will be used
 * @param tx the transaction skeleton, if not provided, a new one will be created
 * @returns
 *  - **tx**: a new transaction that contains created Cluster cell
 *  - **actions**: cobuild actions that can be used to generate cobuild proof
 *  - **clusterId**: the id of the created Cluster cell
 */
export async function createSporeCluster(params: {
  signer: ccc.Signer;
  data: ClusterData;
  to?: ccc.ScriptLike;
  sporeScriptInfo?: SporeScriptInfo;
  tx?: ccc.TransactionLike;
}): Promise<{
  tx: ccc.Transaction;
  actions: UnpackResult<typeof ActionVec>;
  id: ccc.Hex;
}> {
  const { signer, data, to, sporeScriptInfo } = params;
  // prepare transaction
  const tx = ccc.Transaction.from(params.tx ?? {});
  if (tx.inputs.length === 0) {
    await injectOneCapacityCell(signer, tx);
  }

  // build cluster cell
  const id = computeTypeId(tx, tx.outputs.length);
  const type = buildSporeScript(
    signer.client,
    SporeScript.Cluster,
    id,
    sporeScriptInfo,
  );
  const packedClusterData = packRawClusterData(data);
  tx.addOutput(
    {
      lock: to ?? (await signer.getRecommendedAddressObj()).script,
      type,
    },
    packedClusterData,
  );

  // generate cobuild action
  const output = tx.outputs[tx.outputs.length - 1];
  const createAction = assembleCreateClusterAction(output, packedClusterData);

  // complete celldeps and cobuild actions
  await tx.addCellDepInfos(
    signer.client,
    buildSporeCellDep(signer.client, SporeScript.Cluster, sporeScriptInfo),
  );

  return {
    tx,
    actions: [createAction],
    id,
  };
}

/**
 * Transfer a Cluster cell
 *
 * @param signer who takes the responsibility to balance and sign the transaction
 * @param id the id of the Cluster cell to be transferred
 * @param to the new owner of the Cluster cell
 * @param sporeScriptInfo the script info of Spore cell, if not provided, the default script info will be used
 * @param tx the transaction skeleton, if not provided, a new one will be created
 * @returns
 *  - **transaction**: a new transaction that contains transferred Cluster cell
 *  - **actions**: cobuild actions that can be used to generate cobuild proof
 */
export async function transferSporeCluster(params: {
  signer: ccc.Signer;
  id: ccc.HexLike;
  to: ccc.ScriptLike;
  sporeScriptInfo?: SporeScriptInfo;
  tx?: ccc.TransactionLike;
}): Promise<{
  tx: ccc.Transaction;
  actions: UnpackResult<typeof ActionVec>;
}> {
  const { signer, id, to, sporeScriptInfo } = params;

  // prepare transaction
  const tx = ccc.Transaction.from(params.tx ?? {});

  // build cluster cell
  const type = buildSporeScript(
    signer.client,
    SporeScript.Cluster,
    id,
    sporeScriptInfo,
  );
  const cluster = await signer.client.findSingletonCellByType(type, true);
  if (!cluster) {
    throw new Error("Cluster cell not found of clusterId: " + id);
  }
  tx.inputs.push(
    ccc.CellInput.from({
      previousOutput: cluster.outPoint,
      ...cluster,
    }),
  );
  tx.addOutput(
    {
      lock: to,
      type,
    },
    cluster.outputData,
  );

  // generate cobuild action
  const output = tx.outputs[tx.outputs.length - 1];
  const transferAction = assembleTransferClusterAction(
    cluster.cellOutput,
    output,
  );

  // complete celldeps and cobuild actions
  await tx.addCellDepInfos(
    signer.client,
    buildSporeCellDep(signer.client, SporeScript.Cluster, sporeScriptInfo),
  );

  return {
    tx,
    actions: [transferAction],
  };
}
