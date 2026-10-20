-- Separate accounts DB. No chat-budget changes.
CREATE TABLE IF NOT EXISTS notification_preferences(user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,reminders INTEGER NOT NULL DEFAULT 0,membership INTEGER NOT NULL DEFAULT 0,updates INTEGER NOT NULL DEFAULT 0,reminders_since INTEGER NOT NULL,membership_since INTEGER NOT NULL,updates_since INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,kind TEXT NOT NULL,ref TEXT NOT NULL,org_id TEXT REFERENCES organisations(id) ON DELETE CASCADE,created_at INTEGER NOT NULL,read_at INTEGER,UNIQUE(user_id,kind,ref));
CREATE INDEX IF NOT EXISTS notification_owner_time ON notifications(user_id,created_at);
CREATE TABLE IF NOT EXISTS notification_subscriptions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,session_id TEXT NOT NULL REFERENCES session(id) ON DELETE CASCADE,endpoint TEXT NOT NULL UNIQUE,data TEXT NOT NULL,language TEXT NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS notification_deliveries(notification_id TEXT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,subscription_id TEXT NOT NULL REFERENCES notification_subscriptions(id) ON DELETE CASCADE,status TEXT NOT NULL,PRIMARY KEY(notification_id,subscription_id));
CREATE TABLE IF NOT EXISTS notification_meter(day TEXT PRIMARY KEY,count INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS notification_cursor(id INTEGER PRIMARY KEY,value TEXT NOT NULL);
