export interface Set {
  id: string;
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  lastRecord: {
    weight: number;
    reps: number;
  };
  sets: Set[];
  is_temporary?: boolean; // 실시간 추가된 종목 플래그
}

export interface ExerciseSessionItem {
  id: string;
  name: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  type: "routine" | "free";
  completedAt: string;
  elapsedTime: number; // seconds
  totalSets: number;
  totalVolume: number; // kg
  exercises: ExerciseSessionItem[];
  isModified?: boolean;
}

// Detailed session types
export interface WorkoutSet {
  id: string;
  setNo: number;
  weight: number;
  reps: number;
  completed: boolean;
  isWarmup?: boolean;
}

export interface WorkoutExercise {
  id: string;
  orderNo: number;
  exerciseId?: string;
  name: string;
  targetRestSeconds?: number;
  sets: WorkoutSet[];
}

export interface WorkoutSessionDetail {
  id: string;
  title: string;
  type: "routine" | "free";
  routineId?: string | null;
  completedAt: string;
  startedAt?: string | null;
  endedAt?: string | null;
  elapsedTime: number; // seconds
  note?: string;
  isEdited?: boolean;
  updatedAt?: string | null;
  totalSets: number;
  totalVolume: number;
  exercises: WorkoutExercise[];
}

// --- Backend API Response Types ---

export interface WorkoutSessionListItemRes {
  sessionId: number;
  routineId: number | null;
  routineTitle: string | null;
  startedAt: string | null;
  completedAt: string;
}

export interface PageWorkoutSessionListItemRes {
  content: WorkoutSessionListItemRes[];
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface WorkoutSetRes {
  setId: number;
  setNumber: number;
  weight: number;
  reps: number;
}

export interface WorkoutExerciseRes {
  exerciseId: number;
  exerciseName: string;
  sets: WorkoutSetRes[];
}

export interface WorkoutSessionDetailRes {
  sessionId: number;
  routineId: number | null;
  routineTitle: string | null;
  startedAt: string | null;
  completedAt: string;
  exercises: WorkoutExerciseRes[];
}

// --- Conversion Functions ---

export function toWorkoutSession(res: WorkoutSessionListItemRes): WorkoutSession {
  return {
    id: String(res.sessionId),
    title: res.routineTitle ?? "자유 운동",
    type: res.routineId ? "routine" : "free",
    completedAt: res.completedAt,
    elapsedTime: 0,
    totalSets: 0,
    totalVolume: 0,
    exercises: [],
  };
}

export function toWorkoutSessionDetail(res: WorkoutSessionDetailRes): WorkoutSessionDetail {
  const exercises: WorkoutExercise[] = res.exercises.map((ex, idx) => ({
    id: String(ex.exerciseId),
    orderNo: idx + 1,
    exerciseId: String(ex.exerciseId),
    name: ex.exerciseName,
    sets: ex.sets.map((s) => ({
      id: String(s.setId),
      setNo: s.setNumber,
      weight: s.weight,
      reps: s.reps,
      completed: true,
    })),
  }));

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalVolume = exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0,
  );

  let elapsedTime = 0;
  if (res.startedAt && res.completedAt) {
    elapsedTime = Math.floor(
      (new Date(res.completedAt).getTime() - new Date(res.startedAt).getTime()) / 1000,
    );
  }

  return {
    id: String(res.sessionId),
    title: res.routineTitle ?? "자유 운동",
    type: res.routineId ? "routine" : "free",
    routineId: res.routineId ? String(res.routineId) : null,
    completedAt: res.completedAt,
    startedAt: res.startedAt,
    endedAt: res.completedAt,
    elapsedTime,
    totalSets,
    totalVolume,
    exercises,
  };
}
