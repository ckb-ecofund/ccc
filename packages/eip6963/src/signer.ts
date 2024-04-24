import { ccc } from "@ckb-ccc/core";
import { EIP6963ProviderDetail } from "./advanced";

export class EIP6963Signer extends ccc.Signer {
  constructor(
    client: ccc.Client,
    public readonly detail: EIP6963ProviderDetail,
  ) {
    super(client);
  }

  async getEVMAccounts() {
    return this.detail.provider.request({ method: "eth_accounts" });
  }

  async getInternalAddress(): Promise<string> {
    return (await this.getEVMAccounts())[0];
  }

  async getAddressObjs(): Promise<ccc.Address[]> {
    const accounts = await this.getEVMAccounts();
    return Promise.all(
      accounts.map((account) =>
        ccc.Address.fromKnownScript(
          ccc.KnownScript.OmniLock,
          ccc.toHex([0x12, ...ccc.toBytes(account), 0x00]),
          this.client,
        ),
      ),
    );
  }

  async connect(): Promise<void> {
    await this.detail.provider.request({ method: "eth_requestAccounts" });
  }

  async signMessage(message: string | ccc.BytesLike): Promise<ccc.Hex> {
    const challenge =
      typeof message === "string" ? message : ccc.toHex(message);
    const [address] = await this.getEVMAccounts();

    return this.detail.provider.request({
      method: "personal_sign",
      params: [challenge, address],
    });
  }

  async signOnlyTransaction(tx: ccc.Transaction): Promise<ccc.Transaction> {
    const { script } = await this.getRecommendedAddressObj();
    const info = await ccc.getSignHashInfo(tx, script);
    if (!info) {
      return tx;
    }

    const signature = ccc.toBytes(
      await this.signMessage(`CKB transaction: ${info.message}`),
    );
    if (signature[signature.length - 1] >= 27) {
      signature[signature.length - 1] -= 27;
    }

    const witness = ccc.WitnessArgs.decode(tx.witnesses[info.position]);
    witness.lock = ccc.toHex(
      ccc.concatBytes(
        ccc.toBytesFromNumber(5 * 4 + signature.length, 4),
        ccc.toBytesFromNumber(4 * 4, 4),
        ccc.toBytesFromNumber(5 * 4 + signature.length, 4),
        ccc.toBytesFromNumber(5 * 4 + signature.length, 4),
        ccc.toBytesFromNumber(signature.length, 4),
        signature,
      ),
    );

    tx.witnesses[info.position] = ccc.toHex(ccc.WitnessArgs.encode(witness));

    return tx;
  }
}
