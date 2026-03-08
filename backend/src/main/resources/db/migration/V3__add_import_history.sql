CREATE TABLE import_history (
    id                BIGINT      NOT NULL AUTO_INCREMENT,
    user_id           BIGINT      NOT NULL,
    shared_routine_id BIGINT      NOT NULL,
    created_at        DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_import_history (user_id, shared_routine_id),
    CONSTRAINT fk_import_history_users          FOREIGN KEY (user_id)           REFERENCES users (id),
    CONSTRAINT fk_import_history_shared_routines FOREIGN KEY (shared_routine_id) REFERENCES shared_routines (id) ON DELETE CASCADE
);
