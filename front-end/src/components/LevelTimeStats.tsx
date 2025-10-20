import React, { useEffect, useState } from 'react';
import { useLevelTimeTracking } from '../hooks/useLevelTimeTracking';
import './styles/LevelTimeStats.css';

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

export const LevelTimeStats: React.FC = () => {
  const {
    getUserStats,
    getUserHistory,
    getLevelTypeStats,
    formatTime,
    formatDate,
    loading,
    error,
    clearError
  } = useLevelTimeTracking();

  const [stats, setStats] = useState<UserTimeStats | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [typeStats, setTypeStats] = useState<LevelTypeStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [statsData, historyData, typeStatsData] = await Promise.all([
      getUserStats(),
      getUserHistory(),
      getLevelTypeStats()
    ]);

    if (statsData) setStats(statsData);
    if (historyData) setHistory(historyData);
    if (typeStatsData) setTypeStats(typeStatsData);
  };

  if (loading) {
    return (
      <div className="level-time-stats">
        <div className="loading">Cargando estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="level-time-stats">
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={clearError}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="level-time-stats">
      <h2>Estadísticas de Tiempo</h2>
      
      {/* Estadísticas Generales */}
      {stats && (
        <div className="stats-section">
          <h3>Resumen General</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalLevelsCompleted}</div>
              <div className="stat-label">Niveles Completados</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatTime(stats.totalTimeSpent)}</div>
              <div className="stat-label">Tiempo Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatTime(stats.averageTimePerLevel)}</div>
              <div className="stat-label">Tiempo Promedio</div>
            </div>
          </div>
          
          {stats.fastestLevel && (
            <div className="record-card fastest">
              <h4>🏆 Nivel Más Rápido</h4>
              <p>Nivel {stats.fastestLevel.levelNumber} ({stats.fastestLevel.levelType})</p>
              <p className="time">{formatTime(stats.fastestLevel.timeSpent)}</p>
            </div>
          )}
          
          {stats.slowestLevel && (
            <div className="record-card slowest">
              <h4>🐌 Nivel Más Lento</h4>
              <p>Nivel {stats.slowestLevel.levelNumber} ({stats.slowestLevel.levelType})</p>
              <p className="time">{formatTime(stats.slowestLevel.timeSpent)}</p>
            </div>
          )}
        </div>
      )}

      {/* Estadísticas por Tipo */}
      {typeStats && (
        <div className="stats-section">
          <h3>Estadísticas por Tipo de Nivel</h3>
          <div className="type-stats-grid">
            <div className="type-stat-card">
              <h4>🎮 Niveles del Juego</h4>
              <div className="type-stat-content">
                <div className="type-stat-item">
                  <span>Completados:</span>
                  <span>{typeStats.gameLevels.completed}</span>
                </div>
                <div className="type-stat-item">
                  <span>Tiempo Total:</span>
                  <span>{formatTime(typeStats.gameLevels.totalTime)}</span>
                </div>
                <div className="type-stat-item">
                  <span>Tiempo Promedio:</span>
                  <span>{formatTime(typeStats.gameLevels.averageTime)}</span>
                </div>
              </div>
            </div>
            
            <div className="type-stat-card">
              <h4>🏆 Niveles de Liga</h4>
              <div className="type-stat-content">
                <div className="type-stat-item">
                  <span>Completados:</span>
                  <span>{typeStats.leagueLevels.completed}</span>
                </div>
                <div className="type-stat-item">
                  <span>Tiempo Total:</span>
                  <span>{formatTime(typeStats.leagueLevels.totalTime)}</span>
                </div>
                <div className="type-stat-item">
                  <span>Tiempo Promedio:</span>
                  <span>{formatTime(typeStats.leagueLevels.averageTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial de Niveles */}
      {history.length > 0 && (
        <div className="stats-section">
          <h3>Historial de Niveles</h3>
          <div className="history-table">
            <table>
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Tipo</th>
                  <th>Inicio</th>
                  <th>Finalización</th>
                  <th>Tiempo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {history.map((level) => (
                  <tr key={level.id} className={level.completed ? 'completed' : 'in-progress'}>
                    <td>{level.levelNumber}</td>
                    <td>
                      <span className={`level-type ${level.levelType}`}>
                        {level.levelType === 'game' ? '🎮' : '🏆'}
                      </span>
                    </td>
                    <td>{formatDate(level.startTime)}</td>
                    <td>
                      {level.completionTime 
                        ? formatDate(level.completionTime)
                        : '-'
                      }
                    </td>
                    <td>
                      {level.timeSpentSeconds 
                        ? formatTime(level.timeSpentSeconds)
                        : '-'
                      }
                    </td>
                    <td>
                      <span className={`status ${level.completed ? 'completed' : 'in-progress'}`}>
                        {level.completed ? '✅ Completado' : '⏳ En Progreso'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="actions">
        <button onClick={loadStats} className="refresh-btn">
          🔄 Actualizar Estadísticas
        </button>
      </div>
    </div>
  );
};
