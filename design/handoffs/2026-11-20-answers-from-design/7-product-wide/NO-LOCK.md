# No account lock after wrong passwords (Ulia, 20 Nov 2026)

- **No lockout.** A person is never locked out for wrong passwords: people do cycle through their old passwords.
- **Nothing to unlock.** There is no "Locked" account state, no Locked pill and no Unlock in Manage account.
- **The login offers a reset instead.** From the **3rd wrong password in a row** for the same email:
  - the C9 alert becomes "That email and password don’t match. Forgot your password? **Email me a link to reset it**";
  - the link sits inside the alert, underlined, 600, in the alert's colour;
  - it sends the reset email at once and opens F2 ("Check your email") with this email, skipping F1;
  - the person can still go back and keep trying.
- **The 1st and 2nd wrong password** show the alert as today.
- **F6 is removed** (set a password on a locked account with two-step). Two-step is still asked at the next login (D1).
- **The only limit left is against bots.** Proposed: 20 failed tries per email per 15 minutes, and per IP. When hit, the existing "Too many failed attempts. Try again later." Your IP rule (50 in an hour, 30 minutes refused) can stay as part of it. Please confirm the numbers.

Frame: `4-login/screens/sign-in-company-login-no-lock/export/RC9r-OfferReset.html` (C9-3 as today, C9-3r the new alert).
