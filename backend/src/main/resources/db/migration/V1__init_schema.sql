-- 초기 스키마 생성

CREATE TABLE users (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    username   VARCHAR(50)  NOT NULL,
    password   VARCHAR(255) NOT NULL,
    email      VARCHAR(100) NOT NULL,
    nickname   VARCHAR(50)  NOT NULL,
    gender     VARCHAR(20)  NOT NULL DEFAULT 'UNKNOWN',
    height     DOUBLE       NOT NULL DEFAULT 0,
    weight     DOUBLE       NOT NULL DEFAULT 0,
    role       VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_nickname (nickname)
);

CREATE TABLE exercises (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    body_part   VARCHAR(20)  NOT NULL,
    part_detail VARCHAR(50),
    is_custom   TINYINT(1)   NOT NULL DEFAULT 0,
    created_by  BIGINT,
    created_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_exercises_users FOREIGN KEY (created_by) REFERENCES users (id)
);

CREATE TABLE routines (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NOT NULL,
    title       VARCHAR(100) NOT NULL,
    description TEXT,
    active      TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_routines_users FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE routine_items (
    id               BIGINT      NOT NULL AUTO_INCREMENT,
    routine_id       BIGINT      NOT NULL,
    exercise_id      BIGINT      NOT NULL,
    order_in_routine INT         NOT NULL,
    sets             INT         NOT NULL,
    rest_seconds     INT         NOT NULL,
    created_at       DATETIME(6) NOT NULL,
    updated_at       DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_routine_items_routines   FOREIGN KEY (routine_id)  REFERENCES routines (id),
    CONSTRAINT fk_routine_items_exercises  FOREIGN KEY (exercise_id) REFERENCES exercises (id)
);

CREATE TABLE workout_sessions (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    user_id    BIGINT      NOT NULL,
    routine_id BIGINT,
    started_at DATETIME(6) NOT NULL,
    completed_at DATETIME(6),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_workout_sessions_users    FOREIGN KEY (user_id)    REFERENCES users (id),
    CONSTRAINT FK4q6pnw9nar0dxwb0qsofyefea  FOREIGN KEY (routine_id) REFERENCES routines (id)
);

CREATE TABLE workout_sets (
    id                 BIGINT      NOT NULL AUTO_INCREMENT,
    workout_session_id BIGINT      NOT NULL,
    exercise_id        BIGINT      NOT NULL,
    exercise_name      VARCHAR(255) NOT NULL,
    body_part_snapshot VARCHAR(50)  NOT NULL,
    set_number         INT          NOT NULL,
    weight             DOUBLE       NOT NULL DEFAULT 0,
    reps               INT          NOT NULL,
    created_at         DATETIME(6),
    updated_at         DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_workout_sets_sessions  FOREIGN KEY (workout_session_id) REFERENCES workout_sessions (id),
    CONSTRAINT fk_workout_sets_exercises FOREIGN KEY (exercise_id)         REFERENCES exercises (id)
);

CREATE TABLE shared_routines (
    id                    BIGINT       NOT NULL AUTO_INCREMENT,
    user_id               BIGINT       NOT NULL,
    title                 VARCHAR(100) NOT NULL,
    description           TEXT,
    routine_snapshot      JSON         NOT NULL,
    last_session_snapshot JSON,
    view_count            INT          NOT NULL DEFAULT 0,
    import_count          INT          NOT NULL DEFAULT 0,
    created_at            DATETIME(6)  NOT NULL,
    updated_at            DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_shared_routines_users FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE comments (
    id                BIGINT      NOT NULL AUTO_INCREMENT,
    shared_routine_id BIGINT      NOT NULL,
    user_id           BIGINT      NOT NULL,
    content           TEXT        NOT NULL,
    created_at        DATETIME(6) NOT NULL,
    updated_at        DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_comments_shared_routines FOREIGN KEY (shared_routine_id) REFERENCES shared_routines (id),
    CONSTRAINT fk_comments_users           FOREIGN KEY (user_id)           REFERENCES users (id)
);
