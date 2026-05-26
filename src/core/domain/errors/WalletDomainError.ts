export class WalletDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletDomainError";
  }
}
