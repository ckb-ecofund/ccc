import { TransactionLike } from "../../ckb/index.js";
import { Hex, HexLike, hexFrom } from "../../hex/index.js";
import { Num, NumLike, numFrom, numToHex } from "../../num/index.js";
import { apply } from "../../utils/index.js";
import { ClientCache } from "../cache/index.js";
import { Client } from "../client.js";
import {
  ClientFindCellsResponse,
  ClientIndexerSearchKeyLike,
  ClientTransactionResponse,
  OutputsValidator,
} from "../clientTypes.js";
import {
  JsonRpcPayload,
  Transport,
  transportFromUri,
} from "../transports/advanced.js";
import { JsonRpcTransformers } from "./advanced.js";

/**
 * Applies a transformation function to a value if the transformer is provided.
 *
 * @param value - The value to be transformed.
 * @param transformer - An optional transformation function.
 * @returns The transformed value if a transformer is provided, otherwise the original value.
 *
 * @example
 * ```typescript
 * const result = await transform(5, (x) => x * 2); // Outputs 10
 * const resultWithoutTransformer = await transform(5); // Outputs 5
 * ```
 */

async function transform(
  value: unknown,
  transformer?: (i: unknown) => unknown,
) {
  if (transformer) {
    return transformer(value);
  }
  return value;
}

/**
 * An abstract class implementing JSON-RPC client functionality for a specific URL and timeout.
 * Provides methods for sending transactions and building JSON-RPC payloads.
 */

export abstract class ClientJsonRpc extends Client {
  private readonly transport: Transport;

  /**
   * Creates an instance of ClientJsonRpc.
   *
   * @param url_ - The URL of the JSON-RPC server.
   * @param timeout - The timeout for requests in milliseconds
   */

  constructor(
    private readonly url_: string,
    config?: { timeout?: number; cache?: ClientCache },
  ) {
    super(config);

    this.transport = transportFromUri(url_, config);
  }

  /**
   * Returns the URL of the JSON-RPC server.
   *
   * @returns The URL of the JSON-RPC server.
   */

  get url(): string {
    return this.url_;
  }

  /**
   * Get tip block number
   *
   * @returns Tip block number
   */

  getTip = this.buildSender(
    "get_tip_block_number",
    [],
    numFrom,
  ) as () => Promise<Num>;

  /**
   * Get tip block header
   *
   * @param verbosity - result format which allows 0 and 1. (Optional, the default is 1.)
   * @returns BlockHeader
   */
  getTipHeader = this.buildSender("get_tip_header", [], (b) =>
    apply(JsonRpcTransformers.blockHeaderTo, b),
  ) as Client["getTipHeader"];

  /**
   * Get block by block number
   *
   * @param blockNumber - The block number.
   * @param verbosity - result format which allows 0 and 2. (Optional, the default is 2.)
   * @param withCycles - whether the return cycles of block transactions. (Optional, default false.)
   * @returns Block
   */
  getBlockByNumber = this.buildSender(
    "get_block_by_number",
    [(v: NumLike) => numToHex(numFrom(v))],
    (b) => apply(JsonRpcTransformers.blockTo, b),
  ) as Client["getBlockByNumber"];

  /**
   * Get block by block hash
   *
   * @param blockHash - The block hash.
   * @param verbosity - result format which allows 0 and 2. (Optional, the default is 2.)
   * @param withCycles - whether the return cycles of block transactions. (Optional, default false.)
   * @returns Block
   */
  getBlockByHash = this.buildSender("get_block", [hexFrom], (b) =>
    apply(JsonRpcTransformers.blockTo, b),
  ) as Client["getBlockByHash"];

  /**
   * Get header by block number
   *
   * @param blockNumber - The block number.
   * @param verbosity - result format which allows 0 and 1. (Optional, the default is 1.)
   * @returns BlockHeader
   */
  getHeaderByNumber = this.buildSender(
    "get_header_by_number",
    [(v: NumLike) => numToHex(numFrom(v))],
    (b) => apply(JsonRpcTransformers.blockHeaderTo, b),
  ) as Client["getHeaderByNumber"];

  /**
   * Get header by block hash
   *
   * @param blockHash - The block hash.
   * @param verbosity - result format which allows 0 and 1. (Optional, the default is 1.)
   * @returns BlockHeader
   */
  getHeaderByHash = this.buildSender("get_header", [hexFrom], (b) =>
    apply(JsonRpcTransformers.blockHeaderTo, b),
  ) as Client["getHeaderByHash"];

  /**
   * Estimate cycles of a transaction.
   *
   * @param transaction - The transaction to estimate.
   * @returns Consumed cycles
   */
  estimateCycles = this.buildSender(
    "estimate_cycles",
    [JsonRpcTransformers.transactionFrom],
    ({ cycles }: { cycles: NumLike }) => numFrom(cycles),
  ) as Client["estimateCycles"];

  /**
   * Test a transaction.
   *
   * @param transaction - The transaction to test.
   * @param validator - "passthrough": Disable validation. "well_known_scripts_only": Only accept well known scripts in the transaction.
   * @returns Consumed cycles
   */

  sendTransactionDry = this.buildSender(
    "test_tx_pool_accept",
    [JsonRpcTransformers.transactionFrom],
    ({ cycles }: { cycles: NumLike }) => numFrom(cycles),
  ) as Client["sendTransactionDry"];

  /**
   * Send a transaction to node.
   *
   * @param transaction - The transaction to send.
   * @param validator - "passthrough": Disable validation. "well_known_scripts_only": Only accept well known scripts in the transaction.
   * @returns Transaction hash.
   */

  sendTransactionNoCache = this.buildSender(
    "send_transaction",
    [JsonRpcTransformers.transactionFrom],
    hexFrom,
  ) as (
    transaction: TransactionLike,
    validator?: OutputsValidator | undefined,
  ) => Promise<Hex>;

  /**
   * Get a transaction from node.
   *
   * @param txHash - The hash of the transaction.
   * @returns The transaction with status.
   */

  getTransactionNoCache = this.buildSender(
    "get_transaction",
    [hexFrom],
    JsonRpcTransformers.transactionResponseTo,
  ) as (txHash: HexLike) => Promise<ClientTransactionResponse | undefined>;

  /**
   * find cells from node.
   *
   * @param key - The search key of cells.
   * @param order - The order of cells.
   * @param limit - The max return size of cells.
   * @param after - Pagination parameter.
   * @returns The found cells.
   */

  findCellsPagedNoCache = this.buildSender(
    "get_cells",
    [
      JsonRpcTransformers.indexerSearchKeyFrom,
      (order) => order ?? "asc",
      (limit) => numToHex(limit ?? 10),
    ],
    JsonRpcTransformers.findCellsResponseTo,
  ) as (
    key: ClientIndexerSearchKeyLike,
    order?: "asc" | "desc",
    limit?: NumLike,
    after?: string,
  ) => Promise<ClientFindCellsResponse>;

  /**
   * find transactions from node.
   *
   * @param key - The search key of transactions.
   * @param order - The order of transactions.
   * @param limit - The max return size of transactions.
   * @param after - Pagination parameter.
   * @returns The found transactions.
   */

  findTransactionsPaged = this.buildSender(
    "get_transactions",
    [
      JsonRpcTransformers.indexerSearchKeyTransactionFrom,
      (order) => order ?? "asc",
      (limit) => numToHex(limit ?? 10),
    ],
    JsonRpcTransformers.findTransactionsResponseTo,
  ) as Client["findTransactionsPaged"];

  /**
   * get cells capacity from node.
   *
   * @param key - The search key of cells.
   * @returns The sum of cells capacity.
   */

  getCellsCapacity = this.buildSender(
    "get_cells_capacity",
    [JsonRpcTransformers.indexerSearchKeyFrom],
    ({ capacity }) => numFrom(capacity),
  ) as (key: ClientIndexerSearchKeyLike) => Promise<Num>;

  /**
   * Builds a sender function for a JSON-RPC method.
   *
   * @param rpcMethod - The JSON-RPC method.
   * @param inTransformers - An array of input transformers.
   * @param outTransformer - An output transformer function.
   * @returns A function that sends a JSON-RPC request with the given method and transformed parameters.
   */

  buildSender(
    rpcMethod: string,
    inTransformers: (((_: any) => unknown) | undefined)[],
    outTransformer?: (_: any) => unknown,
  ): (...req: unknown[]) => Promise<unknown> {
    return async (...req: unknown[]) => {
      const payload = ClientJsonRpc.buildPayload(
        rpcMethod,
        await Promise.all(
          req
            .concat(
              Array.from(
                new Array(Math.max(inTransformers.length - req.length, 0)),
              ),
            )
            .map((v, i) => transform(v, inTransformers[i])),
        ),
      );

      return transform(await this.send(payload), outTransformer);
    };
  }

  /**
   * Sends a JSON-RPC request to the server.
   *
   * @param payload - The JSON-RPC payload to send.
   * @returns The result of the JSON-RPC request.
   *
   * @throws Will throw an error if the response ID does not match the request ID, or if the response contains an error.
   */
  async send(payload: JsonRpcPayload): Promise<unknown> {
    const res = (await this.transport.request(payload)) as {
      id: number;
      error: unknown;
      result: unknown;
    };
    if (res.id !== payload.id) {
      throw new Error(`Id mismatched, got ${res.id}, expected ${payload.id}`);
    }
    if (res.error) {
      throw res.error;
    }
    return res.result;
  }

  /**
   * Builds a JSON-RPC payload for the given method and parameters.
   *
   * @param method - The JSON-RPC method name.
   * @param req - The parameters for the JSON-RPC method.
   * @returns The JSON-RPC payload.
   */

  static buildPayload(method: string, req: unknown[]): JsonRpcPayload {
    return {
      id: Math.round(Math.random() * 10000),
      method,
      params: req,
      jsonrpc: "2.0",
    };
  }
}
