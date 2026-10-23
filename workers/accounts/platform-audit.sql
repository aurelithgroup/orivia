-- Platform-level audit (ORI-METRIC-006 exports; later owner actions). Apply to ACCOUNTS_DB after schema.sql.
-- No personal content: actor id, action name, small numeric detail and time. Actor link nulls on account deletion.
CREATE TABLE IF NOT EXISTS platform_audit (
 id TEXT PRIMARY KEY,
 actor_id TEXT REFERENCES user(id) ON DELETE SET NULL,
 action TEXT NOT NULL CHECK(length(action)<=60),
 detail TEXT CHECK(detail IS NULL OR length(detail)<=200),
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS platform_audit_time ON platform_audit(created_at);
