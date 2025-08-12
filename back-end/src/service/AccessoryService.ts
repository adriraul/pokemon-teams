import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Accessory } from "../entity/Accesory";

export class AccessoryService {
  private accessoryRepository = AppDataSource.getRepository(Accessory);

  async getAccessoryByCode(req: Request, res: Response) {
    const accessoryCode = req.params.code;

    try {
      const accessory = await this.accessoryRepository.findOne({
        where: { code: accessoryCode },
      });

      if (!accessory) {
        return res.status(404).json({ message: "Accessory not found" });
      }

      res.json(accessory);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
}

const accessoryService = new AccessoryService();
export { accessoryService };
