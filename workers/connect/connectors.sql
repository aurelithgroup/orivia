-- University connector records (ORI-CONNECT-003/004). Not applied anywhere yet: no connection is configured.
-- person_ref is "<org>:<institution subject>", never a typed student number. Rows go with the organisation.
CREATE TABLE IF NOT EXISTS connector_events (
 org_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
 event_id TEXT NOT NULL,
 person_ref TEXT NOT NULL,
 status TEXT NOT NULL,
 source_version INTEGER NOT NULL,
 occurred_at TEXT NOT NULL,
 received_at INTEGER NOT NULL,
 PRIMARY KEY(org_id,event_id)
);
CREATE TABLE IF NOT EXISTS connector_status (
 org_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
 person_ref TEXT NOT NULL,
 status TEXT NOT NULL,
 source_version INTEGER NOT NULL,
 source_event_id TEXT NOT NULL,
 occurred_at TEXT NOT NULL,
 received_at INTEGER NOT NULL,
 recorded_at INTEGER NOT NULL,
 PRIMARY KEY(org_id,person_ref)
);
CREATE TABLE IF NOT EXISTS connector_sync (
 org_id TEXT PRIMARY KEY REFERENCES organisations(id) ON DELETE CASCADE,
 last_success_at INTEGER
);
