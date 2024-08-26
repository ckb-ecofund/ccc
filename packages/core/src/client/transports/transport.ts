export type JsonRpcPayload = {
  id: number;
  jsonrpc: "2.0";
  method: string;
  params: unknown[] | Record<string, unknown>;
};

export interface Transport {
  request(data: JsonRpcPayload): Promise<unknown>;
}
