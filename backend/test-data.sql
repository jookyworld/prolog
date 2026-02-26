-- 홈 화면 통계 API 테스트 데이터
-- 기준 날짜: 2026-02-25 (화요일)
-- userId: 1

-- ==========================================
-- 1. 기본 운동 종목 추가 (exercises)
-- ==========================================
INSERT INTO exercises (name, body_part, part_detail, is_custom, created_at) VALUES
('벤치프레스', 'CHEST', '가슴 전체', false, NOW()),
('인클라인 벤치프레스', 'CHEST', '상부 가슴', false, NOW()),
('스쿼트', 'LOWER_BODY', '대퇴사두근', false, NOW()),
('데드리프트', 'BACK', '척추기립근', false, NOW()),
('오버헤드 프레스', 'SHOULDER', '전면 어깨', false, NOW()),
('바벨 로우', 'BACK', '광배근', false, NOW()),
('턱걸이', 'BACK', '광배근', false, NOW()),
('레그프레스', 'LOWER_BODY', '대퇴사두근', false, NOW()),
('래터럴 레이즈', 'SHOULDER', '측면 어깨', false, NOW()),
('바이셉 컬', 'ARM', '이두근', false, NOW());

-- ==========================================
-- 2. 루틴 추가 (routines)
-- ==========================================
INSERT INTO routines (user_id, title, description, active, created_at, updated_at) VALUES
(1, '상체 루틴 A', '가슴, 어깨 집중', true, NOW(), NOW()),
(1, '하체 루틴', '스쿼트 중심 하체 운동', true, NOW(), NOW()),
(1, '등 루틴', '데드리프트, 로우 중심', true, NOW(), NOW());

-- ==========================================
-- 3. 운동 세션 + 세트 데이터
-- ==========================================

-- 세션 ID를 변수로 관리하기 위해 실제 ID는 AUTO_INCREMENT 사용
-- 아래는 예시이며, 실제로는 INSERT 후 LAST_INSERT_ID()를 사용해야 함

-- ========== 2주 전: 2/11 (화) - 상체 루틴 A ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 1, '2026-02-11 18:00:00', '2026-02-11 19:15:00', '2026-02-11 18:00:00', '2026-02-11 19:15:00');

-- 벤치프레스 5세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 1, 60, 12, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 2, 70, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 3, 80, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 4, 80, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 5, 70, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스';

-- 오버헤드 프레스 4세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 1, 40, 12, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 2, 45, 10, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 3, 45, 10, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 4, 40, 12, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스';

-- ========== 2/13 (목) - 하체 루틴 ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 2, '2026-02-13 19:00:00', '2026-02-13 20:30:00', '2026-02-13 19:00:00', '2026-02-13 20:30:00');

-- 스쿼트 5세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 1, 80, 12, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 2, 100, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 3, 120, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 4, 120, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 5, 100, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트';

-- 레그프레스 4세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 1, 150, 15, NOW(), NOW() FROM exercises WHERE name = '레그프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 2, 180, 12, NOW(), NOW() FROM exercises WHERE name = '레그프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 3, 200, 10, NOW(), NOW() FROM exercises WHERE name = '레그프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 4, 180, 12, NOW(), NOW() FROM exercises WHERE name = '레그프레스';

-- ========== 2/15 (토) - 등 루틴 ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 3, '2026-02-15 10:00:00', '2026-02-15 11:20:00', '2026-02-15 10:00:00', '2026-02-15 11:20:00');

-- 데드리프트 4세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 1, 100, 10, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 2, 120, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 3, 140, 6, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 4, 120, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트';

-- 바벨 로우 4세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 1, 60, 12, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 2, 70, 10, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 3, 70, 10, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 4, 60, 12, NOW(), NOW() FROM exercises WHERE name = '바벨 로우';

-- ========== 2/18 (화) - 상체 루틴 A ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 1, '2026-02-18 18:30:00', '2026-02-18 19:50:00', '2026-02-18 18:30:00', '2026-02-18 19:50:00');

-- 벤치프레스 5세트 (진전!)
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 1, 70, 12, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 2, 80, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 3, 85, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 4, 85, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 5, 80, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스';

-- 인클라인 벤치프레스 3세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '인클라인 벤치프레스', 'CHEST', 1, 50, 12, NOW(), NOW() FROM exercises WHERE name = '인클라인 벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '인클라인 벤치프레스', 'CHEST', 2, 60, 10, NOW(), NOW() FROM exercises WHERE name = '인클라인 벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '인클라인 벤치프레스', 'CHEST', 3, 60, 10, NOW(), NOW() FROM exercises WHERE name = '인클라인 벤치프레스';

-- ========== 2/20 (목) - 하체 루틴 ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 2, '2026-02-20 19:00:00', '2026-02-20 20:20:00', '2026-02-20 19:00:00', '2026-02-20 20:20:00');

-- 스쿼트 5세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 1, 90, 12, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 2, 110, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 3, 125, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스�쿼트', 'LOWER_BODY', 4, 125, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 5, 110, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트';

-- ========== 2/22 (토) - 자유 운동 (등) ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, NULL, '2026-02-22 14:00:00', '2026-02-22 15:15:00', '2026-02-22 14:00:00', '2026-02-22 15:15:00');

-- 데드리프트 5세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 1, 110, 10, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 2, 130, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 3, 150, 6, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 4, 150, 5, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 5, 130, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트';

-- 턱걸이 3세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '턱걸이', 'BACK', 1, 0, 10, NOW(), NOW() FROM exercises WHERE name = '턱걸이' UNION ALL
SELECT LAST_INSERT_ID(), id, '턱걸이', 'BACK', 2, 0, 8, NOW(), NOW() FROM exercises WHERE name = '턱걸이' UNION ALL
SELECT LAST_INSERT_ID(), id, '턱걸이', 'BACK', 3, 0, 8, NOW(), NOW() FROM exercises WHERE name = '턱걸이';

-- ========== 이번 주 ==========

-- 2/24 (월) - 상체 루틴 A
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 1, '2026-02-24 18:00:00', '2026-02-24 19:30:00', '2026-02-24 18:00:00', '2026-02-24 19:30:00');

-- 벤치프레스 5세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 1, 70, 12, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 2, 80, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 3, 90, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 4, 90, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 5, 85, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스';

-- 오버헤드 프레스 4세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 1, 45, 12, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 2, 50, 10, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 3, 50, 10, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 4, 45, 12, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스';

-- 래터럴 레이즈 3세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '래터럴 레이즈', 'SHOULDER', 1, 10, 15, NOW(), NOW() FROM exercises WHERE name = '래터럴 레이즈' UNION ALL
SELECT LAST_INSERT_ID(), id, '래터럴 레이즈', 'SHOULDER', 2, 12, 12, NOW(), NOW() FROM exercises WHERE name = '래터럴 레이즈' UNION ALL
SELECT LAST_INSERT_ID(), id, '래터럴 레이즈', 'SHOULDER', 3, 12, 12, NOW(), NOW() FROM exercises WHERE name = '래터럴 레이즈';

-- ========== 2/25 (오늘 화요일) - 자유 운동 (팔) ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, NULL, '2026-02-25 19:00:00', '2026-02-25 20:00:00', '2026-02-25 19:00:00', '2026-02-25 20:00:00');

-- 바이셉 컬 4세트
INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '바이셉 컬', 'ARM', 1, 15, 12, NOW(), NOW() FROM exercises WHERE name = '바이셉 컬' UNION ALL
SELECT LAST_INSERT_ID(), id, '바이셉 컬', 'ARM', 2, 17, 10, NOW(), NOW() FROM exercises WHERE name = '바이셉 컬' UNION ALL
SELECT LAST_INSERT_ID(), id, '바이셉 컬', 'ARM', 3, 17, 10, NOW(), NOW() FROM exercises WHERE name = '바이셉 컬' UNION ALL
SELECT LAST_INSERT_ID(), id, '바이셉 컬', 'ARM', 4, 15, 12, NOW(), NOW() FROM exercises WHERE name = '바이셉 컬';

-- ==========================================
-- 데이터 요약
-- ==========================================
-- 총 운동 세션: 8회
-- 이번 주 (2/23 월 ~ 2/25 화): 2회
-- 이번 달 (2/1 ~ 2/25): 8회
-- 최근 7일 (2/19 ~ 2/25): 5회
--
-- 3회 이상 반복 운동 (exerciseProgress 대상):
-- - 벤치프레스: 3회
-- - 스쿼트: 2회 (기준 미달)
-- - 데드리프트: 2회 (기준 미달)
-- - 오버헤드 프레스: 2회 (기준 미달)
--
-- 참고: exerciseProgress에 표시되려면 최소 3회 이상 필요하므로
--       추가 운동 기록이 필요할 수 있습니다.
