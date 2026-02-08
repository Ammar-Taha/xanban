# Xanban Email Templates 📧

Branded HTML email templates for Supabase authentication in Xanban.

## 📋 Templates

1. **01-confirm-signup.html** — Welcome + email confirmation
2. **02-magic-link.html** — Passwordless sign-in link
3. **03-reset-password.html** — Password reset + security notice
4. **04-invite-user.html** — Invitation + feature highlights
5. **05-change-email.html** — Email change confirmation
6. **06-reauthentication.html** — Reauth with large OTP display

## 🎨 Branding

- **Xanban** name and task-management copy
- **Primary:** `#635fc7` (header gradient, CTAs, links)
- **Background:** `#f4f7fd` (page), `#ffffff` (card)
- **Text:** `#000112` (headings), `#525866` (body), `#828fa3` (muted)
- **Dividers:** `#e4ebfa`
- Inline CSS, 600px max-width, table-based layout for email clients

## 🚀 Install in Supabase

### Dashboard

1. **Authentication** → **Email Templates**
2. For each type (Confirm signup, Magic Link, Recovery, Invite, Email change, Reauthentication):
   - Paste the HTML from the matching `.html` file
   - Set the subject from `subjects.json`
   - Save

### Subjects (`subjects.json`)

- **Confirm signup:** Welcome to Xanban — Confirm your email
- **Magic link:** Your Xanban sign-in link
- **Reset password:** Reset your Xanban password
- **Invite:** You've been invited to Xanban
- **Email change:** Confirm your new email address
- **Reauthentication:** Xanban verification code

### Local / self-hosted

In `config.toml`:

```toml
[auth.email.template.confirmation]
subject = "Welcome to Xanban — Confirm your email"
content_path = "./supabase/email-templates/01-confirm-signup.html"

[auth.email.template.magic_link]
subject = "Your Xanban sign-in link"
content_path = "./supabase/email-templates/02-magic-link.html"

[auth.email.template.recovery]
subject = "Reset your Xanban password"
content_path = "./supabase/email-templates/03-reset-password.html"

[auth.email.template.invite]
subject = "You've been invited to Xanban"
content_path = "./supabase/email-templates/04-invite-user.html"

[auth.email.template.email_change]
subject = "Confirm your new email address"
content_path = "./supabase/email-templates/05-change-email.html"

[auth.email.template.reauthentication]
subject = "Xanban verification code"
content_path = "./supabase/email-templates/06-reauthentication.html"
```

## 🔐 Template variables (used in our templates)

| Variable | Used in | Who fills it | Required setup |
|----------|--------|----------------|----------------|
| `{{ .ConfirmationURL }}` | 01–05 | Supabase Auth | App must pass `emailRedirectTo` / `redirectTo` when calling `signUp`, `signInWithOtp`, `resetPasswordForEmail`, or invite; and that URL must be in **Redirect URLs** allowlist (see below). |
| `{{ .Token }}` | 01–06 | Supabase Auth | None. Always injected when the email is sent. |
| `{{ .SiteURL }}` | 01–06 (footer “Need help?”) | Supabase Auth | **Site URL** must be set in Dashboard (see below). If missing, the link shows blank or wrong. |
| `{{ .NewEmail }}` | 05 (change-email only) | Supabase Auth | None. Filled when the “change email” flow sends the template. |

## ✅ Required Supabase configuration (no raw variables in emails)

Supabase Auth fills the variables above only when the project is configured correctly. Do this in the Supabase Dashboard so users never see `{{ .SiteURL }}` or broken links:

1. **Authentication** → **URL Configuration**
   - **Site URL:** Set to your app’s public URL (e.g. `https://xanban-lime.vercel.app` or `http://localhost:3000` for dev).  
     This is what Supabase uses for `{{ .SiteURL }}` in every template.
   - **Redirect URLs:** Add every URL your app uses as a post-login/redirect target. Our app uses:
     - `https://your-domain.com/auth/callback` (signup, magic link, OAuth)
     - `https://your-domain.com/reset-password` (password reset)
     - For local dev add: `http://localhost:3000/auth/callback` and `http://localhost:3000/reset-password`

2. **App env:** Set `NEXT_PUBLIC_APP_URL` (in `.env.local` / production env) to the same value as **Site URL** so the auth provider sends the correct redirect targets. See `.env.example`.

If **Site URL** is missing, the “Need help? Visit {{ .SiteURL }}” line (and any other use of `{{ .SiteURL }}`) can render blank or as literal text. If a redirect URL is not allowlisted, the confirmation link may fail with “redirect URL not allowed”.

## ⚠️ Other notes

1. **Prefetching:** Templates include both `{{ .ConfirmationURL }}` and `{{ .Token }}` so security tools don’t consume the link before the user clicks.
2. **Testing:** After uploading templates and setting URL config, test signup, magic link, password reset, and (if used) invite and reauth so all variables render correctly.

---

**Xanban** — Task management with boards, columns, and cards.
