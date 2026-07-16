# Setup do Projeto

## Pré-requisitos

- Node.js 18+
- npm 9+
- Conta no [Supabase](https://supabase.com) (projeto criado)
- Editor: VS Code (recomendado)

## Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd VetHub

# Instalar dependências
npm install

# Iniciar em modo dev
npm run dev

# Build de produção
npm run build
```

## Configuração do Supabase

### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Anote a **Project URL** e a **anon public key** (Settings > API)

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

> O `.env` já está no `.gitignore` — não commite chaves reais.

### 3. Executar Migrations

No SQL Editor do Supabase, execute nesta ordem:

**a) `supabase-rls-policies.sql`** — Cria:
- Tabelas (`companies`, `units`, `pets`, `user_profiles`, `call_history`, `tv_videos`, `video_metadata`)
- Funções auxiliares (`is_admin()`, `has_permission()`, `user_unidade()`)
- Políticas RLS para todas as tabelas
- Índices e constraints

**b) `supabase-add-finalized-at.sql`** — Adiciona coluna `finalized_at` na tabela `pets`:

```sql
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;
```

**c) Adicionar colunas de empresa/unidade no `user_profiles`** (se não existirem):

```sql
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.units(id);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false;
```

**d) Criar tabela `companies` e `units`** (se não existirem):

```sql
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  cover_url TEXT,
  settings JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  address TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**e) Recarregar schema do PostgREST** (se necessário):

```sql
NOTIFY pgrst, 'reload schema';
```

### 4. Configurar Autenticação

No dashboard do Supabase:
1. **Authentication > Settings**: habilite email/password sign-in
2. **Authentication > Users**: crie o primeiro usuário manualmente
3. Execute o SQL abaixo para definir o primeiro usuário como admin:

```sql
UPDATE public.user_profiles SET role = 'admin' WHERE email = 'email-do-primeiro-usuario';
```

### 5. Configurar URL do Projeto

No Supabase: **Authentication > URL Configuration** — adicione a URL do seu frontend (ex: `http://localhost:5173` em dev, ou a URL de produção).

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento (porta 5173) |
| `npm run build` | Compila TypeScript + build Vite para produção |
| `npm run preview` | Serve o build localmente para teste |
| `npm run lint` | Executa typecheck + ESLint no projeto |
| `npm run test` | Roda testes em modo watch |
| `npm run test:run` | Roda testes uma vez |
| `npm run test:coverage` | Roda testes com cobertura |

## Estrutura do .env

```env
# Obrigatórios (Supabase)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> Apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` são necessários para o funcionamento.
