# Feature Profile

## Objetivo
Permitir ajuste de contexto do usuário e controle de preferências visuais.

## Entradas esperadas
- `profile_context.json` no local mock
- `GET /v1/profile/context` e `PUT /v1/profile/context` no provider HTTP

## Blocos mínimos
- contexto financeiro
- plataformas usadas
- preferências de exibição
- ghost mode
- estado de salvamento

## Regra
O perfil melhora a leitura da carteira. Não deve parecer cadastro bancário chato.

## Estados (E2E-003)
- ao reabrir, dados devem reaparecer iguais ao salvo (fonte de verdade = GET /v1/profile/context).
- salvar deve atualizar `onboarding` quando o usuário concluir o fluxo.
