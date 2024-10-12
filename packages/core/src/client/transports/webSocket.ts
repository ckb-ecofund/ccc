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
  private socket?: WebSocket;
  private openSocket?: Promise<WebSocket>;

  constructor(
    private readonly url: string,
    private readonly timeout = 30000,
  ) {}

  request(data: JsonRpcPayload) {
    const socket = (() => {
      if (
        this.socket &&
        this.socket.readyState !== this.socket.CLOSING &&
        this.socket.readyState !== this.socket.CLOSED &&
        this.openSocket
      ) {
        return this.openSocket;
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
        const [resolve, _, timeout] = req;
        clearTimeout(timeout);
        this.ongoing.delete(res.id);

        resolve(res);
      };
      const onClose = () => {
        this.ongoing.forEach(([_, reject, timeout]) => {
          clearTimeout(timeout);
          reject(new Error("Connection closed"));
        });
        this.ongoing.clear();
      };

      socket.onclose = onClose;
      socket.onerror = onClose;
      socket.onmessage = onMessage;

      this.socket = socket;
      this.openSocket = new Promise<WebSocket>((resolve) => {
        if (socket.readyState === socket.OPEN) {
          resolve(socket);
        } else {
          socket.onopen = () => {
            resolve(socket);
          };
        }
      });
      return this.openSocket;
    })();

    return new Promise((resolve, reject) => {
      const req: [
        (res: unknown) => unknown,
        (err: unknown) => unknown,
        ReturnType<typeof setTimeout>,
      ] = [
        resolve,
        reject,
        setTimeout(() => {
          this.ongoing.delete(data.id);
          socket.then((socket) => socket.close());
          reject(new Error("Request timeout"));
        }, this.timeout),
      ];
      this.ongoing.set(data.id, req);

      socket.then((socket) => {
        if (
          socket.readyState === socket.CLOSED ||
          socket.readyState === socket.CLOSING
        ) {
          clearTimeout(req[2]);
          this.ongoing.delete(data.id);
          reject(new Error("Connection closed"));
        } else {
          socket.send(JSON.stringify(data));
        }
      });
    });
  }
}
