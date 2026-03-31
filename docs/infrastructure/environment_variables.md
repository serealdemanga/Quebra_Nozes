# Environment Variables

## Objective
Define all environment variables required to run the system locally and in production.

## Naming convention
- uppercase
- snake_case
- prefix by domain when necessary

## Variables

### Core
- NODE_ENV=development | production
- APP_PORT=3000

### Database
- D1_DATABASE_ID
- D1_DATABASE_NAME

### Telegram
- TELEGRAM_BOT_TOKEN
- TELEGRAM_DEFAULT_CHAT_ID

### Email
- APPSCRIPT_EMAIL_WEBHOOK_URL

### AI
- OPENAI_API_KEY
- GEMINI_API_KEY

## Example (.env.example)

NODE_ENV=development
APP_PORT=3000

D1_DATABASE_ID=your_database_id
D1_DATABASE_NAME=esquilo

TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_DEFAULT_CHAT_ID=

APPSCRIPT_EMAIL_WEBHOOK_URL=

OPENAI_API_KEY=
GEMINI_API_KEY=

## Rule
If a variable is required by a module, it must be declared here and in .env.example.
