# Feature Holding Detail

## Objetivo
Aprofundar um ativo sem virar relatorio: situacao, recomendacao e contexto da categoria.

## Entradas esperadas
- `holding_detail_pos_1.json` no local mock
- `GET /v1/portfolio/{portfolioId}/holdings/{holdingId}` no provider HTTP

## Estados
- `redirect_onboarding`: orientar para onboarding
- caminho feliz: `holding` + `recommendation` + `categoryContext` + `externalLink`

## Regra
Detalhe existe para orientar decisao. Se nao muda acao, nao merece complexidade.

