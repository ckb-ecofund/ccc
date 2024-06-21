import { ccc } from "@ckb-ccc/core";
import { BIish, Cell, commons, config, helpers, Script, RPC, BI, Transaction, Indexer} from "@ckb-lumos/lumos";
import { blockchain } from "@ckb-lumos/lumos/codec";
import { formatUnit, parseUnit } from "@ckb-lumos/lumos/utils";

export function parseAddressToLockscript(address: string): Script {
  return helpers.parseAddress(
    address,
    {
      config: process.env.NODE_ENV === 'development' ? config.TESTNET : config.MAINNET
    }
  )
}

export async function getMinFeeRate(rpc: RPC | string): Promise<BI> {
  rpc = typeof rpc === 'string' ? new RPC(rpc) : rpc;
  const info = await rpc.txPoolInfo();
  return BI.from(info.minFeeRate);
}

export function calculateFeeByTransactionSkeleton(txSkeleton: helpers.TransactionSkeletonType, feeRate: BIish): BI {
  const tx = helpers.createTransactionFromSkeleton(txSkeleton);
  return calculateFeeByTransaction(tx, feeRate);
}

export function getTransactionSize(tx: Transaction): number {
  const serializedTx = blockchain.Transaction.pack(tx);
  return 4 + serializedTx.buffer.byteLength;
}

export function calculateFeeByTransaction(tx: Transaction, feeRate: BIish): BI {
  const size = getTransactionSize(tx);
  return calculateFee(size, feeRate);
}

export function calculateFee(size: number, feeRate: BIish): BI {
  const ratio = BI.from(1000);
  const base = BI.from(size).mul(feeRate);
  const fee = base.div(ratio);
  if (fee.mul(ratio).lt(base)) {
    return fee.add(1);
  }
  return BI.from(fee);
}

export async function payFeeByOutput(props: {
  txSkeleton: helpers.TransactionSkeletonType;
  outputIndex: number;
  isTestnet: boolean;
  feeRate?: BIish;
}): Promise<helpers.TransactionSkeletonType> {
  // Env
  const feeRate = props.feeRate ?? (await getMinFeeRate(props.isTestnet ? 'https://testnet.ckb.dev/rpc' : 'https://mainnet.ckbapp.dev/rpc' ));

  // Get TransactionSkeleton
  let txSkeleton = props.txSkeleton;

  // Get target output cell
  let outputs = txSkeleton.get('outputs');
  const output = outputs.get(props.outputIndex);
  if (!output) {
    throw new Error(`Cannot pay fee by Transaction.outputs[${props.outputIndex}] because it does not exist`);
  }

  // Check can pay fee with capacity margin
  const minimalCellCapacity = helpers.minimalCellCapacityCompatible(output);
  const outputCapacity = BI.from(output.cellOutput.capacity);
  const capacityMargin = outputCapacity.sub(minimalCellCapacity);
  const fee = calculateFeeByTransactionSkeleton(txSkeleton, feeRate);
  if (capacityMargin.lt(fee)) {
    throw new Error(`Cannot pay fee by Transaction.outputs[${props.outputIndex}] due to insufficient capacity`);
  }

  // Pay fee and update capacity
  output.cellOutput.capacity = outputCapacity.sub(fee).toHexString();
  outputs = outputs.set(props.outputIndex, output);
  return txSkeleton.set('outputs', outputs);
}



export async function getCapacity(address: string, isTestnet: boolean) {
  const indexerAddress =  isTestnet ? 'https://testnet.ckb.dev/indexer' : 'https://mainnet.ckbapp.dev/indexer';
  const indexer = new Indexer(indexerAddress);
  let totalCollectCapacity = BI.from(0);
  const collector = indexer.collector({
    lock: parseAddressToLockscript(address),
    type: "empty"
  })
  for await (const cell of collector.collect()) {
    totalCollectCapacity = totalCollectCapacity.add(cell.cellOutput.capacity);
  }
  return formatUnit(totalCollectCapacity, 'ckb');
}

export async function CCCTransferCKB(fromAddress: string, toAddress: string, amount: string, isTestnet: boolean) {
  //lumos config 
  const lumosConfig = process.env.NODE_ENV === 'development' ? config.TESTNET : config.MAINNET;

  //indexer 
  const indexerAddress = isTestnet ? 'https://testnet.ckb.dev/indexer' : 'https://mainnet.ckbapp.dev/indexer';
  const indexer = new Indexer(indexerAddress);

  //address lock parse
  const fromAddressLockScript = parseAddressToLockscript(fromAddress); 
  const toAddressLockScript = parseAddressToLockscript(toAddress);

  //amount
  // const amountInShannon = BI.from(parseFloat(amount) * 10 ** 8);
  const amountInShannon = amount;
  
  //init transaction skeleton
  let txSkeleton = helpers.TransactionSkeleton({
    cellProvider: indexer
  });

  //collected UTXO and Total Capacity
  const collectedCells: Cell[] = [];
  let totalCollectCapacity = BI.from(0);
  
  //init collector
  const collector = indexer.collector({
    lock: fromAddressLockScript,
    type: "empty"
  })

  //collect UXTO from sender lock
  for await (const cell of collector.collect()) {
      totalCollectCapacity = totalCollectCapacity.add(cell.cellOutput.capacity);
      collectedCells.push(cell);
      if (BI.from(totalCollectCapacity).gte(amountInShannon)) break;
  }

  //To Receiver Address 
  const outputCell: Cell[] = [{
      cellOutput: {
          capacity: BI.from(amountInShannon).toHexString(),
          lock: toAddressLockScript,
      },
      data: "0x",
  }];

  // Change for sender address
  if (totalCollectCapacity.sub(amountInShannon).toNumber()) {
      outputCell.push({
          cellOutput: {
              capacity: totalCollectCapacity.sub(amountInShannon).toHexString(),
              lock: fromAddressLockScript,
          },
          data: '0x'
      })
  }

  //Construct txSkeleton
  txSkeleton = txSkeleton.update('inputs', (inputs) => inputs.push(...collectedCells));
  txSkeleton = txSkeleton.update('outputs', (outputs) => outputs.push(...outputCell));
  txSkeleton = txSkeleton.update("cellDeps", (cellDeps) =>
      cellDeps.push(
      {
          outPoint: {
          txHash: lumosConfig.SCRIPTS.OMNILOCK?.TX_HASH!!, 
          index: lumosConfig.SCRIPTS.OMNILOCK?.INDEX!!,
          },
          depType: lumosConfig.SCRIPTS.OMNILOCK?.DEP_TYPE!!,
      },
      {
          outPoint: {
          txHash: lumosConfig.SCRIPTS.SECP256K1_BLAKE160!!.TX_HASH,
          index: lumosConfig.SCRIPTS.SECP256K1_BLAKE160!!.INDEX,
          },
          depType: lumosConfig.SCRIPTS.SECP256K1_BLAKE160!!.DEP_TYPE,
      }
      )
  );
  txSkeleton = await payFeeByOutput({
    txSkeleton,
    outputIndex: 0,
    feeRate: 3000,
    isTestnet
  })
  return txSkeleton
}