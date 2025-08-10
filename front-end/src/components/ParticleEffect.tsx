import React, { useEffect, useState } from "react";

interface ParticleEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({
  isActive,
  onComplete,
}) => {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);

  useEffect(() => {
    if (isActive) {
      // Generar partículas aleatorias
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 150,
        y: (Math.random() - 0.5) * 150,
        delay: Math.random() * 0.5,
      }));

      setParticles(newParticles);

      // Limpiar partículas después de la animación
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="pokeball-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={
            {
              "--x": `${particle.x}px`,
              "--y": `${particle.y}px`,
              animationDelay: `${particle.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default ParticleEffect;
