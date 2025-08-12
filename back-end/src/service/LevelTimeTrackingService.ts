import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { LevelTimeTracking } from "../entity/LevelTimeTracking";
import { User } from "../entity/User";

export class LevelTimeTrackingService {
  private levelTimeTrackingRepository: Repository<LevelTimeTracking>;

  constructor() {
    this.levelTimeTrackingRepository = AppDataSource.getRepository(LevelTimeTracking);
  }

  /**
   * Registra el inicio de un nivel
   */
  async startLevel(userId: number, levelNumber: number, levelType: "game" | "league" = "game"): Promise<LevelTimeTracking> {
    // Verificar si ya existe un registro de inicio para este nivel
    const existingTracking = await this.levelTimeTrackingRepository.findOne({
      where: {
        user: { id: userId },
        levelNumber,
        levelType,
        completed: false
      }
    });

    if (existingTracking) {
      throw new Error(`El usuario ya ha iniciado este nivel`);
    }

    const tracking = new LevelTimeTracking();
    tracking.user = { id: userId } as User;
    tracking.levelNumber = levelNumber;
    tracking.levelType = levelType;
    tracking.startTime = new Date();
    tracking.completed = false;

    return await this.levelTimeTrackingRepository.save(tracking);
  }

  /**
   * Registra la finalización de un nivel
   */
  async completeLevel(userId: number, levelNumber: number, levelType: "game" | "league" = "game"): Promise<LevelTimeTracking> {
    const tracking = await this.levelTimeTrackingRepository.findOne({
      where: {
        user: { id: userId },
        levelNumber,
        levelType,
        completed: false
      }
    });

    if (!tracking) {
      throw new Error(`No se encontró un registro de inicio para este nivel`);
    }

    tracking.completionTime = new Date();
    tracking.completed = true;
    
    // Calcular tiempo transcurrido en segundos
    const timeDiff = tracking.completionTime.getTime() - tracking.startTime.getTime();
    tracking.timeSpentSeconds = Math.floor(timeDiff / 1000);

    return await this.levelTimeTrackingRepository.save(tracking);
  }

  /**
   * Obtiene el tiempo de inicio de un nivel
   */
  async getLevelStartTime(userId: number, levelNumber: number, levelType: "game" | "league" = "game"): Promise<Date | null> {
    const tracking = await this.levelTimeTrackingRepository.findOne({
      where: {
        user: { id: userId },
        levelNumber,
        levelType,
        completed: false
      }
    });

    return tracking ? tracking.startTime : null;
  }

  /**
   * Obtiene estadísticas de tiempos para un usuario
   */
  async getUserTimeStats(userId: number): Promise<{
    totalLevelsCompleted: number;
    totalTimeSpent: number;
    averageTimePerLevel: number;
    fastestLevel: { levelNumber: number; levelType: string; timeSpent: number } | null;
    slowestLevel: { levelNumber: number; levelType: string; timeSpent: number } | null;
  }> {
    const completedLevels = await this.levelTimeTrackingRepository.find({
      where: {
        user: { id: userId },
        completed: true
      },
      order: {
        timeSpentSeconds: "ASC"
      }
    });

    if (completedLevels.length === 0) {
      return {
        totalLevelsCompleted: 0,
        totalTimeSpent: 0,
        averageTimePerLevel: 0,
        fastestLevel: null,
        slowestLevel: null
      };
    }

    const totalTimeSpent = completedLevels.reduce((sum, level) => sum + (level.timeSpentSeconds || 0), 0);
    const averageTimePerLevel = totalTimeSpent / completedLevels.length;

    const fastestLevel = completedLevels[0];
    const slowestLevel = completedLevels[completedLevels.length - 1];

    return {
      totalLevelsCompleted: completedLevels.length,
      totalTimeSpent,
      averageTimePerLevel: Math.round(averageTimePerLevel),
      fastestLevel: fastestLevel ? {
        levelNumber: fastestLevel.levelNumber,
        levelType: fastestLevel.levelType,
        timeSpent: fastestLevel.timeSpentSeconds || 0
      } : null,
      slowestLevel: slowestLevel ? {
        levelNumber: slowestLevel.levelNumber,
        levelType: slowestLevel.levelType,
        timeSpent: slowestLevel.timeSpentSeconds || 0
      } : null
    };
  }

  /**
   * Obtiene el historial completo de niveles para un usuario
   */
  async getUserLevelHistory(userId: number): Promise<LevelTimeTracking[]> {
    return await this.levelTimeTrackingRepository.find({
      where: {
        user: { id: userId }
      },
      order: {
        levelNumber: "ASC",
        levelType: "ASC"
      }
    });
  }

  /**
   * Obtiene estadísticas por tipo de nivel (game vs league)
   */
  async getUserLevelTypeStats(userId: number): Promise<{
    gameLevels: { completed: number; totalTime: number; averageTime: number };
    leagueLevels: { completed: number; totalTime: number; averageTime: number };
  }> {
    const gameLevels = await this.levelTimeTrackingRepository.find({
      where: {
        user: { id: userId },
        levelType: "game",
        completed: true
      }
    });

    const leagueLevels = await this.levelTimeTrackingRepository.find({
      where: {
        user: { id: userId },
        levelType: "league",
        completed: true
      }
    });

    const calculateStats = (levels: LevelTimeTracking[]) => {
      if (levels.length === 0) return { completed: 0, totalTime: 0, averageTime: 0 };
      
      const totalTime = levels.reduce((sum, level) => sum + (level.timeSpentSeconds || 0), 0);
      return {
        completed: levels.length,
        totalTime,
        averageTime: Math.round(totalTime / levels.length)
      };
    };

    return {
      gameLevels: calculateStats(gameLevels),
      leagueLevels: calculateStats(leagueLevels)
    };
  }
}
