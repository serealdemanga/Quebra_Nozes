# Contracts

Esta pasta vai receber contratos compartilhados entre front e back.

Exemplos:
- schemas de payload
- tipos compartilhados
- mapeamento de tags da IA
- envelopes de erro e meta

## Regra desta fase

Enquanto `apps/web` e `apps/mobile` ainda nao sao projetos Node, estes contratos sao mantidos como **documentacao executavel** (markdown) e devem bater com o payload real do runtime atual (`04_STARTER_BACKEND/esquilo_cloudflare_d1_starter`).

Envelope HTTP oficial:

- sucesso: `{ ok: true, meta, data }`
- erro: `{ ok: false, meta, error }`

Headers de correlacao:

- `x-request-id` (sempre)
- `x-error-code` (apenas em erro)
