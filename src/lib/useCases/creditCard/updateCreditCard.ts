import { 
  makeEditCreditCardUseCase, 
  type EditCreditCardInput 
} from "@/core/application/useCases/creditCard/editCreditCardUseCase";
import { DexieCreditCardsRepository } from "@/lib/repositories/creditCardsRepository";

const updateCreditCardUseCase = makeEditCreditCardUseCase({
  creditCardRepository: new DexieCreditCardsRepository(),
});

export type { EditCreditCardInput };

export async function updateCreditCard(input: EditCreditCardInput) {
  await updateCreditCardUseCase(input);
}