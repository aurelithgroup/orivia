# Private pilot demo update — 21 October 2026

## Live

- Private Worker: `orivia-research-pilot`.
- Latest deployed version: `1a4a3c88-dd7d-45cb-8bfa-76bbb3e4c462`.
- UI source: `d1606ad` plus workspace visibility follow-up through `9049b92`.
- Static notification bell beside Settings, notification Settings entry, ORIVIA wordmark returns Home. Refresh visibility after entering the workspace and hide the bell on leaving.
- Preserved existing live assistant backend and `accounts.mjs`. Only embedded HTML/chat were patched. The repository main Worker still does not represent the entire live assistant bundle, so do not blindly rebuild it for deployment.

## Email sending

The founder confirmed paying for Workers Paid. Billing subscription API cannot be read with this OAuth connection (no Billing scope). Email Sending is operational at the API level:

- Enabled `auth.aurelithgroup.org` as sending subdomain.
- Sending subdomain ID: `798e0f9464754755b05a87a0ec8fd746`.
- Applied Cloudflare-generated DNS records. DNS status returns `ready`, no errors.
- Records only affect the auth sending subdomain, its cf-bounce return path and DKIM. Existing apex email service is unchanged.
- `ACCOUNTS_EMAIL_MODE=sending`.
- `ACCOUNTS_EMAIL` binding now restricts sender to `login@auth.aurelithgroup.org` rather than restricting destinations to the two test addresses.
- Existing account email caps stay 10/day and 100/month. All other Worker bindings, including AI and search limits, were compared unchanged after the first deployment. Secret values were neither read nor replaced.
- Email API reported quota 200/day before sending.
- One non-OTP setup test sent to the founder's existing Outlook address. API accepted/queued it without immediate bounce. Inbox arrival is not confirmed. This REST test does not establish the full Better Auth sign-in flow or Worker binding delivery.
- Cloudflare Access still protects the private pilot. Enabling general email transport does not make the app publicly accessible.

## Remaining device checks

1. Refresh and enter a signed-in personal workspace. Check bell and Settings entry.
2. Tap ORIVIA from chat to return Home.
3. Enable device alerts if needed and send one test alert. Browser permission alone does not confirm a connected push subscription or delivery.
4. Confirm the setup test email reaches Outlook, then check a real sign-in email from the app.

## Validation limits

The notification client and related regression checks passed before the execution workspace disconnected. The small workspace-entry/reset follow-up was inspected in the deployed bundle and saved to source, but cannot currently be run through the local suite because the execution environment is unavailable. No real browser/device walkthrough has been performed for this deployment. Public beta was not redeployed.
