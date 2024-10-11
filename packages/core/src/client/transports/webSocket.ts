import WebSocket from "isomorphic-ws";
import { JsonRpcPayload, Transport } from "./transport.js";

export class TransportWebSocket implements Transport {
  private ongoing: Map<
    number,
    [
      (response: unknown) => unknown,
      (error: unknown) => unknown,
      ReturnType<typeof setTimeout>,
    ]
  > = new Map();
  private socket?: Promise<WebSocket>;

  constructor(
    private readonly url: string,
    private readonly timeout = 30000,
  ) {}

  request(data: JsonRpcPayload) {
    const socket = (this.socket ?? Promise.resolve(undefined)).then(
      (existed) => {
        if (
          existed &&
          existed.readyState !== existed.CLOSING &&
          existed.readyState !== existed.CLOSED
        ) {
          return existed;
        }

        const socket = new WebSocket(this.url);
        const onMessage = ({ data }: { data: string }) => {
          const res = JSON.parse(data);
          if (typeof res !== "object" || res === null) {
            throw new Error(`Unknown response ${data}`);
          }

          const req = this.ongoing.get(res.id);
          if (!req) {
            return;
          }
          clearTimeout(req[2]);
          this.ongoing.delete(res.id);

          req[0](res);
        };
        const onClose = () => {
          this.socket = undefined;
          this.ongoing.forEach(([_, onError]) =>
            onError(new Error("Connection closed")),
          );
          this.ongoing.clear();
        };

        socket.onclose = onClose;
        socket.onerror = onClose;
        socket.onmessage = onMessage;

        this.socket = new Promise((resolve) => {
          if (socket.readyState === socket.OPEN) {
            resolve(undefined);
          } else {
            socket.onopen = resolve;
          }
        }).then(() => socket);
        return this.socket;
      },
    );

    return new Promise((resolve, reject) => {
      this.ongoing.set(data.id, [
        resolve,
        reject,
        setTimeout(() => {
          socket.then((socket) => socket.close());
          reject(new Error("Request timeout"));
        }, this.timeout),
      ]);
      socket.then((socket) => {
        if (
          socket.readyState === socket.CLOSED ||
          socket.readyState === socket.CLOSING
        ) {
          reject(new Error("Connection closed"));
        } else {
          socket.send(JSON.stringify(data));
        }
      });
    });
  }
}
