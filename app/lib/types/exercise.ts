export type BodyPart =
  | "가슴"
  | "어깨"
  | "등"
  | "팔"
  | "하체"
  | "코어"
  | "유산소"
  | "기타";

export const BODY_PARTS: BodyPart[] = [
  "가슴",
  "등",
  "어깨",
  "하체",
  "팔",
  "코어",
  "유산소",
  "기타",
];

export interface ExerciseResponse {
  id: number;
  name: string;
  bodyPart: BodyPart;
  partDetail: string;
  custom: boolean;
}
