import { AppDataSource } from "../data-source";
import { TypeInteraction } from "../entity/TypeInteraction";

export class TypeInteractionService {
  private typeInteractionRepository =
    AppDataSource.getRepository(TypeInteraction);

  async getDamageMultiplier(
    attackTypeId: number,
    defenseTypeId: number
  ): Promise<number> {
    const interaction = await this.typeInteractionRepository.findOne({
      where: {
        attackType: { id: attackTypeId },
        defenseType: { id: defenseTypeId },
      },
    });

    if (!interaction) {
      return 1;
    }

    return interaction.multiplier;
  }
}

const typeInteractionService = new TypeInteractionService();

export { typeInteractionService };
