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
Existe implementação mínima em TypeScript para os data sources principais (mock e HTTP) e uma factory que resolve a fonte por ambiente/override, sem bootstrapping do app ainda.
