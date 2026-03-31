# Quebra_Nozes

Base nova do Esquilo Invest.

Este repositório existe para receber a versão nova do produto, sem dependência estrutural do Apps Script.

## Leitura rápida

### Se você quer entender o projeto
1. `docs/20_product/visao_do_produto.md`
2. `docs/20_product/mvp_e_fases.md`
3. `docs/10_target_architecture/stack_e_pastas.md`
4. `docs/30_data/contratos_e_fontes.md`

### Se você quer entender a origem
1. `docs/00_migration/from_esquilo_invest_2_0_phase2.md`
2. `docs/20_product/o_que_manter_do_legado.md`

## Estrutura do repositório
- `docs/` documentação viva
- `apps/` aplicações de interface
- `services/` backend e integrações
- `packages/` contratos, core e UI compartilhada
- `database/` banco e seeds
- `scripts/` automações locais
- `tests/` testes e cenários
- `assets/` recursos estáticos

## Regra do projeto
O legado serve como origem de contexto.
O código novo deve nascer orientado a Cloudflare + D1.
