import React, { useEffect, useState } from "react";
import "./styles/HealthBar.css";

interface HealthBarProps {
  nickname: string | undefined;
  level: number | undefined;
  currentHP: number;
  maxHP: number;
}

const HealthBar: React.FC<HealthBarProps> = ({
  nickname,
  level,
  currentHP,
  maxHP,
}) => {
  const [displayedHP, setDisplayedHP] = useState(currentHP);
  useEffect(() => {
    if (displayedHP !== currentHP && currentHP != maxHP) {
      const diff = displayedHP - currentHP;
      const step = diff > 0 ? -1 : 1;
      const interval = setInterval(() => {
        console.log("interval");
        setDisplayedHP((prev) => {
          const newHP = prev + step;
          if (
            (step < 0 && newHP <= currentHP) ||
            (step > 0 && newHP >= currentHP)
          ) {
            clearInterval(interval);
            return currentHP;
          }
          return newHP;
        });
      }, 20);
      return () => clearInterval(interval);
    } else {
      setDisplayedHP(currentHP);
    }
  }, [currentHP, displayedHP]);

  const percentage = (currentHP / maxHP) * 100;

  let barColor = "#4caf50";
  if (percentage < 25) {
    barColor = "#f44336";
  } else if (percentage < 50) {
    barColor = "#ffeb3b";
  }

  return (
    <div className="health-bar-container">
      <div className="health-bar-header">
        <span className="pokemon-nickname">{nickname}</span>
        <span className="pokemon-level">Nv. {level}</span>
      </div>
      <div className="health-bar">
        <div
          className="health-bar__fill"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        ></div>
      </div>
      <div className="health-bar-footer">
        <span className="pokemon-hp">
          {displayedHP}/{maxHP}
        </span>
      </div>
    </div>
  );
};

export default HealthBar;
