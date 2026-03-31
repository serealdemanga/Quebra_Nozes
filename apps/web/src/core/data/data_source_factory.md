# Data source factory

## Objetivo
Trocar a origem dos dados sem reescrever tela.

## Ambientes previstos
- `local`
- `hml`
- `prd`

## Contrato esperado
A factory resolve providers para:
- dashboard
- portfolio
- profile
- imports
- history
- analysis

## Regra
A tela nunca faz `fetch` direto.
A tela recebe um provider pronto.

## Exemplo de decisão
- `local` -> JSON local
- `hml` -> mock remoto ou provider híbrido
- `prd` -> HTTP real

## Meta
Deixar o front plug and play, sem gambiarra de ambiente espalhada.
