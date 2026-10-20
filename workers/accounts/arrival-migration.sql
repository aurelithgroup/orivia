-- Public arrival configuration only. Never contains member or application data.
CREATE TABLE IF NOT EXISTS organisation_arrivals (
 org_id TEXT PRIMARY KEY REFERENCES organisations(id) ON DELETE CASCADE,
 data TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1,updated_at INTEGER NOT NULL
);
