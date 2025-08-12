import { useState, useCallback } from "react";
import {
  startLevelTimeTracking,
  completeLevelTimeTracking,
  getLevelTimeStats,
  getLevelTimeHistory,
  getLevelTimeTypeStats,
  getLevelStartTime,
} from "../services/api";

interface LevelTimeTracking {
  id: number;
  levelNumber: number;
  levelType: string;
  startTime: string;
  completionTime?: string;
  timeSpentSeconds?: number;
  completed: boolean;
}

interface UserTimeStats {
  totalLevelsCompleted: number;
  totalTimeSpent: number;
  averageTimePerLevel: number;
  fastestLevel: {
    levelNumber: number;
    levelType: string;
    timeSpent: number;
  } | null;
  slowestLevel: {
    levelNumber: number;
    levelType: string;
    timeSpent: number;
  } | null;
}

interface LevelTypeStats {
  gameLevels: {
    completed: number;
    totalTime: number;
    averageTime: number;
  };
  leagueLevels: {
    completed: number;
    totalTime: number;
    averageTime: number;
  };
}

export const useLevelTimeTracking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLevel = useCallback(
    async (
      levelNumber: number,
      levelType: "game" | "league" = "game"
    ): Promise<LevelTimeTracking | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await startLevelTimeTracking(levelNumber, levelType);
        if (result) {
          return result.tracking;
        }
        return null;
      } catch (err: any) {
        setError(err.message || "Error al iniciar nivel");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const completeLevel = useCallback(
    async (
      levelNumber: number,
      levelType: "game" | "league" = "game"
    ): Promise<LevelTimeTracking | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await completeLevelTimeTracking(levelNumber, levelType);
        if (result) {
          return result.tracking;
        }
        return null;
      } catch (err: any) {
        setError(err.message || "Error al completar nivel");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUserStats = useCallback(async (): Promise<UserTimeStats | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await getLevelTimeStats();
      return result;
    } catch (err: any) {
      setError(err.message || "Error al obtener estadísticas");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserHistory = useCallback(async (): Promise<
    LevelTimeTracking[] | null
  > => {
    setLoading(true);
    setError(null);

    try {
      const result = await getLevelTimeHistory();
      return result;
    } catch (err: any) {
      setError(err.message || "Error al obtener historial");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLevelTypeStats =
    useCallback(async (): Promise<LevelTypeStats | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await getLevelTimeTypeStats();
        return result;
      } catch (err: any) {
        setError(err.message || "Error al obtener estadísticas por tipo");
        return null;
      } finally {
        setLoading(false);
      }
    }, []);

  const getLevelStartTimeLocal = useCallback(
    async (
      levelNumber: number,
      levelType: "game" | "league" = "game"
    ): Promise<Date | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await getLevelStartTime(levelNumber, levelType);
        if (result && result.startTime) {
          return new Date(result.startTime);
        }
        return null;
      } catch (err: any) {
        setError(err.message || "Error al obtener tiempo de inicio");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Función de utilidad para formatear tiempo en formato legible
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }, []);

  // Función de utilidad para formatear fecha
  const formatDate = useCallback((date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return {
    // Funciones principales
    startLevel,
    completeLevel,
    getUserStats,
    getUserHistory,
    getLevelTypeStats,
    getLevelStartTimeLocal,

    // Utilidades
    formatTime,
    formatDate,
    clearError,

    // Estado
    loading,
    error,
  };
};
