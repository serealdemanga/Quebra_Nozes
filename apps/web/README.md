# App web

Esta pasta vai receber o front web principal do produto novo.

Deve consumir contratos estáveis e não depender do legado em Apps Script.

## Status

Base mínima executável (Vite + React + TypeScript), ainda sem layout final.

## Rodar local (quando Node estiver disponível)

```bash
npm install
npm run dev
```

### Variáveis de ambiente (opcional)

- `VITE_APP_ENV`: `local` | `hml` | `prd` (default: `local`)
- `VITE_DATA_MODE`: `auto` | `mock_local` | `mock_hml` | `http` (default: `auto`)
- `VITE_API_BASE_URL`: base URL do backend quando `VITE_DATA_MODE=http`
