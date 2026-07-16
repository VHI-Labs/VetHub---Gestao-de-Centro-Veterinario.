# Banco de Dados

## Visão Geral

O VetHub utiliza PostgreSQL no Supabase com 7 tabelas principais e Row Level Security (RLS) ativo em todas elas.

---

## Tabelas

### `companies` — Empresas

Representa cada empresa/organização no sistema multi-tenant.

| Coluna (DB) | Tipo | Mapeamento TS | Descrição |
|---|---|---|---|
| `id` | `uuid` PK | `id` | UUID gerado automaticamente |
| `name` | `text` | `name` | Nome da empresa |
| `slug` | `text` unique | `slug` | Identificador amigável (URL-safe) |
| `logo_url` | `text` | `logoUrl` | URL do logo da empresa |
| `cover_url` | `text` | `coverUrl` | URL da imagem de capa |
| `settings` | `jsonb` | `settings` | Configurações customizadas |
| `active` | `boolean` | `active` | Se a empresa está ativa |
| `created_at` | `timestamptz` | `createdAt` | Data de criação |
| `updated_at` | `timestamptz` | `updatedAt` | Última atualização |

### `units` — Unidades/Filiais

Unidades (filiais) vinculadas a uma empresa.

| Coluna (DB) | Tipo | Mapeamento TS | Descrição |
|---|---|---|---|
| `id` | `uuid` PK | `id` | UUID gerado automaticamente |
| `company_id` | `uuid` FK | `companyId` | Referência à `companies.id` |
| `name` | `text` | `name` | Nome da unidade |
| `slug` | `text` | `slug` | Identificador amigável |
| `address` | `text` | `address` | Endereço da unidade |
| `phone` | `text` | `phone` | Telefone de contato |
| `active` | `boolean` | `active` | Se a unidade está ativa |
| `settings` | `jsonb` | `settings` | Configurações da unidade |
| `created_at` | `timestamptz` | `createdAt` | Data de criação |
| `updated_at` | `timestamptz` | `updatedAt` | Última atualização |

### `pets` — Pacientes

Registro principal de cada paciente na fila de atendimento.

| Coluna (DB) | Tipo | Mapeamento TS | Descrição |
|---|---|---|---|
| `id` | `text` PK | `id` | `T-{timestamp}` |
| `senha` | `text` | `senha` | Ticket: `A001` (agendado) ou `N001` (pronto atendimento) |
| `especie` | `text` | `especie` | `Cão`, `Gato` ou `Animais Silvestres` |
| `tipo_atendimento` | `text` | `tipoAtendimento` | Tipo de consulta |
| `prioridade` | `text` | `prioridade` | `Verde` (Geral), `Amarelo` (Preferencial), `Vermelho` (Emergência) |
| `status` | `text` | `status` | `Aguardando direcionamento`, `Chamado`, `Direcionado`, `Finalizado` |
| `local_direcionado` | `text` | `localDirecionado` | `Triagem`, `GUICHÊ 1`, `GUICHÊ 2` |
| `data_hora` | `timestamptz` | `dataHora` | Timestamp de criação |
| `called_at` | `timestamptz` | `calledAt` | Última chamada |
| `finalized_at` | `timestamptz` | `finalizedAt` | Finalização |
| `unidade` | `text` | `unidade` | Unidade (campus) |
| `patient_id` | `text` | `patientId` | Referência ao cadastro do paciente |

### `user_profiles` — Perfis de Usuário

Vinculado ao `auth.users` do Supabase.

| Coluna (DB) | Tipo | Mapeamento TS | Descrição |
|---|---|---|---|
| `id` | `text` PK | `id` | Mesmo UID do `auth.users` |
| `email` | `text` | `email` | Email do usuário |
| `unidade` | `text` | `unidade` | Unidade atribuída |
| `funcoes` | `text[]` | `funcoes` | Array de permissões |
| `role` | `text` | `role` | `admin`, `coordinator` ou `user` |
| `company_id` | `uuid` | `companyId` | Empresa vinculada |
| `unit_id` | `uuid` | `unitId` | Unidade vinculada |
| `force_password_change` | `boolean` | `forcePasswordChange` | Forçar troca de senha no próximo login |
| `atualizado_em` | `timestamptz` | `atualizadoEm` | Última atualização |

### `call_history` — Histórico de Chamadas

Registra cada vez que um paciente é chamado ou direcionado.

| Coluna (DB) | Tipo | Mapeamento TS | Descrição |
|---|---|---|---|
| `id` | `text` PK | `id` | `ch-{timestamp}-{random}` |
| `pet_id` | `text` | — | Referência a `pets.id` |
| `senha` | `text` | `senha` | Ticket |
| `local_direcionado` | `text` | `localDirecionado` | Local para onde foi chamado |
| `especie` | `text` | — | Espécie |
| `unidade` | `text` | — | Unidade |
| `called_at` | `timestamptz` | `calledAt` | Quando foi chamado |

### `tv_videos` — Playlist de Vídeos

Vídeos YouTube exibidos nos painéis TV.

| Coluna (DB) | Tipo | Mapeamento TS | Descrição |
|---|---|---|---|
| `id` | `text` PK | `id` | `tv-{timestamp}` |
| `youtube_url` | `text` | `youtubeUrl` | URL completa do YouTube |
| `ordem` | `integer` | `ordem` | Ordem na playlist |

### `video_metadata` — Metadados de Vídeo

Registro singleton do vídeo da recepção.

| Coluna (DB) | Tipo | Mapeamento TS | Descrição |
|---|---|---|---|
| `id` | `text` PK | `id` | Valor fixo: `reception_youtube_video` |
| `youtube_url` | `text` | `youtubeUrl` | URL do YouTube |
| `saved_at` | `timestamptz` | `savedAt` | Quando foi salvo |

---

## Row Level Security (RLS)

### Funções Auxiliares

```sql
-- Verifica se o usuário é admin
is_admin() RETURNS boolean
  → SELECT role = 'admin' FROM user_profiles WHERE id = auth.uid()::text

-- Verifica permissão específica
has_permission(perm text) RETURNS boolean
  → role = 'admin' OR role = 'coordinator' OR perm = ANY(funcoes)

-- Retorna a unidade do usuário
user_unidade() RETURNS text
  → SELECT unidade FROM user_profiles WHERE id = auth.uid()::text
```

### Políticas por Tabela

**`pets`**

| Operação | Permissão |
|---|---|
| INSERT | Qualquer autenticado |
| SELECT | Admin (tudo) | Mesma unidade | unidade vazia |
| UPDATE | Admin (tudo) | Mesma unidade | unidade vazia |
| DELETE | Admin only |

**`user_profiles`**

| Operação | Permissão |
|---|---|
| INSERT | Próprio UID ou admin |
| SELECT | Próprio perfil ou admin |
| UPDATE | Próprio perfil ou admin |
| DELETE | Admin only |

**`call_history`**

| Operação | Permissão |
|---|---|
| SELECT | Admin (tudo) | Mesma unidade |
| INSERT | Qualquer autenticado |
| DELETE | Admin only |

**`tv_videos` + `video_metadata`**

| Operação | Permissão |
|---|---|
| SELECT | Público (qualquer um, incluso anônimo) |
| INSERT/UPDATE/DELETE | Permissão `Videos` |

---

## Migrations

Os arquivos SQL na raiz do projeto:

| Arquivo | Descrição |
|---|---|
| `supabase-rls-policies.sql` | Criação das tabelas, funções auxiliares e todas as políticas RLS |
| `supabase-add-finalized-at.sql` | Adiciona coluna `finalized_at` na tabela `pets` |
| `supabase-cleanup-test-data.sql` | Limpeza de dados de teste |

Execute na ordem: RLS → finalized_at → (opcional) cleanup.
