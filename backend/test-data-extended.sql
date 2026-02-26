-- 홈 화면 통계 API 테스트 데이터 (확장 버전)
-- exerciseProgress를 위해 3회 이상 반복되는 운동을 추가
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
-- 3. 운동 세션 + 세트 데이터 (지난 달부터)
-- ==========================================

-- ========== 1/27 (월) - 상체 루틴 A ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 1, '2026-01-27 18:00:00', '2026-01-27 19:15:00', '2026-01-27 18:00:00', '2026-01-27 19:15:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 1, 55, 12, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 2, 65, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 3, 75, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 4, 75, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 5, 65, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 1, 35, 12, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 2, 40, 10, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 3, 40, 10, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 4, 35, 12, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스';

-- ========== 1/29 (수) - 하체 루틴 ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 2, '2026-01-29 19:00:00', '2026-01-29 20:25:00', '2026-01-29 19:00:00', '2026-01-29 20:25:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 1, 75, 12, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 2, 95, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 3, 115, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 4, 115, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 5, 95, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 1, 140, 15, NOW(), NOW() FROM exercises WHERE name = '레그프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 2, 170, 12, NOW(), NOW() FROM exercises WHERE name = '레그프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 3, 190, 10, NOW(), NOW() FROM exercises WHERE name = '레그프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 4, 170, 12, NOW(), NOW() FROM exercises WHERE name = '레그프레스';

-- ========== 1/31 (금) - 등 루틴 ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 3, '2026-01-31 18:30:00', '2026-01-31 19:50:00', '2026-01-31 18:30:00', '2026-01-31 19:50:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 1, 95, 10, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 2, 115, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 3, 135, 6, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 4, 115, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 1, 55, 12, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 2, 65, 10, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 3, 65, 10, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 4, 55, 12, NOW(), NOW() FROM exercises WHERE name = '바벨 로우';

-- ========== 2/3 (월) - 상체 루틴 A ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 1, '2026-02-03 18:00:00', '2026-02-03 19:20:00', '2026-02-03 18:00:00', '2026-02-03 19:20:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 1, 60, 12, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 2, 70, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 3, 80, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 4, 80, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 5, 70, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 1, 40, 12, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 2, 45, 10, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 3, 45, 10, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 4, 40, 12, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스';

-- ========== 2/5 (수) - 하체 루틴 ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 2, '2026-02-05 19:00:00', '2026-02-05 20:30:00', '2026-02-05 19:00:00', '2026-02-05 20:30:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 1, 80, 12, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 2, 100, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 3, 120, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 4, 120, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 5, 100, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트';

-- ========== 2/7 (금) - 등 루틴 ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 3, '2026-02-07 18:00:00', '2026-02-07 19:20:00', '2026-02-07 18:00:00', '2026-02-07 19:20:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 1, 100, 10, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 2, 120, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 3, 140, 6, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 4, 120, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 1, 60, 12, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 2, 70, 10, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 3, 70, 10, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 4, 60, 12, NOW(), NOW() FROM exercises WHERE name = '바벨 로우';

-- ========== 2/10 (월) - 상체 루틴 A ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 1, '2026-02-10 18:30:00', '2026-02-10 19:45:00', '2026-02-10 18:30:00', '2026-02-10 19:45:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 1, 65, 12, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 2, 75, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 3, 85, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 4, 85, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 5, 75, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 1, 42, 12, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 2, 47, 10, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 3, 47, 10, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '오버헤드 프레스', 'SHOULDER', 4, 42, 12, NOW(), NOW() FROM exercises WHERE name = '오버헤드 프레스';

-- ========== 2/12 (수) - 하체 루틴 ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 2, '2026-02-12 19:00:00', '2026-02-12 20:20:00', '2026-02-12 19:00:00', '2026-02-12 20:20:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 1, 85, 12, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 2, 105, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 3, 122, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 4, 122, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 5, 105, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 1, 150, 15, NOW(), NOW() FROM exercises WHERE name = '레그프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 2, 180, 12, NOW(), NOW() FROM exercises WHERE name = '레그프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 3, 200, 10, NOW(), NOW() FROM exercises WHERE name = '레그프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 4, 180, 12, NOW(), NOW() FROM exercises WHERE name = '레그프레스';

-- ========== 2/14 (금) - 등 루틴 ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 3, '2026-02-14 10:00:00', '2026-02-14 11:20:00', '2026-02-14 10:00:00', '2026-02-14 11:20:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 1, 105, 10, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 2, 125, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 3, 145, 6, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 4, 125, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 1, 62, 12, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 2, 72, 10, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 3, 72, 10, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 4, 62, 12, NOW(), NOW() FROM exercises WHERE name = '바벨 로우';

-- ========== 2/17 (월) - 상체 루틴 A ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 1, '2026-02-17 18:30:00', '2026-02-17 19:50:00', '2026-02-17 18:30:00', '2026-02-17 19:50:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 1, 70, 12, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 2, 80, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 3, 87, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 4, 87, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 5, 80, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '인클라인 벤치프레스', 'CHEST', 1, 50, 12, NOW(), NOW() FROM exercises WHERE name = '인클라인 벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '인클라인 벤치프레스', 'CHEST', 2, 60, 10, NOW(), NOW() FROM exercises WHERE name = '인클라인 벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '인클라인 벤치프레스', 'CHEST', 3, 60, 10, NOW(), NOW() FROM exercises WHERE name = '인클라인 벤치프레스';

-- ========== 2/19 (수) - 하체 루틴 ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 2, '2026-02-19 19:00:00', '2026-02-19 20:25:00', '2026-02-19 19:00:00', '2026-02-19 20:25:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 1, 90, 12, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 2, 110, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 3, 125, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 4, 125, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 5, 110, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트';

-- ========== 2/21 (금) - 등 루틴 ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 3, '2026-02-21 18:00:00', '2026-02-21 19:25:00', '2026-02-21 18:00:00', '2026-02-21 19:25:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 1, 110, 10, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 2, 130, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 3, 150, 6, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 4, 130, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 1, 65, 12, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 2, 75, 10, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 3, 75, 10, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 4, 65, 12, NOW(), NOW() FROM exercises WHERE name = '바벨 로우';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '턱걸이', 'BACK', 1, 0, 10, NOW(), NOW() FROM exercises WHERE name = '턱걸이' UNION ALL
SELECT LAST_INSERT_ID(), id, '턱걸이', 'BACK', 2, 0, 9, NOW(), NOW() FROM exercises WHERE name = '턱걸이' UNION ALL
SELECT LAST_INSERT_ID(), id, '턱걸이', 'BACK', 3, 0, 8, NOW(), NOW() FROM exercises WHERE name = '턱걸이';

-- ========== 이번 주 ==========

-- 2/23 (일) - 상체 자유 운동
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, NULL, '2026-02-23 15:00:00', '2026-02-23 16:10:00', '2026-02-23 15:00:00', '2026-02-23 16:10:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 1, 72, 12, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 2, 82, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 3, 90, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 4, 90, 8, NOW(), NOW() FROM exercises WHERE name = '벤치프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '벤치프레스', 'CHEST', 5, 85, 10, NOW(), NOW() FROM exercises WHERE name = '벤치프레스';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '래터럴 레이즈', 'SHOULDER', 1, 10, 15, NOW(), NOW() FROM exercises WHERE name = '래터럴 레이즈' UNION ALL
SELECT LAST_INSERT_ID(), id, '래터럴 레이즈', 'SHOULDER', 2, 12, 12, NOW(), NOW() FROM exercises WHERE name = '래터럴 레이즈' UNION ALL
SELECT LAST_INSERT_ID(), id, '래터럴 레이즈', 'SHOULDER', 3, 12, 12, NOW(), NOW() FROM exercises WHERE name = '래터럴 레이즈';

-- 2/24 (월) - 하체 루틴
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 2, '2026-02-24 18:00:00', '2026-02-24 19:30:00', '2026-02-24 18:00:00', '2026-02-24 19:30:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 1, 92, 12, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 2, 112, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 3, 127, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 4, 127, 8, NOW(), NOW() FROM exercises WHERE name = '스쿼트' UNION ALL
SELECT LAST_INSERT_ID(), id, '스쿼트', 'LOWER_BODY', 5, 112, 10, NOW(), NOW() FROM exercises WHERE name = '스쿼트';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 1, 160, 15, NOW(), NOW() FROM exercises WHERE name = '레그프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 2, 190, 12, NOW(), NOW() FROM exercises WHERE name = '레그프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 3, 210, 10, NOW(), NOW() FROM exercises WHERE name = '레그프레스' UNION ALL
SELECT LAST_INSERT_ID(), id, '레그프레스', 'LOWER_BODY', 4, 190, 12, NOW(), NOW() FROM exercises WHERE name = '레그프레스';

-- ========== 2/25 (오늘 화요일) - 등 루틴 ==========
INSERT INTO workout_sessions (user_id, routine_id, started_at, completed_at, created_at, updated_at) VALUES
(1, 3, '2026-02-25 19:00:00', '2026-02-25 20:15:00', '2026-02-25 19:00:00', '2026-02-25 20:15:00');

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 1, 115, 10, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 2, 135, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 3, 155, 6, NOW(), NOW() FROM exercises WHERE name = '데드리프트' UNION ALL
SELECT LAST_INSERT_ID(), id, '데드리프트', 'BACK', 4, 135, 8, NOW(), NOW() FROM exercises WHERE name = '데드리프트';

INSERT INTO workout_sets (workout_session_id, exercise_id, exercise_name, body_part_snapshot, set_number, weight, reps, created_at, updated_at)
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 1, 67, 12, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 2, 77, 10, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 3, 77, 10, NOW(), NOW() FROM exercises WHERE name = '바벨 로우' UNION ALL
SELECT LAST_INSERT_ID(), id, '바벨 로우', 'BACK', 4, 67, 12, NOW(), NOW() FROM exercises WHERE name = '바벨 로우';

-- ==========================================
-- 데이터 요약
-- ==========================================
-- 총 운동 세션: 13회 (1월 말 ~ 2월 25일)
-- 이번 주 (2/23 월 ~ 2/29 일): 3회
-- 이번 달 (2/1 ~ 2/25): 10회
-- 최근 7일 (2/19 ~ 2/25): 5회
--
-- 3회 이상 반복 운동 (exerciseProgress 대상):
-- - 벤치프레스: 5회 ✓ (1/27, 2/3, 2/10, 2/17, 2/23)
-- - 스쿼트: 4회 ✓ (1/29, 2/5, 2/12, 2/19, 2/24)
-- - 데드리프트: 4회 ✓ (1/31, 2/7, 2/14, 2/21, 2/25)
-- - 오버헤드 프레스: 3회 ✓ (1/27, 2/3, 2/10)
-- - 바벨 로우: 4회 ✓ (1/31, 2/7, 2/14, 2/21, 2/25)
--
-- exerciseProgress에 표시될 운동: 5개 (벤치프레스, 스쿼트, 데드리프트, 바벨 로우, 오버헤드 프레스)
