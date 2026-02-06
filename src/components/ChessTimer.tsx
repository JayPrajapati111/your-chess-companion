import { useEffect, useState, useCallback } from "react";
import { PieceColor } from "@/lib/chess";

export type TimeControl = {
  name: string;
  label: string;
  initialTime: number; // in seconds
  increment: number; // in seconds
  type: "bullet" | "blitz" | "rapid" | "classical";
};

export const TIME_CONTROLS: TimeControl[] = [
  { name: "bullet1", label: "1 min", initialTime: 60, increment: 0, type: "bullet" },
  { name: "bullet2", label: "1|1", initialTime: 60, increment: 1, type: "bullet" },
  { name: "bullet3", label: "2|1", initialTime: 120, increment: 1, type: "bullet" },
  { name: "blitz1", label: "3 min", initialTime: 180, increment: 0, type: "blitz" },
  { name: "blitz2", label: "3|2", initialTime: 180, increment: 2, type: "blitz" },
  { name: "blitz3", label: "5 min", initialTime: 300, increment: 0, type: "blitz" },
  { name: "blitz4", label: "5|3", initialTime: 300, increment: 3, type: "blitz" },
  { name: "rapid1", label: "10 min", initialTime: 600, increment: 0, type: "rapid" },
  { name: "rapid2", label: "15|10", initialTime: 900, increment: 10, type: "rapid" },
  { name: "rapid3", label: "30 min", initialTime: 1800, increment: 0, type: "rapid" },
  { name: "classical", label: "No Timer", initialTime: 0, increment: 0, type: "classical" },
];

interface ChessTimerProps {
  timeControl: TimeControl;
  currentTurn: PieceColor;
  isGameActive: boolean;
  onTimeOut: (loser: PieceColor) => void;
  onReset?: () => void;
}

export const ChessTimer = ({
  timeControl,
  currentTurn,
  isGameActive,
  onTimeOut,
}: ChessTimerProps) => {
  const [whiteTime, setWhiteTime] = useState(timeControl.initialTime);
  const [blackTime, setBlackTime] = useState(timeControl.initialTime);
  const [hasStarted, setHasStarted] = useState(false);

  // Reset times when time control changes
  useEffect(() => {
    setWhiteTime(timeControl.initialTime);
    setBlackTime(timeControl.initialTime);
    setHasStarted(false);
  }, [timeControl]);

  // Start the timer after first move
  useEffect(() => {
    if (isGameActive && !hasStarted && currentTurn === "black") {
      setHasStarted(true);
    }
  }, [currentTurn, isGameActive, hasStarted]);

  // Add increment after move
  useEffect(() => {
    if (hasStarted && timeControl.increment > 0) {
      if (currentTurn === "white") {
        setBlackTime((prev) => prev + timeControl.increment);
      } else {
        setWhiteTime((prev) => prev + timeControl.increment);
      }
    }
  }, [currentTurn, hasStarted, timeControl.increment]);

  // Timer countdown
  useEffect(() => {
    if (!isGameActive || !hasStarted || timeControl.initialTime === 0) return;

    const interval = setInterval(() => {
      if (currentTurn === "white") {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            onTimeOut("white");
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            onTimeOut("black");
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurn, isGameActive, hasStarted, timeControl.initialTime, onTimeOut]);

  const formatTime = useCallback((seconds: number): string => {
    if (seconds === 0 && timeControl.initialTime === 0) return "∞";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [timeControl.initialTime]);

  const isLowTime = (seconds: number) => seconds <= 30 && seconds > 0;

  if (timeControl.initialTime === 0) {
    return null; // No timer for classical/unlimited
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-[200px]">
      {/* Black Timer */}
      <div
        className={`
          p-4 rounded-xl font-mono text-3xl font-bold text-center transition-all
          ${currentTurn === "black" && isGameActive ? "bg-secondary ring-2 ring-primary" : "bg-card"}
          ${isLowTime(blackTime) ? "text-destructive animate-pulse" : "text-foreground"}
        `}
      >
        <div className="text-xs text-muted-foreground mb-1 font-sans font-normal">Black</div>
        {formatTime(blackTime)}
      </div>

      {/* White Timer */}
      <div
        className={`
          p-4 rounded-xl font-mono text-3xl font-bold text-center transition-all
          ${currentTurn === "white" && isGameActive ? "bg-foreground text-background ring-2 ring-primary" : "bg-card"}
          ${isLowTime(whiteTime) ? "text-destructive animate-pulse" : ""}
        `}
      >
        <div className={`text-xs mb-1 font-sans font-normal ${currentTurn === "white" && isGameActive ? "text-muted" : "text-muted-foreground"}`}>White</div>
        {formatTime(whiteTime)}
      </div>
    </div>
  );
};

interface TimeControlSelectorProps {
  selected: TimeControl;
  onSelect: (tc: TimeControl) => void;
}

export const TimeControlSelector = ({ selected, onSelect }: TimeControlSelectorProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "bullet": return "bg-game-orange/20 text-game-orange border-game-orange/30";
      case "blitz": return "bg-game-blue/20 text-game-blue border-game-blue/30";
      case "rapid": return "bg-game-green/20 text-game-green border-game-green/30";
      default: return "bg-secondary text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Time Control</h3>
      
      <div className="grid grid-cols-3 gap-2">
        {TIME_CONTROLS.map((tc) => (
          <button
            key={tc.name}
            onClick={() => onSelect(tc)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium border transition-all
              ${selected.name === tc.name 
                ? `${getTypeColor(tc.type)} ring-2 ring-primary` 
                : "bg-card border-border text-muted-foreground hover:bg-secondary"
              }
            `}
          >
            {tc.label}
          </button>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        {selected.type === "bullet" && "⚡ Bullet - Fast-paced games"}
        {selected.type === "blitz" && "🔥 Blitz - Quick thinking required"}
        {selected.type === "rapid" && "⏱️ Rapid - Time to think"}
        {selected.type === "classical" && "♟️ Classical - No time limit"}
      </div>
    </div>
  );
};
