# Quebra_Nozes

Base nova do Esquilo Invest.

Este repositório existe para receber a versão nova do produto, sem dependência estrutural do Apps Script.

## Leitura rápida

### Se você quer entender o projeto
1. `docs/README.md`
2. `docs/90_diagnostico/README.md`
3. `docs/arquitetura/README.md`
4. `docs/backlog_real/README.md`
5. `docs/fluxos/README.md`

### Se você quer entender a origem
1. `docs/00_migration/from_esquilo_invest_2_0_phase2.md`
2. `docs/20_product/o_que_manter_do_legado.md`

## Estrutura do repositório
- `docs/` documentação viva
- `apps/` aplicações de interface
- `services/` backend e integrações
- `packages/` contratos, core e UI compartilhada
- `database/` banco e seeds
- `tooling/` automações, utilitários e apoio de validação
- `assets/` recursos estáticos
- `OLD/` itens não ativos, legado isolado e materiais históricos

## Regra do projeto
O legado serve como origem de contexto.
O código novo deve nascer orientado a Cloudflare + D1.

## Estado real resumido
- `apps/web` hoje concentra prototipos, wireframes e mocks; nao e um app integrado
- `services/api` hoje e contratual e documental; nao e a API executavel
- `04_STARTER_BACKEND/esquilo_cloudflare_d1_starter` e a area com backend mais vivo
- `backend/modules` contem regras reais de dominio, mas ainda sem runtime oficial unico
