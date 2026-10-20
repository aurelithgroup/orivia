-- Apply to ACCOUNTS_DB only, after schema.sql. No changes to the chat-budget database.
CREATE TABLE IF NOT EXISTS platform_roles (
 user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
 role TEXT NOT NULL CHECK(role IN ('owner','engineering','support')),
 PRIMARY KEY(user_id,role)
);
CREATE TABLE IF NOT EXISTS organisations (
 id TEXT PRIMARY KEY,slug TEXT NOT NULL UNIQUE,name TEXT NOT NULL,city TEXT NOT NULL,
 demo INTEGER NOT NULL CHECK(demo IN (0,1)),status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused')),
 created_by TEXT REFERENCES user(id) ON DELETE SET NULL,created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS organisation_invitations (
 id TEXT PRIMARY KEY,org_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
 token_hash TEXT NOT NULL UNIQUE,role TEXT NOT NULL CHECK(role IN ('admin','editor','student')),
 recipient_email TEXT,label TEXT NOT NULL,expires_at INTEGER NOT NULL,revoked INTEGER NOT NULL DEFAULT 0 CHECK(revoked IN (0,1)),
 max_uses INTEGER NOT NULL CHECK(max_uses BETWEEN 1 AND 500),uses INTEGER NOT NULL DEFAULT 0,
 created_by TEXT REFERENCES user(id) ON DELETE SET NULL,created_at INTEGER NOT NULL,
 CHECK(role='student' OR (recipient_email IS NOT NULL AND max_uses=1))
);
CREATE TABLE IF NOT EXISTS organisation_memberships (
 org_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
 role TEXT NOT NULL CHECK(role IN ('admin','editor','student')),
 status TEXT NOT NULL CHECK(status IN ('requested','active','left','removed','declined')),
 invitation_id TEXT REFERENCES organisation_invitations(id) ON DELETE SET NULL,
 request_id TEXT NOT NULL,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,
 PRIMARY KEY(org_id,user_id)
);
CREATE INDEX IF NOT EXISTS org_member_status ON organisation_memberships(org_id,status,role);
CREATE TABLE IF NOT EXISTS organisation_content (
 id TEXT PRIMARY KEY,org_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK(kind IN ('guide','contact','date','update')),title TEXT NOT NULL,body TEXT NOT NULL,
 visibility TEXT NOT NULL CHECK(visibility IN ('public','members')),status TEXT NOT NULL CHECK(status IN ('draft','published')),
 revision INTEGER NOT NULL DEFAULT 1,updated_by TEXT REFERENCES user(id) ON DELETE SET NULL,updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS organisation_public_codes (
 id TEXT PRIMARY KEY,org_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
 content_id TEXT REFERENCES organisation_content(id) ON DELETE CASCADE,label TEXT NOT NULL,
 revoked INTEGER NOT NULL DEFAULT 0 CHECK(revoked IN (0,1)),created_by TEXT REFERENCES user(id) ON DELETE SET NULL,created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS organisation_audit (
 id TEXT PRIMARY KEY,org_id TEXT REFERENCES organisations(id) ON DELETE CASCADE,
 actor_id TEXT REFERENCES user(id) ON DELETE SET NULL,action TEXT NOT NULL,target_id TEXT,created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS org_audit_time ON organisation_audit(org_id,created_at);
