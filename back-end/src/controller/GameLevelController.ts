import { Request, Response, NextFunction } from "express";
import { gameLevelService } from "../service/GameLevelService";

export class GameLevelController {
  async updateGameLevelStatus(req: Request, res: Response, next: NextFunction) {
    return gameLevelService.updateGameLevelStatus(req, res);
  }

  async claimGameLevelReward(req: Request, res: Response, next: NextFunction) {
    return gameLevelService.claimGameLevelReward(req, res);
  }

  async unlockNextGameLevel(req: Request, res: Response, next: NextFunction) {
    return gameLevelService.unlockNextGameLevel(req, res);
  }
}
