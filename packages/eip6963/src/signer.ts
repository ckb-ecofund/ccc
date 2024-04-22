import { ccc } from "@ckb-ccc/core";
import { cccA } from "@ckb-ccc/core/advanced";
import { EIP6963ProviderDetail } from "./advanced";

export class EIP6963Signer extends ccc.Signer {
  constructor(
    public readonly client: ccc.Client,
    public readonly detail: EIP6963ProviderDetail,
  ) {
    super();
  }

  async getClient(): Promise<ccc.Client> {
    return this.client;
  }

  async getEVMAccounts() {
    return this.detail.provider.request({ method: "eth_accounts" });
  }

  async getRecommendedAddress(): Promise<string> {
    const [address] = await this.getAddresses();
    return address;
  }

  async getAddresses(): Promise<string[]> {
    return this.getEVMAccounts();
  }

  async connect(): Promise<void> {
    await this.detail.provider.request({ method: "eth_requestAccounts" });
  }

  async signMessage(message: string | ccc.BytesLike): Promise<ccc.HexString> {
    const challenge =
      typeof message === "string" ? message : ccc.toHex(message);
    const [address] = await this.getEVMAccounts();

    return this.detail.provider.request({
      method: "personal_sign",
      params: [challenge, address],
    });
  }

  // Will be deprecated in the future
  async completeLumosTransaction(
    tx: cccA.TransactionSkeletonType,
  ): Promise<cccA.TransactionSkeletonType> {
    return tx;
  }

  // Will be deprecated in the future
  async signOnlyLumosTransaction(
    tx: cccA.TransactionSkeletonType,
  ): Promise<cccA.TransactionSkeletonType> {
    return tx;
  }
}
