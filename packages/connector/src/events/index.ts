export class WillUpdateEvent extends Event {
  constructor() {
    super("willUpdate", { composed: true });
  }
}
