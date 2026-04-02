# Core data

## Objetivo
Centralizar a origem dos dados do app web.

## Providers previstos
- local mock
- hml mock
- http real

## Regra
A UI não decide a origem do dado.
Ela recebe um data source já resolvido.

## Interfaces mínimas
- DashboardDataSource
- PortfolioDataSource
- ProfileDataSource
- ImportDataSource
- HistoryDataSource
- AnalysisDataSource

## Meta
Trocar local -> hml -> prd com o mínimo de atrito.

## Estado atual
Existe implementação mínima em TypeScript para `AnalysisDataSource` e `HistoryDataSource` (mock e HTTP), sem bootstrapping do app ainda.
