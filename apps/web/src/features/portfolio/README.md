# Feature Portfolio

## Objetivo
Ler a carteira por categoria e por ativo sem confusão.

## Entradas esperadas
- `portfolio.json` no local mock
- `GET /v1/portfolio` no provider HTTP

## Blocos mínimos
- resumo da carteira
- grupos por categoria
- holding tile
- filtros básicos
- acesso ao detalhe do ativo

## Regra
A carteira precisa ser legível mesmo sem filtro avançado no começo.

## Filtros (contrato atual)
- `performance=all|best|worst` (opcional)
