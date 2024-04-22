import { Client } from "../client";
import { Script } from "../types";

export abstract class Address {
  abstract getClient(): Promise<Client>;

  abstract getAddress(): Promise<string>;
  abstract getScript(): Promise<Script>;
}
