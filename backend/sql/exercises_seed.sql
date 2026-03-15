-- =============================================
-- exercises 초기화 및 시드 데이터 삽입
-- 실행 전: DB 테이블 전체 초기화 (서버 재실행 후 실행)
-- =============================================

INSERT INTO exercises (name, body_part, part_detail, is_custom, created_by, created_at) VALUES

-- =====================
-- 가슴 (CHEST)
-- =====================
('벤치프레스',                          'CHEST', '전체', 0, NULL, NOW()),
('인클라인 벤치프레스',                 'CHEST', '상부', 0, NULL, NOW()),
('디클라인 벤치프레스',                 'CHEST', '하부', 0, NULL, NOW()),
('덤벨 벤치프레스',                     'CHEST', '전체', 0, NULL, NOW()),
('인클라인 덤벨 벤치프레스',            'CHEST', '상부', 0, NULL, NOW()),
('디클라인 덤벨 벤치프레스',            'CHEST', '하부', 0, NULL, NOW()),
('덤벨 플라이',                         'CHEST', '전체', 0, NULL, NOW()),
('인클라인 덤벨 플라이',                'CHEST', '상부', 0, NULL, NOW()),
('디클라인 덤벨 플라이',                'CHEST', '하부', 0, NULL, NOW()),
('케이블 플라이',                'CHEST', '전체', 0, NULL, NOW()),
('케이블 크로스오버',                       'CHEST', '전체', 0, NULL, NOW()),
('케이블 크로스오버 (하이 투 로우)',         'CHEST', '하부', 0, NULL, NOW()),
('케이블 크로스오버 (로우 투 하이)',         'CHEST', '상부', 0, NULL, NOW()),
('케이블 체스트 프레스',         'CHEST', '전체', 0, NULL, NOW()),
('싱글 암 케이블 프레스',         'CHEST', '전체', 0, NULL, NOW()),
('펙덱 플라이',                         'CHEST', '전체', 0, NULL, NOW()),
('체스트 프레스 머신',                  'CHEST', '전체', 0, NULL, NOW()),
('인클라인 체스트 프레스 머신',         'CHEST', '상부', 0, NULL, NOW()),
('디클라인 체스트 프레스 머신',         'CHEST', '하부', 0, NULL, NOW()),
('스미스머신 벤치프레스',               'CHEST', '전체', 0, NULL, NOW()),
('스미스머신 인클라인 벤치프레스',      'CHEST', '상부', 0, NULL, NOW()),
('스미스머신 디클라인 벤치프레스',      'CHEST', '하부', 0, NULL, NOW()),
('딥스',                                'CHEST', '하부', 0, NULL, NOW()),
('푸시업',                              'CHEST', '전체', 0, NULL, NOW()),
('와이드 푸시업',                       'CHEST', '전체', 0, NULL, NOW()),
('클로즈 푸시업',                       'CHEST', '전체', 0, NULL, NOW()),
('풀오버',                       'CHEST', '전체', 0, NULL, NOW()),

-- =====================
-- 어깨 (SHOULDER)
-- =====================
('오버헤드 프레스',                     'SHOULDER', '전면', 0, NULL, NOW()),
('덤벨 숄더 프레스',                    'SHOULDER', '전면', 0, NULL, NOW()),
('아놀드 프레스',                       'SHOULDER', '전면', 0, NULL, NOW()),
('스미스머신 오버헤드 프레스',          'SHOULDER', '전면', 0, NULL, NOW()),
('숄더 프레스 머신',                    'SHOULDER', '전면', 0, NULL, NOW()),
('사이드 래터럴 레이즈',                       'SHOULDER', '측면', 0, NULL, NOW()),
('케이블 래터럴 레이즈',                'SHOULDER', '측면', 0, NULL, NOW()),
('래터럴 레이즈 머신',                  'SHOULDER', '측면', 0, NULL, NOW()),
('프론트 레이즈',                       'SHOULDER', '전면', 0, NULL, NOW()),
('케이블 프론트 레이즈',                'SHOULDER', '전면', 0, NULL, NOW()),
('업라이트 로우',                       'SHOULDER', '측면', 0, NULL, NOW()),
('벤트 오버 래터럴 레이즈',                 'SHOULDER', '후면', 0, NULL, NOW()),
('리버스 펙덱 플라이',                 'SHOULDER', '후면', 0, NULL, NOW()),
('리어 델트 플라이',                    'SHOULDER', '후면', 0, NULL, NOW()),
('케이블 리어 델트 플라이',             'SHOULDER', '후면', 0, NULL, NOW()),
('리어 델트 플라이 머신',               'SHOULDER', '후면', 0, NULL, NOW()),
('페이스 풀',                           'SHOULDER', '후면', 0, NULL, NOW()),
('밴드 풀 어파트',                      'SHOULDER', '후면', 0, NULL, NOW()),

-- =====================
-- 등 (BACK)
-- =====================

-- 전체
('풀업',                                'BACK', '전체', 0, NULL, NOW()),
('친업',                                'BACK', '전체', 0, NULL, NOW()),
('뉴트럴 그립 풀업',                      'BACK', '전체', 0, NULL, NOW()),
('어시스트 풀업',                       'BACK', '전체', 0, NULL, NOW()),
('인버티드 로우',                       'BACK', '전체', 0, NULL, NOW()),
('데드리프트',                          'BACK', '전체', 0, NULL, NOW()),
('루마니안 데드리프트',                 'BACK', '전체', 0, NULL, NOW()),
('스티프 데드리프트',                   'BACK', '전체', 0, NULL, NOW()),

-- 광배
('랫풀다운',                           'BACK', '광배', 0, NULL, NOW()),
('와이드 그립 랫 풀다운',               'BACK', '광배', 0, NULL, NOW()),
('클로즈 그립 랫 풀다운',               'BACK', '광배', 0, NULL, NOW()),
('언더 그립 랫 풀다운',                 'BACK', '광배', 0, NULL, NOW()),
('뉴트럴 그립 랫 풀다운',               'BACK', '광배', 0, NULL, NOW()),
('원암 케이블 풀다운',                  'BACK', '광배', 0, NULL, NOW()),
('스트레이트 암 풀다운',                'BACK', '광배', 0, NULL, NOW()),
('풀다운 머신',                         'BACK', '광배', 0, NULL, NOW()),
('풀오버',                       'BACK', '광배', 0, NULL, NOW()),


-- 중앙
('바벨 로우',                           'BACK', '중앙', 0, NULL, NOW()),
('리버스 그립 바벨 로우',               'BACK', '중앙', 0, NULL, NOW()),
('덤벨 로우',                           'BACK', '중앙', 0, NULL, NOW()),
('시티드 케이블 로우',                  'BACK', '중앙', 0, NULL, NOW()),
('클로즈 그립 케이블 로우',             'BACK', '중앙', 0, NULL, NOW()),
('와이드 그립 케이블 로우',             'BACK', '중앙', 0, NULL, NOW()),
('원암 케이블 로우',                    'BACK', '중앙', 0, NULL, NOW()),
('로우 머신',                           'BACK', '중앙', 0, NULL, NOW()),
('하이 로우 머신',                           'BACK', '중앙', 0, NULL, NOW()),
('로우 로우 머신',                           'BACK', '중앙', 0, NULL, NOW()),
('체스트 서포티드 로우 머신',           'BACK', '중앙', 0, NULL, NOW()),
('인클라인 덤벨 로우',                  'BACK', '중앙', 0, NULL, NOW()),
('티바 로우',                           'BACK', '중앙', 0, NULL, NOW()),
('펜들레이 로우',                       'BACK', '중앙', 0, NULL, NOW()),
('스미스머신 로우',                     'BACK', '중앙', 0, NULL, NOW()),

-- 승모
('바벨 슈러그',                         'BACK', '승모', 0, NULL, NOW()),
('덤벨 슈러그',                         'BACK', '승모', 0, NULL, NOW()),
('케이블 슈러그',                       'BACK', '승모', 0, NULL, NOW()),
('스미스머신 슈러그',                   'BACK', '승모', 0, NULL, NOW()),
('페이스 풀',                           'BACK', '승모', 0, NULL, NOW()),
('업라이트 로우',                       'BACK', '승모', 0, NULL, NOW()),


-- 기립근
('백 익스텐션',                         'BACK', '기립근', 0, NULL, NOW()),
('45도 백 익스텐션',                    'BACK', '기립근', 0, NULL, NOW()),
('굿모닝',                              'BACK', '기립근', 0, NULL, NOW()),

-- =====================
-- 팔 (ARM)
-- =====================

-- 이두
('바벨 컬',                                  'ARM', '이두', 0, NULL, NOW()),
('덤벨 컬',                                  'ARM', '이두', 0, NULL, NOW()),
('해머 컬',                                  'ARM', '이두', 0, NULL, NOW()),
('인클라인 덤벨 컬',                         'ARM', '이두', 0, NULL, NOW()),
('EZ바 컬',                                  'ARM', '이두', 0, NULL, NOW()),
('케이블 컬',                                'ARM', '이두', 0, NULL, NOW()),
('케이블 해머 컬',                           'ARM', '이두', 0, NULL, NOW()),
('프리처 컬',                                'ARM', '이두', 0, NULL, NOW()),
('스파이더 컬',                              'ARM', '이두', 0, NULL, NOW()),
('컬 머신',                                  'ARM', '이두', 0, NULL, NOW()),

-- 삼두
('스컬크러셔',                               'ARM', '삼두', 0, NULL, NOW()),
('덤벨 스컬크러셔',                          'ARM', '삼두', 0, NULL, NOW()),
('덤벨 트라이셉스 익스텐션',                 'ARM', '삼두', 0, NULL, NOW()),
('트라이셉스 푸시다운',                      'ARM', '삼두', 0, NULL, NOW()),
('로프 푸시다운',                            'ARM', '삼두', 0, NULL, NOW()),
('오버헤드 트라이셉스 익스텐션',             'ARM', '삼두', 0, NULL, NOW()),
('케이블 오버헤드 트라이셉스 익스텐션',      'ARM', '삼두', 0, NULL, NOW()),
('클로즈 그립 벤치프레스',                   'ARM', '삼두', 0, NULL, NOW()),
('덤벨 킥백',                                'ARM', '삼두', 0, NULL, NOW()),
('벤치 딥스',                                'ARM', '삼두', 0, NULL, NOW()),

-- 전완
('리버스 컬',                                'ARM', '전완', 0, NULL, NOW()),
('리스트 컬',                                'ARM', '전완', 0, NULL, NOW()),
('리버스 리스트 컬',                         'ARM', '전완', 0, NULL, NOW()),

-- =====================
-- 하체 (LOWER_BODY)
-- =====================

-- 전체
('스쿼트',                              'LOWER_BODY', '전체', 0, NULL, NOW()),
('프론트 스쿼트',                       'LOWER_BODY', '전체', 0, NULL, NOW()),
('고블렛 스쿼트',                       'LOWER_BODY', '전체', 0, NULL, NOW()),
('스미스머신 스쿼트',                   'LOWER_BODY', '전체', 0, NULL, NOW()),
('불가리안 스플릿 스쿼트',              'LOWER_BODY', '전체', 0, NULL, NOW()),
('런지',                                'LOWER_BODY', '전체', 0, NULL, NOW()),
('덤벨 런지',                           'LOWER_BODY', '전체', 0, NULL, NOW()),
('워킹 런지',                           'LOWER_BODY', '전체', 0, NULL, NOW()),
('스텝업',                              'LOWER_BODY', '전체', 0, NULL, NOW()),
('스모 데드리프트',                     'LOWER_BODY', '전체', 0, NULL, NOW()),

-- 대퇴사두
('핵 스쿼트 머신',                           'LOWER_BODY', '대퇴사두', 0, NULL, NOW()),
('레그 프레스',                         'LOWER_BODY', '대퇴사두', 0, NULL, NOW()),
('레그 익스텐션',                       'LOWER_BODY', '대퇴사두', 0, NULL, NOW()),

-- 햄스트링
('레그 컬 (라잉)',                       'LOWER_BODY', '햄스트링', 0, NULL, NOW()),
('레그 컬 (시티드)',                     'LOWER_BODY', '햄스트링', 0, NULL, NOW()),
('루마니안 데드리프트',                 'LOWER_BODY', '햄스트링', 0, NULL, NOW()),
('스티프 레그 데드리프트',              'LOWER_BODY', '햄스트링', 0, NULL, NOW()),
('굿모닝',                              'LOWER_BODY', '햄스트링', 0, NULL, NOW()),

-- 둔근
('힙 쓰러스트',                         'LOWER_BODY', '둔근', 0, NULL, NOW()),
('글루트 브릿지',                       'LOWER_BODY', '둔근', 0, NULL, NOW()),
('케이블 킥백',                         'LOWER_BODY', '둔근', 0, NULL, NOW()),
('힙 어브덕션 머신',                    'LOWER_BODY', '둔근', 0, NULL, NOW()),
('수모 스쿼트',                         'LOWER_BODY', '둔근', 0, NULL, NOW()),

-- 종아리
('카프 레이즈',                         'LOWER_BODY', '종아리', 0, NULL, NOW()),
('시티드 카프 레이즈',                  'LOWER_BODY', '종아리', 0, NULL, NOW()),
('레그 프레스 카프 레이즈',             'LOWER_BODY', '종아리', 0, NULL, NOW()),

-- 내전근
('어덕터 머신',                         'LOWER_BODY', '내전근', 0, NULL, NOW()),

-- =====================
-- 코어 (CORE)
-- =====================

-- 전체
('플랭크',                              'CORE', '전체', 0, NULL, NOW()),
('사이드 플랭크',                       'CORE', '전체', 0, NULL, NOW()),
('마운틴 클라이머',                     'CORE', '전체', 0, NULL, NOW()),

-- 복직근
('크런치',                              'CORE', '복직근', 0, NULL, NOW()),
('싯업',                                'CORE', '복직근', 0, NULL, NOW()),
('케이블 크런치',                       'CORE', '복직근', 0, NULL, NOW()),
('AB 롤아웃',                           'CORE', '복직근', 0, NULL, NOW()),
('드래곤 플래그',                       'CORE', '복직근', 0, NULL, NOW()),
('V업',                                 'CORE', '복직근', 0, NULL, NOW()),

-- 하복부
('레잉 레그레이즈',                     'CORE', '하복부', 0, NULL, NOW()),
('행잉 레그레이즈',                     'CORE', '하복부', 0, NULL, NOW()),
('행잉 니레이즈',                       'CORE', '하복부', 0, NULL, NOW()),
('토 투 바',                            'CORE', '하복부', 0, NULL, NOW()),
('리버스 크런치',                       'CORE', '하복부', 0, NULL, NOW()),

-- 복사근
('러시안 트위스트',                     'CORE', '복사근', 0, NULL, NOW()),
('바이시클 크런치',                     'CORE', '복사근', 0, NULL, NOW()),
('힐 터치',                             'CORE', '복사근', 0, NULL, NOW()),
('케이블 우드찹',                       'CORE', '복사근', 0, NULL, NOW()),

-- =====================
-- 유산소 (CARDIO)
-- =====================
('트레드밀',                            'CARDIO', NULL, 0, NULL, NOW()),
('야외 러닝',                           'CARDIO', NULL, 0, NULL, NOW()),
('걷기',                                'CARDIO', NULL, 0, NULL, NOW()),
('사이클',                              'CARDIO', NULL, 0, NULL, NOW()),
('스피닝',                              'CARDIO', NULL, 0, NULL, NOW()),
('일립티컬',                            'CARDIO', NULL, 0, NULL, NOW()),
('로잉 머신',                           'CARDIO', NULL, 0, NULL, NOW()),
('천국의 계단',                              'CARDIO', NULL, 0, NULL, NOW()),
('줄넘기',                              'CARDIO', NULL, 0, NULL, NOW()),
('버피',                                'CARDIO', NULL, 0, NULL, NOW()),
('배틀로프',                            'CARDIO', NULL, 0, NULL, NOW()),
('수영',                                'CARDIO', NULL, 0, NULL, NOW()),

-- =====================
-- 기타 (OTHER)
-- =====================
('파머스 워크',                         'OTHER', NULL, 0, NULL, NOW()),
('케틀벨 스윙',                         'OTHER', NULL, 0, NULL, NOW());
