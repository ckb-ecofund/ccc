import fetch from "cross-fetch";
import type { Client } from "../client";
import { CkbRpcMethods, JsonRpcMethod, JsonRpcPayload } from "./advanced";

export interface ClientJsonRpc extends Pick<Client, "sendTransaction"> {}

async function transform(
  value: unknown,
  transformer?: (i: unknown) => unknown,
) {
  if (transformer) {
    return transformer(value);
  }
  return value;
}

export abstract class ClientJsonRpc implements Pick<Client, "sendTransaction"> {
  constructor(
    private readonly url: string,
    private readonly timeout = 30000,
  ) {
    CkbRpcMethods.map((method) =>
      Object.defineProperty(this, method.method, {
        value: this.buildSender(method),
        enumerable: true,
      }),
    );
  }

  getUrl() {
    return this.url;
  }

  buildSender({ rpcMethod, inTransformers, outTransformer }: JsonRpcMethod) {
    return async (...req: unknown[]) => {
      const payload = ClientJsonRpc.buildPayload(
        rpcMethod,
        await Promise.all(req.map((v, i) => transform(v, inTransformers[i]))),
      );

      return transform(await this.send(payload), outTransformer);
    };
  }

  async send(payload: JsonRpcPayload) {
    const aborter = new AbortController();
    const abortTimer = setTimeout(() => aborter.abort(), this.timeout);

    const raw = await fetch(this.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: aborter.signal,
    });
    clearTimeout(abortTimer);

    const res = (await raw.json()) as {
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

  static buildPayload(method: string, req: unknown[]): JsonRpcPayload {
    return {
      id: Math.round(Math.random() * 10000),
      method,
      params: req,
      jsonrpc: "2.0",
    };
  }
}
