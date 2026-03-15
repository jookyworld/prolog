-- 사용자 출생연도 필드 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS birth_year INT NULL
COMMENT '사용자 출생연도';
