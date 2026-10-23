-- Reply feedback (ORI-CHAT-007/008). Apply to ACCOUNTS_DB after schema.sql and organisations.sql. Rows go with the account.
CREATE TABLE IF NOT EXISTS reply_ratings (
 user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
 reply_ref TEXT NOT NULL,
 rating TEXT NOT NULL CHECK(rating IN ('up','down')),
 reason TEXT CHECK(reason IS NULL OR reason IN ('inaccurate','unhelpful','unsafe','other')),
 updated_at INTEGER NOT NULL,
 PRIMARY KEY(user_id,reply_ref)
);
CREATE INDEX IF NOT EXISTS reply_ratings_time ON reply_ratings(updated_at);
CREATE TABLE IF NOT EXISTS feedback_reports (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
 request_id TEXT NOT NULL,
 category TEXT NOT NULL CHECK(category IN ('inaccurate','unsafe','privacy','technical','other')),
 note TEXT,
 reply_ref TEXT,
 reply_excerpt TEXT,
 status TEXT NOT NULL CHECK(status IN ('open','reviewed')),
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL,
 UNIQUE(user_id,request_id)
);
CREATE INDEX IF NOT EXISTS feedback_reports_queue ON feedback_reports(status,created_at);
