# Fontes oficiais e conflitos

## Fontes que hoje funcionam como referencia pratica

### Backlog oficial

- GitHub Issues

### Base integrada oficial

- `main` no GitHub

### Diagnostico oficial desta fase

- `docs/90_diagnostico/*`

## Fontes concorrentes que exigem decisao

### API

Conflito:

- `services/api/openapi.yaml`
- `docs/api/swagger.yaml`

Leitura:

- a primeira fala a lingua de imports no produto novo
- a segunda fala a lingua de score/goals/alerts

### Schema

Conflito:

- `database/d1/schema.sql`
- `OLD/banco_legado/01_schema.sql`

Leitura:

- o schema em `database/d1` e menor e mais focado
- `OLD/banco_legado/01_schema.sql` e mais amplo e inclui auth e outras estruturas

### Backend

Conflito:

- `services/api`
- `backend/modules`
- `04_STARTER_BACKEND/esquilo_cloudflare_d1_starter`

## Recomendacao desta fase

Tratar como oficial por evidencia de integracao:

- backlog: GitHub
- integracao: `main`
- diagnostico: `docs/90_diagnostico`
- backend mais vivo: `04_STARTER_BACKEND/esquilo_cloudflare_d1_starter`

Mas manter a ressalva:

- isso ainda nao resolve a decisao estrutural final
- apenas descreve onde a implementacao real esta hoje
