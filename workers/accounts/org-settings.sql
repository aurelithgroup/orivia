-- Institution settings (ORI-UNI-015). Also created on first use by organisations.mjs (SETTINGS_SQL).
CREATE TABLE IF NOT EXISTS organisation_settings(org_id TEXT PRIMARY KEY REFERENCES organisations(id) ON DELETE CASCADE, data TEXT NOT NULL, revision INTEGER NOT NULL, updated_by TEXT REFERENCES user(id) ON DELETE SET NULL, updated_at INTEGER NOT NULL);
