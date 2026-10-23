# University connectors: contract (ORI-CONNECT-001 to 006)

**Readiness boundary (CONNECT-006).** This is connector *software* tested against a synthetic fixture. **No university, SSO provider, student-record system, visa database or government service is connected.** A live connection needs an authorised partner, an agreement and credentials, and none exists. Release notes must keep these two things separate.

Code: `workers/connect/connectors.mjs`. Schema: `workers/connect/connectors.sql`, which isn't applied anywhere yet. Tests: `tests/connectors.test.mjs`.

## Adapters

- **Read-only capabilities:** `identity`, `statusTimeline`, `timetable` and `ticketLookup`. An adapter never writes to the institution's systems.
- **Connection state:**
  - `configured` only with **both** a credential held as a server secret (at least 32 characters) and a recorded partner agreement (`agreementRef`, `agreementSignedAt`);
  - `sandbox` for the fixture;
  - `revoked` after disconnect;
  - otherwise `not_configured`.
- **Fixture adapter:** fictional people only, with no network calls.

## Identity (CONNECT-002)

- **Matching:** a person is matched only from claims the institution's identity provider issued for the signed-in account: the issuer must equal the connection's, plus a subject.
- **Typed IDs:** a typed student number is ignored, so changing a student-ID parameter can't select someone else.
- **Blocked:** real SSO is blocked externally.

## Inbound updates (CONNECT-003)

- **Signature:** `X-Orivia-Signature`, an HMAC-SHA256 hex digest of `"<timestamp>.<body>"` with the connection's secret, compared in constant time.
- **Freshness:** `X-Orivia-Timestamp` must be within 5 minutes.
- **Schema:** exactly `eventId`, `subject`, `status` (from the vocabulary below), `sourceVersion` and `occurredAt`. Unknown fields or status words are refused.
- **Idempotency:** each `(organisation, eventId)` is recorded once, so a replay returns `duplicate`.
- **Ordering:** the current status changes only when `sourceVersion` is newer. Older or out-of-order events stay in the log and never regress the status.
- **Routing:** the organisation comes from the connection that verified the signature, never from the body.
- **Polling:** where webhooks are unavailable, polling with bounded backoff will use the same `receiveUpdate` path. That's not built, since there's no partner to poll.

## Provenance and meaning (CONNECT-004)

Each status keeps:
- the source event id and version;
- when it happened at the source;
- when Orivia received and recorded it;
- the organisation's last successful sync.

The vocabulary keeps who asserted each status:

| Status | Asserted by |
|---|---|
| `application_received`, `documents_requested`, `university_submitted`, `withdrawn` | University |
| `authority_received`, `authority_approved`, `authority_refused` | Authority |

A university's "submitted" is never shown as a government approval.

## Disconnect (CONNECT-005)

A revoked connection refuses every update (410), including correctly signed ones queued before the revocation. Revoking the credential with the partner remains a step for the partner and the founder.
