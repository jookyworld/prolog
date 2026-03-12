-- 루틴 제목 스냅샷 기능 추가
-- 루틴 삭제 시에도 운동 기록의 루틴 제목 보존

-- 1. routine_title_snapshot 컬럼 추가 (이미 있으면 무시)
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS routine_title_snapshot VARCHAR(100) NULL
COMMENT '세션 시작 시점의 루틴 제목 스냅샷';

-- 2. 기존 데이터의 스냅샷 채우기 (routine이 아직 존재하는 경우)
UPDATE workout_sessions ws
INNER JOIN routines r ON ws.routine_id = r.id
SET ws.routine_title_snapshot = r.title
WHERE ws.routine_title_snapshot IS NULL
  AND ws.routine_id IS NOT NULL;

-- 3. 기존 외래 키 삭제 (Hibernate가 생성한 이름)
ALTER TABLE workout_sessions
DROP FOREIGN KEY IF EXISTS FK4q6pnw9nar0dxwb0qsofyefea;

-- 4. 새로운 외래 키 추가 (ON DELETE SET NULL)
ALTER TABLE workout_sessions
ADD CONSTRAINT fk_workout_sessions_routines
FOREIGN KEY (routine_id) REFERENCES routines(id)
ON DELETE SET NULL
ON UPDATE RESTRICT;
