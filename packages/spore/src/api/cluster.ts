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
  SporeVersion,
  buildSporeCellDep,
  buildSporeScript,
  cobuildRequired,
  findExistedSporeCellAndCelldep,
} from "../predefined/index.js";

/**
 * Create a new Cluster cell
 *
 * @param signer who takes the responsibility to balance and sign the transaction
 * @param data specific format of data required by Cluster protocol
 * @param to the owner of the Cluster cell, which will be replaced with signer if not provided
 * @param version the script indicator that contains different version of deployed Spore script
 * @param tx the transaction skeleton, if not provided, a new one will be created
 * @returns
 *  - **tx**: a new transaction that contains created Cluster cell
 *  - **id**: the id of the created Cluster cell
 */
export async function createSporeCluster(params: {
  signer: ccc.Signer;
  data: ClusterData;
  to?: ccc.ScriptLike;
  version?: SporeVersion;
  tx?: ccc.TransactionLike;
}): Promise<{
  tx: ccc.Transaction;
  id: ccc.Hex;
}> {
  const { signer, data, to, version } = params;
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
    version,
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
    await buildSporeCellDep(signer.client, SporeScript.Cluster, version),
  );

  return {
    tx: await (cobuildRequired(tx)
      ? prepareSporeTransaction(signer, tx, [createAction])
      : signer.prepareTransaction(tx)),
    id,
  };
}

/**
 * Transfer a Cluster cell
 *
 * @param signer who takes the responsibility to balance and sign the transaction
 * @param id the id of the Cluster cell to be transferred
 * @param to the new owner of the Cluster cell
 * @param tx the transaction skeleton, if not provided, a new one will be created
 * @returns
 *  - **tx**: a new transaction that contains transferred Cluster cell
 */
export async function transferSporeCluster(params: {
  signer: ccc.Signer;
  id: ccc.HexLike;
  to: ccc.ScriptLike;
  tx?: ccc.TransactionLike;
}): Promise<{
  tx: ccc.Transaction;
}> {
  const { signer, id, to } = params;

  // prepare transaction
  const tx = ccc.Transaction.from(params.tx ?? {});

  // build cluster cell
  const { cell: cluster, celldep } = await findExistedSporeCellAndCelldep(
    signer.client,
    SporeScript.Cluster,
    id,
  );
  tx.inputs.push(
    ccc.CellInput.from({
      previousOutput: cluster.outPoint,
      ...cluster,
    }),
  );
  tx.addOutput(
    {
      lock: to,
      type: cluster.cellOutput.type,
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
  await tx.addCellDepInfos(signer.client, celldep);

  return {
    tx: await (cobuildRequired(tx)
      ? prepareSporeTransaction(signer, tx, [transferAction])
      : signer.prepareTransaction(tx)),
  };
}
