PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  auth_provider_id TEXT,
  device_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (device_id IS NULL OR length(trim(device_id)) > 0)
);

CREATE TABLE portfolios (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (normalized_name)
);

CREATE TABLE asset_types (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (code),
  UNIQUE (name)
);

CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  asset_type_id TEXT NOT NULL,
  code TEXT,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  is_custom INTEGER NOT NULL DEFAULT 0 CHECK (is_custom IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_type_id) REFERENCES asset_types(id)
);

CREATE TABLE user_financial_context (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  financial_goal TEXT,
  monthly_income_range TEXT,
  monthly_investment_target NUMERIC,
  risk_profile TEXT,
  platforms_used_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE imports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  portfolio_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'PARSING', 'DONE', 'FAILED')),
  origin TEXT NOT NULL CHECK (origin IN ('B3_CSV', 'BROKER_EXTRACT', 'MANUAL_ENTRY')),
  file_storage_ref TEXT,
  error_log TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TEXT,
  finished_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE SET NULL
);

CREATE TABLE import_rows (
  id TEXT PRIMARY KEY,
  import_id TEXT NOT NULL,
  row_number INTEGER NOT NULL,
  source_payload_json TEXT,
  normalized_payload_json TEXT,
  resolution_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (resolution_status IN ('PENDING', 'NORMALIZED', 'SKIPPED', 'FAILED')),
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (import_id) REFERENCES imports(id) ON DELETE CASCADE
);

CREATE TABLE portfolio_positions (
  id TEXT PRIMARY KEY,
  portfolio_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  platform_id TEXT,
  source_kind TEXT NOT NULL CHECK (source_kind IN ('ACOES', 'FUNDOS', 'PREVIDENCIA')),
  status TEXT,
  situacao TEXT,
  opened_at TEXT,
  quantity NUMERIC,
  average_price NUMERIC,
  current_price NUMERIC,
  invested_amount NUMERIC,
  current_amount NUMERIC,
  stop_loss NUMERIC,
  target_price NUMERIC,
  profitability NUMERIC,
  strategy TEXT,
  category_label TEXT,
  notes TEXT,
  source_updated_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (platform_id) REFERENCES platforms(id)
);

CREATE TABLE planned_orders (
  id TEXT PRIMARY KEY,
  portfolio_id TEXT NOT NULL,
  asset_id TEXT,
  platform_id TEXT,
  tipo TEXT,
  raw_asset_name TEXT,
  tipo_ordem TEXT NOT NULL,
  quantity NUMERIC,
  target_price NUMERIC,
  validity_date TEXT,
  potential_value NUMERIC,
  current_price NUMERIC,
  status TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (platform_id) REFERENCES platforms(id)
);

CREATE TABLE portfolio_contributions (
  id TEXT PRIMARY KEY,
  portfolio_id TEXT NOT NULL,
  platform_id TEXT,
  contribution_month TEXT NOT NULL,
  destination_label TEXT,
  category_label TEXT,
  amount NUMERIC NOT NULL,
  accumulated_amount NUMERIC,
  status TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  FOREIGN KEY (platform_id) REFERENCES platforms(id)
);

CREATE TABLE portfolio_snapshots (
  id TEXT PRIMARY KEY,
  portfolio_id TEXT NOT NULL,
  import_id TEXT,
  reference_date TEXT NOT NULL,
  total_equity NUMERIC,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  FOREIGN KEY (import_id) REFERENCES imports(id) ON DELETE SET NULL
);

CREATE TABLE portfolio_snapshot_positions (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  platform_id TEXT,
  quantity NUMERIC,
  unit_price NUMERIC,
  current_value NUMERIC,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (snapshot_id) REFERENCES portfolio_snapshots(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (platform_id) REFERENCES platforms(id)
);

CREATE TABLE portfolio_analyses (
  id TEXT PRIMARY KEY,
  portfolio_id TEXT NOT NULL,
  snapshot_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'GENERATED', 'FAILED')),
  score_value NUMERIC,
  profile_label TEXT,
  portfolio_decision TEXT,
  action_plan_text TEXT,
  messaging_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  FOREIGN KEY (snapshot_id) REFERENCES portfolio_snapshots(id) ON DELETE CASCADE
);

CREATE TABLE analysis_insights (
  id TEXT PRIMARY KEY,
  analysis_id TEXT NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT,
  message TEXT NOT NULL,
  priority INTEGER,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (analysis_id) REFERENCES portfolio_analyses(id) ON DELETE CASCADE
);

CREATE TABLE external_data_sources (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (code),
  UNIQUE (name)
);

CREATE TABLE external_market_references (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  external_code TEXT,
  reference_date TEXT,
  price NUMERIC,
  currency_code TEXT,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES external_data_sources(id)
);

CREATE TABLE operational_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  portfolio_id TEXT,
  import_id TEXT,
  event_type TEXT NOT NULL,
  event_status TEXT,
  message TEXT,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE SET NULL,
  FOREIGN KEY (import_id) REFERENCES imports(id) ON DELETE SET NULL
);

INSERT INTO asset_types (id, code, name) VALUES
  ('asset_type_stock', 'STOCK', 'Acoes'),
  ('asset_type_fund', 'FUND', 'Fundos'),
  ('asset_type_pension', 'PENSION', 'Previdencia');

INSERT INTO external_data_sources (id, code, name) VALUES
  ('source_googlefinance', 'GOOGLEFINANCE', 'Google Finance');



## Papel do Codex nesta etapa

### Regra central de atuação

O Codex não deve agir como se estivesse começando um sistema do zero.
Ele deve atuar sobre um sistema existente, em produção operacional ou próximo disso, com dependências reais, contratos já consumidos e partes legadas que ainda sustentam o funcionamento atual.

### O que o Codex deve fazer

**Fato + diretriz operacional**

Nesta etapa, o Codex deve:

- ler a documentação principal do projeto antes de alterar código
- tratar o schema D1 já gerado como referência estrutural do destino
- respeitar que a migração é progressiva
- preservar o funcionamento atual sempre que a regra de negócio ainda depender dele
- propor mudanças incrementais e verificáveis
- identificar pontos reais de leitura, escrita, adaptação e compatibilidade antes de refatorar

### O que o Codex não deve fazer

**Diretriz operacional**

O Codex não deve:

- assumir reescrita completa do backend agora
- remover planilha, BigQuery ou compatibilidades só porque o D1 já existe
- acoplar nova lógica diretamente à estrutura física do D1 em vários pontos do código
- espalhar novos acessos a dados por múltiplos arquivos sem centralização mínima
- trocar contratos consumidos pelo frontend/mobile sem mapear impacto
- inventar serviços, filas, autenticação ou integrações sem base suficiente no projeto

### Como o Codex deve decidir mudanças

**Inferência**

A unidade de decisão do Codex deve ser o fluxo real, não a elegância teórica.

Na prática, antes de mudar qualquer acesso a dados, o Codex deveria responder:

- quem consome esse dado hoje
- de onde esse dado vem hoje
- qual parte do AppsScript espera esse formato
- o que quebra se a origem mudar
- existe camada de adaptação já disponível
- a mudança pode ser feita sem alterar o contrato externo imediatamente

Se essas respostas não estiverem claras, a mudança não deveria ser agressiva.

### Prioridade correta do Codex

A prioridade não é “modernizar tudo”.
A prioridade é:

1. reduzir fragilidade
2. preparar a nova base
3. migrar fluxos prioritários
4. manter compatibilidade enquanto necessário
5. só depois reduzir legado

### Como o Codex deve tratar fatos, inferências e hipóteses

**Diretriz operacional**

Em qualquer proposta de implementação, o Codex deveria separar:

- **fato**: ponto confirmado em código ou documentação
- **inferência**: ajuste recomendado porque o desenho atual aponta nessa direção
- **hipótese**: mudança que depende de validação antes de ser consolidada

Isso é importante porque a transição atual ainda tem lacunas reais. Misturar tudo como se estivesse fechado aumenta risco de implementação errada.

## O que precisa mudar no AppsScript

### Ponto principal de adaptação

O AppsScript hoje conhece demais a forma como os dados estão organizados no legado.

Esse é o principal ponto que precisa começar a mudar.

A adaptação não precisa desmontar o AppsScript inteiro, mas precisa reduzir sua dependência direta de:

- estrutura física da planilha
- estrutura física do BigQuery
- aliases herdados usados para sustentar contratos antigos

### Pontos que hoje dependem de planilhas

**Fato**

Hoje ainda dependem de planilha, total ou parcialmente:

- fallback de leitura do dashboard
- cache de mercado
- histórico de decisão
- rotinas administrativas de sync
- contratos de abas e cabeçalhos ainda refletidos na normalização

### O que isso significa para a adaptação

**Inferência**

Esses pontos não precisam ser removidos todos de uma vez, mas precisam parar de ser tratados como base definitiva do sistema.

A adaptação esperada é:

- manter a planilha apenas onde ela ainda for necessária de forma explícita
- evitar que novos fluxos sejam construídos em cima dela
- reduzir a dependência do contrato físico de abas e cabeçalhos
- isolar o uso da planilha em pontos mais controlados

### Pontos que hoje dependem de BigQuery

**Fato**

Hoje o BigQuery é a fonte principal de leitura e escrita operacional por meio de `BigQueryService.gs`.

Isso afeta diretamente:

- leitura principal de ações, fundos, previdência, aportes e pré-ordens
- operações controladas de insert, update e delete
- contratos estruturados devolvidos para o restante da aplicação

### O que deverá mudar nesses pontos

**Inferência**

Esses trechos deverão migrar gradualmente de uma implementação centrada em `BigQueryService.gs` para uma camada nova de acesso a dados que possa:

- falar com o D1 como destino principal
- manter adaptação de contrato enquanto o restante do sistema ainda precisar do formato legado
- reduzir o número de arquivos que conhecem detalhes físicos da persistência

### Trechos que deverão passar a consumir uma nova camada de acesso

**Inferência**

Os fluxos que mais claramente deveriam passar por uma nova camada são:

- leitura principal da carteira para dashboard
- leitura usada pelo endpoint mobile
- operações controladas de CRUD operacional
- carregamento de snapshots e dados consolidados
- eventuais leituras analíticas persistidas

O motivo é simples: são os pontos em que a origem dos dados vai deixar de ser detalhe técnico e passar a ser fator de risco se continuar espalhado.

### O que pode ser mantido provisoriamente

**Fato + inferência**

Pode ser mantido provisoriamente:

- AppsScript como backend de orquestração
- fallback controlado para planilha, enquanto necessário
- parte do contrato atual devolvido ao frontend
- compatibilidades temporárias via mapeamento ou views, quando realmente reduzirem impacto

Isso é aceitável porque a decisão do projeto não é reescrever tudo agora.

### O que precisa ser desacoplado

**Inferência**

Precisa começar a ser desacoplado:

- acesso direto da regra de negócio a tabelas físicas específicas
- dependência de aliases legados dentro de múltiplas camadas
- mistura de normalização de dados com lógica de leitura operacional
- conhecimento distribuído de origem física dos dados

### O que deve deixar de existir no futuro

**Inferência**

No futuro, deveria deixar de existir:

- AppsScript conhecendo detalhes de cabeçalho e compatibilidade herdada da planilha como regra principal
- BigQuery como ponte obrigatória se o D1 já estiver consolidado como base operacional
- duplicação de adaptações para sustentar simultaneamente estruturas antigas por tempo indefinido
- fallback permanente baseado em estruturas frágeis sem critério de desativação

## Adaptações mínimas, intermediárias e futuras

### Adaptações mínimas

Mudanças pequenas e pragmáticas para começar a usar a nova base sem quebrar o funcionamento atual.

#### 1. Mapear os pontos reais de acesso a dados no AppsScript

Antes de trocar qualquer origem, o Codex deve localizar exatamente:

- onde o dashboard lê dados
- onde o mobile lê dados
- onde o CRUD escreve dados
- onde o fallback entra
- onde aliases legados são aplicados

Motivo: sem esse mapa, qualquer troca de origem fica cega.

#### 2. Criar uma camada inicial de acesso a dados sem desmontar a orquestração atual

Essa camada inicial pode começar simples.
O objetivo não é sofisticar. É concentrar acesso.

Motivo: reduzir o número de pontos do AppsScript que precisam saber se a origem atual é BigQuery, planilha ou D1.

#### 3. Manter o contrato externo o mais estável possível no começo

O payload esperado por frontend e mobile não deve ser alterado sem necessidade imediata.

Motivo: a migração do armazenamento já é mudança suficiente. Mudar persistência e contrato externo ao mesmo tempo aumenta muito o risco.

#### 4. Tratar D1 primeiro como nova fonte estruturante, não como desculpa para refatoração total

A entrada do D1 deve começar pelos fluxos prioritários e mais controláveis.

Motivo: trocar tudo de uma vez sem consolidar leituras prioritárias tende a quebrar dashboard, mobile e rotinas administrativas.

### Adaptações intermediárias

Mudanças para reduzir dependência do legado, melhorar organização e preparar o terreno para comunicação mais limpa.

#### 1. Substituir gradualmente leituras operacionais hoje centralizadas no BigQuery

Depois que a camada inicial existir, o passo intermediário é mover leituras prioritárias do fluxo operacional para a nova base.

Motivo: BigQuery hoje é fonte principal, mas não é o destino estruturante definido para a evolução do sistema.

#### 2. Reduzir compatibilidade herdada para pontos realmente necessários

Compatibilidade deve ser usada como ferramenta de transição, não como camada permanente em tudo.

Motivo: compatibilidade demais vira dívida estrutural e confusão de fluxo.

#### 3. Isolar melhor planilha e sync administrativo

Planilha e rotinas de sync devem ficar mais claramente separadas do fluxo principal do produto.

Motivo: reduz risco de a contingência continuar mandando mais do que deveria na arquitetura.

#### 4. Revisar responsabilidade de normalização

Parte da normalização hoje existe para sustentar o contrato histórico.
No estágio intermediário, isso precisa ser revisto para que o sistema normalize com foco no novo modelo, não apenas para imitar o legado.

Motivo: sem essa revisão, o novo banco vira só novo armazenamento para os mesmos acoplamentos antigos.

### Adaptações futuras

Mudanças que fazem sentido depois que o D1 estiver consolidado e a camada antiga puder ser reduzida ou removida.

#### 1. Reduzir ou remover dependência operacional de BigQuery

Quando os fluxos principais estiverem estáveis sobre a nova base, BigQuery deve deixar de ser caminho central do produto.

Motivo: manter duas bases operacionais fortes por tempo demais aumenta custo, confusão e risco de divergência.

#### 2. Reduzir planilha a papel residual ou encerrar seu uso operacional

Se contingência, cache e histórico já tiverem alternativas mais seguras, a planilha não deve continuar como eixo oculto do sistema.

Motivo: a proposta da migração é justamente sair da fragilidade estrutural do modelo atual.

#### 3. Revisar o papel do próprio AppsScript

Só depois da estabilização da nova base faz sentido discutir se o AppsScript continua como backend principal, como camada transitória ou como peça menor de compatibilidade.

Motivo: discutir isso antes da consolidação do D1 antecipa uma reescrita que o projeto explicitamente não quer fazer agora.

[CONTINUA NA PRÓXIMA RESPOSTA]
