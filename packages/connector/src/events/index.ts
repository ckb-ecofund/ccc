export class WillUpdateEvent extends Event {
  constructor() {
    super("willUpdate", { composed: true });
  }
}

export class ClosedEvent extends Event {
  constructor() {
    super("closed", { composed: true });
  }
}
