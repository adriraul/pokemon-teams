import { Request, Response } from "express";
import { LevelTimeTrackingService } from "../service/LevelTimeTrackingService";

export class LevelTimeTrackingController {
  private levelTimeTrackingService: LevelTimeTrackingService;

  constructor() {
    this.levelTimeTrackingService = new LevelTimeTrackingService();
  }

  /**
   * Inicia el seguimiento de tiempo para un nivel
   */
  async startLevel(req: Request, res: Response): Promise<void> {
    try {
      const { levelNumber, levelType = "game" } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }

      if (!levelNumber || typeof levelNumber !== "number") {
        res.status(400).json({ error: "Número de nivel requerido" });
        return;
      }

      if (levelType && !["game", "league"].includes(levelType)) {
        res.status(400).json({ error: "Tipo de nivel debe ser 'game' o 'league'" });
        return;
      }

      const tracking = await this.levelTimeTrackingService.startLevel(userId, levelNumber, levelType);
      
      res.status(201).json({
        message: "Seguimiento de tiempo iniciado",
        tracking
      });
    } catch (error: any) {
      if (error.message.includes("ya ha iniciado")) {
        res.status(409).json({ error: error.message });
      } else {
        console.error("Error al iniciar nivel:", error);
        res.status(500).json({ error: "Error interno del servidor" });
      }
    }
  }

  /**
   * Finaliza el seguimiento de tiempo para un nivel
   */
  async completeLevel(req: Request, res: Response): Promise<void> {
    try {
      const { levelNumber, levelType = "game" } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }

      if (!levelNumber || typeof levelNumber !== "number") {
        res.status(400).json({ error: "Número de nivel requerido" });
        return;
      }

      if (levelType && !["game", "league"].includes(levelType)) {
        res.status(400).json({ error: "Tipo de nivel debe ser 'game' o 'league'" });
        return;
      }

      const tracking = await this.levelTimeTrackingService.completeLevel(userId, levelNumber, levelType);
      
      res.status(200).json({
        message: "Nivel completado",
        tracking
      });
    } catch (error: any) {
      if (error.message.includes("No se encontró")) {
        res.status(404).json({ error: error.message });
      } else {
        console.error("Error al completar nivel:", error);
        res.status(500).json({ error: "Error interno del servidor" });
      }
    }
  }

  /**
   * Obtiene las estadísticas de tiempo de un usuario
   */
  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }

      const stats = await this.levelTimeTrackingService.getUserTimeStats(userId);
      
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Obtiene el historial de niveles de un usuario
   */
  async getUserHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }

      const history = await this.levelTimeTrackingService.getUserLevelHistory(userId);
      
      res.status(200).json(history);
    } catch (error) {
      console.error("Error al obtener historial:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Obtiene estadísticas por tipo de nivel
   */
  async getLevelTypeStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }

      const stats = await this.levelTimeTrackingService.getUserLevelTypeStats(userId);
      
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error al obtener estadísticas por tipo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Obtiene el tiempo de inicio de un nivel específico
   */
  async getLevelStartTime(req: Request, res: Response): Promise<void> {
    try {
      const { levelNumber, levelType = "game" } = req.query;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }

      if (!levelNumber || isNaN(Number(levelNumber))) {
        res.status(400).json({ error: "Número de nivel requerido" });
        return;
      }

      if (levelType && !["game", "league"].includes(levelType as string)) {
        res.status(400).json({ error: "Tipo de nivel debe ser 'game' o 'league'" });
        return;
      }

      const startTime = await this.levelTimeTrackingService.getLevelStartTime(
        userId, 
        Number(levelNumber), 
        levelType as "game" | "league"
      );
      
      res.status(200).json({ startTime });
    } catch (error) {
      console.error("Error al obtener tiempo de inicio:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
