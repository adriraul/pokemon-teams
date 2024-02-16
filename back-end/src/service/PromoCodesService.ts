import { AppDataSource } from "../data-source";
import { PromoCodes } from "../entity/PromoCodes";

export class PromoCodesService {
  private promoCodesRepository = AppDataSource.getRepository(PromoCodes);

  async getAllPromoCodes() {
    return this.promoCodesRepository.find();
  }

  async getPromoCodeByCode(code: string) {
    return await this.promoCodesRepository.findOne({
      where: { code },
    });
  }

  async savePromoCode(promoCodeData: any) {
    const promoCode = new PromoCodes();
    promoCode.code = promoCodeData.code;
    promoCode.expirationDate = new Date();
    return this.promoCodesRepository.save(promoCode);
  }

  async removePromoCode(id: number) {
    const promoCodesToRemove = await this.promoCodesRepository.findOne({
      where: { id },
    });
    if (!promoCodesToRemove) {
      return "This PromoCodes does not exist";
    }

    await this.promoCodesRepository.remove(promoCodesToRemove);
    return "PromoCodes has been removed";
  }
}

const promoCodesService = new PromoCodesService();

export { promoCodesService };
