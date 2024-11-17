import { NextFunction, Request, Response } from "express";
import { accessoryService } from "../service/AccessoryService";

export class AccessoryController {
  async getAccessoryByCode(req: Request, res: Response, next: NextFunction) {
    return accessoryService.getAccessoryByCode(req, res);
  }
}
