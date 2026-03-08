import { workoutApi } from "@/lib/api/workout";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface ActiveSession {
  sessionId: number;
  routineId: number | null;
}

interface WorkoutContextValue {
  activeSession: ActiveSession | null;
  isRestoring: boolean;
  startWorkout: (sessionId: number, routineId: number | null) => void;
  endWorkout: () => void;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    workoutApi.getActiveSession().then((session) => {
      if (session) {
        setActiveSession({ sessionId: session.id, routineId: session.routineId ?? null });
      }
    }).finally(() => {
      setIsRestoring(false);
    });
  }, []);

  const startWorkout = useCallback((sessionId: number, routineId: number | null) => {
    setActiveSession({ sessionId, routineId });
  }, []);

  const endWorkout = useCallback(() => {
    setActiveSession(null);
  }, []);

  return (
    <WorkoutContext.Provider
      value={{ activeSession, isRestoring, startWorkout, endWorkout }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
