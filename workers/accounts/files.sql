-- Files (step 6). Additive; the Worker also creates these if missing (workers/accounts/files.mjs). Apply to ACCOUNTS_DB only.
CREATE TABLE IF NOT EXISTS account_files(id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, name TEXT NOT NULL, type TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS account_files_user ON account_files(user_id, created_at);
CREATE TABLE IF NOT EXISTS account_file_meter(user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE, day TEXT NOT NULL, count INTEGER NOT NULL);
