# Feature Holding Detail

## Objetivo
Aprofundar um ativo sem virar relatorio: situacao, recomendacao e contexto da categoria.

## Entradas esperadas
- `holding_detail_pos_1.json` no local mock
- `holding_detail_pos_bal_3.json` e `holding_detail_pos_bal_4.json` no local mock (fundos/previdencia)
- `GET /v1/portfolio/{portfolioId}/holdings/{holdingId}` no provider HTTP

## Estados
- `redirect_onboarding`: orientar para onboarding
- caminho feliz: `holding` + `recommendation` + `categoryContext` + `externalLink`

## Regra
Detalhe existe para orientar decisao. Se nao muda acao, nao merece complexidade.

## Tipos (US034/US035)
A tela pode variar blocos com base em `holding.assetTypeCode` (ex.: `FUND` vs `PENSION`) sem mudar o contrato base.

## Implementacao (sem layout)
`holding_detail_controller.ts` centraliza leitura do contrato e targets de navegacao.
