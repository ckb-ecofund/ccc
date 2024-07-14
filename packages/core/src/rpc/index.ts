import { Hex } from "../hex";
import {
  deepCamel,
  toGetCellsSearchKey,
  toGetTransactionsSearchKey,
} from "./parseFormatter";
import {
  GetCellsSearchKey,
  GetLiveCellsResult,
  GetTransactionsSearchKey,
  IndexerTransactionList,
  JsonRpcRequest,
  JsonRpcResponse,
  Order,
  Tip,
} from "./rpc.advanced";

class IndexerRequestError extends Error {
  constructor(
    message: string,
    public code?: number,
    public data?: any,
  ) {
    super(message);
    this.name = "IndexerRequestError";
  }
}

const request = async <T>(
  ckbIndexerUrl: string,
  method: string,
  params?: any,
): Promise<T> => {
  const requestBody: JsonRpcRequest = {
    id: 0,
    jsonrpc: "2.0",
    method,
    params,
  };

  const response = await fetch(ckbIndexerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(
      `Indexer request failed with HTTP status code ${response.status}`,
    );
  }

  const responseData: JsonRpcResponse<T> = await response.json();

  if (responseData.error) {
    throw new IndexerRequestError(
      `Indexer request RPC failed with error: ${responseData.error.message}`,
      responseData.error.code,
      responseData.error.data,
    );
  }

  if (responseData.result === undefined) {
    throw new Error("Indexer request RPC failed with an unknown error");
  }

  return responseData.result;
};

export class RPC {
  private uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  async getTip(): Promise<Tip> {
    return deepCamel(await request(this.uri, "get_tip"));
  }

  async getCells<WithData extends boolean = true>(
    searchKey: GetCellsSearchKey<WithData>,
    order: Order,
    limit: Hex,
    cursor?: string,
  ): Promise<GetLiveCellsResult<WithData>> {
    const params = [toGetCellsSearchKey(searchKey), order, limit, cursor];
    return deepCamel(await request(this.uri, "get_cells", params));
  }

  async getTransactions<Grouped extends boolean = false>(
    searchKey: GetTransactionsSearchKey<Grouped>,
    order: Order,
    limit: Hex,
    cursor?: string,
  ): Promise<IndexerTransactionList<Grouped>> {
    const params = [
      toGetTransactionsSearchKey(searchKey),
      order,
      limit,
      cursor,
    ];
    return deepCamel(await request(this.uri, "get_transactions", params));
  }

  async getIndexerInfo(): Promise<string> {
    return deepCamel(await request(this.uri, "get_indexer_info"));
  }
}
