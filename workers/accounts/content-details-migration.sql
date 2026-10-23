-- 21 Oct: optional structured details for organisation content (validated by content-details.mjs). Additive:
-- existing rows keep NULL and keep working. Apply once to each existing accounts database.
ALTER TABLE organisation_content ADD COLUMN details TEXT;
