import type { BodyPart } from "./exercise";

// 루틴 스냅샷 구조 (백엔드 RoutineSnapshotWrapper)
export interface RoutineSnapshot {
  items: RoutineSnapshotItem[];
}

export interface RoutineSnapshotItem {
  exerciseId: number;
  exerciseName: string;
  bodyPart: BodyPart;
  orderInRoutine: number;
  sets: number;
  restSeconds: number;
}

// 세션 스냅샷 구조 (백엔드 SessionSnapshotWrapper)
export interface SessionSnapshot {
  completedAt: string;
  duration: number; // 초
  totalVolume: number;
  exercises: SessionExerciseSnapshot[];
}

export interface SessionExerciseSnapshot {
  exerciseName: string;
  sets: SetSnapshot[];
}

export interface SetSnapshot {
  setNumber: number;
  weight: number;
  reps: number;
}

// 공유 루틴 리스트 아이템 (백엔드 SharedRoutineResponse)
export interface SharedRoutineListItem {
  id: number;
  username: string;
  nickname: string;
  title: string;
  description: string;
  exerciseCount: number;
  bodyParts: BodyPart[];
  exerciseNames: string[]; // 대표 운동 종목 이름 (최대 3개)
  viewCount: number;
  importCount: number;
  createdAt: string;
}

// 공유 루틴 상세 (백엔드 SharedRoutineDetailResponse)
export interface SharedRoutineDetail {
  id: number;
  username: string;
  nickname: string;
  title: string;
  description: string;
  exerciseCount: number;
  bodyParts: BodyPart[];
  exerciseNames: string[]; // 대표 운동 종목 이름 (최대 3개)
  routineSnapshot: RoutineSnapshot;
  lastSessionSnapshot?: SessionSnapshot;
  viewCount: number;
  importCount: number;
  createdAt: string;
  comments: Comment[];
}

export interface Comment {
  id: number;
  nickname: string;
  content: string;
  createdAt: string;
}

// API 요청/응답 타입
export interface CreateSharedRoutineRequest {
  routineId: number;
  title: string;
  description: string;
}

export type SharedRoutineSortType = "RECENT" | "POPULAR" | "IMPORTED";
