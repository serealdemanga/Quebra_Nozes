# External Services Map

## Objective
Map all external integrations and responsibilities.

## Services

### Telegram
- purpose: send alerts
- module: notifications

### Apps Script Email
- purpose: send email alerts
- module: notifications

### AI Providers
- purpose: translate outputs to human language
- module: ia_translation

### Cloudflare D1
- purpose: database
- module: all backend modules

## Rules
- each service must have a single responsible module
- no duplicated integrations across modules
- integrations must be isolated from business logic

## Future
- brokerage APIs
- price feeds

## Final rule
External services must never contain business decision logic.
