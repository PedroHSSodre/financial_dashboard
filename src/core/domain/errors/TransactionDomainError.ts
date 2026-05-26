export class TransactionDomainError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "TransactionDomainError";
    }
}