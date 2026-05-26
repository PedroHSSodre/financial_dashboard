export class CreditCardDomainError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "CreditCardDomainError";
    }
}