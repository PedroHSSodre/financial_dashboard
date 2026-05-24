import { 
  makeCreateCreditCardUseCase, 
  type CreateCreditCardInput 
} from "@/core/application/useCases/creditCard/createCreditCardUseCase";
import { DexieCreditCardsRepository } from "@/lib/repositories/creditCardsRepository";

const createCreditCardUseCase = makeCreateCreditCardUseCase({
  creditCardRepository: new DexieCreditCardsRepository(),
  generateId: () => crypto.randomUUID(),
});

export type { CreateCreditCardInput };

export async function createCreditCard(input: CreateCreditCardInput) {
  await createCreditCardUseCase(input);
}