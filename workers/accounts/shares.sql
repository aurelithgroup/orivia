-- Shared conversation snapshots (ORI-CHAT-009/010). Apply to ACCOUNTS_DB after schema.sql. Rows go with the account.
-- Only a SHA-256 hash of the link token is stored; the token itself is shown once, to its owner.
CREATE TABLE IF NOT EXISTS shared_snapshots (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
 token_hash TEXT NOT NULL UNIQUE,
 title TEXT NOT NULL,
 content TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL,
 revoked_at INTEGER
);
CREATE INDEX IF NOT EXISTS shared_snapshots_owner ON shared_snapshots(user_id,created_at);
