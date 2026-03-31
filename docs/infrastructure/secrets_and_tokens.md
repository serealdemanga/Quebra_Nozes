# Secrets and Tokens

## Objective
Define all sensitive values required by Esquilo Invest without storing real secrets in the repository.

## Rules
- never commit real secrets
- keep only templates and naming conventions in the repository
- use environment variables for all tokens and credentials
- document where each variable is used

## Required secrets

### Telegram
- TELEGRAM_BOT_TOKEN
- TELEGRAM_DEFAULT_CHAT_ID (optional fallback)

Used by:
- notifications module

### Email / Apps Script
- APPSCRIPT_EMAIL_WEBHOOK_URL
- APPSCRIPT_EMAIL_API_KEY (optional if webhook is protected)

Used by:
- notifications module

### AI providers
- OPENAI_API_KEY
- GEMINI_API_KEY

Used by:
- ia_translation layer only

### Cloudflare
- CLOUDFLARE_ACCOUNT_ID
- CLOUDFLARE_D1_DATABASE_ID
- CLOUDFLARE_API_TOKEN

Used by:
- deployment and database access

## Future secrets
- CVM_API_TOKEN (only if needed later)
- GOOGLE_FINANCE_PROXY_KEY (only if an intermediary service exists)

## Final rule
If a secret is not documented here, it should not be introduced silently in code.
