"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

interface WorkoutTimerProps {
  isRunning?: boolean;
  onToggle?: (running: boolean) => void;
}

export function WorkoutTimer({
  isRunning: externalIsRunning,
  onToggle,
}: WorkoutTimerProps) {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(
    externalIsRunning !== undefined ? externalIsRunning : true
  );

  useEffect(() => {
    if (externalIsRunning !== undefined) {
      setIsRunning(externalIsRunning);
    }
  }, [externalIsRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggle = () => {
    const newState = !isRunning;
    setIsRunning(newState);
    onToggle?.(newState);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={handleToggle}
        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        aria-label="타이머 토글"
      >
        {isRunning ? (
          <Pause className="w-4 h-4 text-[#3182F6]" />
        ) : (
          <Play className="w-4 h-4 text-[#3182F6]" />
        )}
      </button>
      <p className="text-2xl font-mono font-bold text-[#3182F6]">
        {formatTime(timer)}
      </p>
    </div>
  );
}
