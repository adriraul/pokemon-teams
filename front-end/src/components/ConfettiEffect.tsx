import React, { useEffect, useState } from "react";

interface ConfettiEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  isActive,
  onComplete,
}) => {
  const [confetti, setConfetti] = useState<
    Array<{ id: number; x: number; delay: number; color: string }>
  >([]);

  useEffect(() => {
    if (isActive) {
      // Generar confeti aleatorio
      const colors = [
        "#ff6b6b",
        "#4ecdc4",
        "#45b7d1",
        "#ffd700",
        "#ff8e53",
        "#a8e6cf",
      ];
      const newConfetti = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 300,
        delay: Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));

      setConfetti(newConfetti);

      // Limpiar confeti después de la animación
      const timer = setTimeout(() => {
        setConfetti([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="confetti-container">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: `${piece.x}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;
