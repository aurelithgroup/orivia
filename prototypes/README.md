# Prototypes (not deployed)

`northbay-demo.html` is a clickable demo of one Orivia platform for a fictional university (Northbay). It uses sample data held in memory. Nothing is saved, sent or connected, and it is not part of any Worker or the website.

**The flow:**

1. The owner creates Northbay and invites its first admin.
2. The admin accepts, publishes a guide, makes an invitation QR code and invites an editor.
3. A student opens the invitation and asks to join.
4. The admin approves.
5. Northbay appears inside the student's Orivia.

**States covered:**

- empty organisations, guides, QR codes and requests;
- a pending join request;
- an expired or revoked invitation;
- a public QR code that unlocks nothing;
- a non-member refused from the staff dashboard and the student space;
- editor limits;
- application records locked behind a separate permission;
- leaving;
- support requests that carry only what the person attached.

**Permission rules** come from Ina's review on 20 October, in `ROLE_PERMS` and `can()`:

- **Editors** draft guides and create public QR codes.
- **Admins** also publish, approve members, and manage invitations and staff.
- **Application records** need their own permission.
- **A verified email** never grants staff access.

**Counts** come only from explicit actions (QR opens, guide views, joins). Groups under 10 are hidden, which is a safeguard, not a guarantee.

The "What just happened" panel lists each permission check the server will need to make. Ina owns the real records and checks.
