-- ============================================================
-- HOVET - Full Database Migration
-- Execute no painel do Supabase > SQL Editor
-- ============================================================

-- 1. TABELAS
-- ============================================================

-- Pacientes / Fila de atendimento
CREATE TABLE IF NOT EXISTS public.pets (
  id TEXT PRIMARY KEY,
  senha TEXT NOT NULL,
  especie TEXT NOT NULL,
  tipo_atendimento TEXT NOT NULL,
  prioridade TEXT NOT NULL DEFAULT 'Verde',
  status TEXT NOT NULL DEFAULT 'Aguardando direcionamento',
  local_direcionado TEXT DEFAULT '',
  data_hora TIMESTAMPTZ NOT NULL DEFAULT now(),
  called_at TIMESTAMPTZ,
  finalized_at TIMESTAMPTZ,
  unidade TEXT DEFAULT ''
);

-- Perfis de usuário (vinculado ao auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  unidade TEXT NOT NULL DEFAULT '',
  funcoes TEXT[] DEFAULT '{}',
  role TEXT DEFAULT 'user',
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Histórico de chamadas
CREATE TABLE IF NOT EXISTS public.call_history (
  id TEXT PRIMARY KEY,
  pet_id TEXT,
  senha TEXT NOT NULL,
  local_direcionado TEXT DEFAULT '',
  especie TEXT NOT NULL,
  unidade TEXT DEFAULT '',
  called_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Playlist de vídeos dos painéis TV
CREATE TABLE IF NOT EXISTS public.tv_videos (
  id TEXT PRIMARY KEY,
  youtube_url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  is_short BOOLEAN DEFAULT false
);

-- Metadados do vídeo da recepção
CREATE TABLE IF NOT EXISTS public.video_metadata (
  id TEXT PRIMARY KEY,
  youtube_url TEXT NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT now()
);

-- 2. FUNÇÕES AUXILIARES
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()::text AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(perm TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()::text AND (role = 'admin' OR role = 'coordinator' OR perm = ANY(funcoes))
  );
$$;

CREATE OR REPLACE FUNCTION public.user_unidade()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT unidade FROM public.user_profiles WHERE id = auth.uid()::text;
$$;

-- 3. ROW LEVEL SECURITY
-- ============================================================

-- TABLE: pets
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pets_insert_authenticated" ON public.pets;
CREATE POLICY "pets_insert_authenticated" ON public.pets
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "pets_select_authenticated" ON public.pets;
CREATE POLICY "pets_select_authenticated" ON public.pets
  FOR SELECT TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "pets_update_authenticated" ON public.pets;
CREATE POLICY "pets_update_authenticated" ON public.pets
  FOR UPDATE TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "pets_delete_admin" ON public.pets;
CREATE POLICY "pets_delete_admin" ON public.pets
  FOR DELETE TO authenticated
  USING (is_admin());

-- TABLE: user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid()::text OR is_admin());

DROP POLICY IF EXISTS "user_profiles_select_own_or_admin" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own_or_admin" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid()::text OR is_admin());

DROP POLICY IF EXISTS "user_profiles_update_own_or_admin" ON public.user_profiles;
CREATE POLICY "user_profiles_update_own_or_admin" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid()::text OR is_admin())
  WITH CHECK (id = auth.uid()::text OR is_admin());

DROP POLICY IF EXISTS "user_profiles_delete_admin" ON public.user_profiles;
CREATE POLICY "user_profiles_delete_admin" ON public.user_profiles
  FOR DELETE TO authenticated
  USING (is_admin());

-- TABLE: call_history
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "call_history_select_authenticated" ON public.call_history;
CREATE POLICY "call_history_select_authenticated" ON public.call_history
  FOR SELECT TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "call_history_insert_authenticated" ON public.call_history;
CREATE POLICY "call_history_insert_authenticated" ON public.call_history
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "call_history_delete_admin" ON public.call_history;
CREATE POLICY "call_history_delete_admin" ON public.call_history
  FOR DELETE TO authenticated
  USING (is_admin());

-- TABLE: tv_videos
ALTER TABLE public.tv_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tv_videos_select_public" ON public.tv_videos;
CREATE POLICY "tv_videos_select_public" ON public.tv_videos
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "tv_videos_insert_admin_or_videos" ON public.tv_videos;
CREATE POLICY "tv_videos_insert_admin_or_videos" ON public.tv_videos
  FOR INSERT TO authenticated
  WITH CHECK (has_permission('Videos'));

DROP POLICY IF EXISTS "tv_videos_update_admin_or_videos" ON public.tv_videos;
CREATE POLICY "tv_videos_update_admin_or_videos" ON public.tv_videos
  FOR UPDATE TO authenticated
  USING (has_permission('Videos'));

DROP POLICY IF EXISTS "tv_videos_delete_admin_or_videos" ON public.tv_videos;
CREATE POLICY "tv_videos_delete_admin_or_videos" ON public.tv_videos
  FOR DELETE TO authenticated
  USING (has_permission('Videos'));

-- TABLE: video_metadata
ALTER TABLE public.video_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "video_metadata_select_public" ON public.video_metadata;
CREATE POLICY "video_metadata_select_public" ON public.video_metadata
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "video_metadata_insert_admin_or_videos" ON public.video_metadata;
CREATE POLICY "video_metadata_insert_admin_or_videos" ON public.video_metadata
  FOR INSERT TO authenticated
  WITH CHECK (has_permission('Videos'));

DROP POLICY IF EXISTS "video_metadata_update_admin_or_videos" ON public.video_metadata;
CREATE POLICY "video_metadata_update_admin_or_videos" ON public.video_metadata
  FOR UPDATE TO authenticated
  USING (has_permission('Videos'));

DROP POLICY IF EXISTS "video_metadata_delete_admin_or_videos" ON public.video_metadata;
CREATE POLICY "video_metadata_delete_admin_or_videos" ON public.video_metadata
  FOR DELETE TO authenticated
  USING (has_permission('Videos'));

-- 4. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_pets_especie_status ON pets(especie, status);
CREATE INDEX IF NOT EXISTS idx_pets_senha ON pets(senha);
CREATE INDEX IF NOT EXISTS idx_call_history_especie_called_at ON call_history(especie, called_at DESC);

-- 5. TABELAS DO PRONTUÁRIO ELETRÔNICO
-- ============================================================

-- Owners / Tutores
CREATE TABLE IF NOT EXISTS public.owners (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  unidade TEXT DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Patients / Pacientes
CREATE TABLE IF NOT EXISTS public.patients (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES public.owners(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  especie TEXT NOT NULL,
  raca TEXT,
  sexo TEXT,
  pelagem TEXT,
  peso NUMERIC,
  idade TEXT,
  microchip TEXT,
  alergias TEXT,
  foto_url TEXT,
  observacoes TEXT,
  unidade TEXT DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consultas
CREATE TABLE IF NOT EXISTS public.consultas (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  pet_id TEXT REFERENCES public.pets(id) ON DELETE SET NULL,
  veterinario TEXT NOT NULL,
  motivo TEXT NOT NULL,
  exame_fisico TEXT,
  diagnostico TEXT,
  prescricao TEXT,
  observacoes TEXT,
  unidade TEXT DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vacinas
CREATE TABLE IF NOT EXISTS public.vacinas (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data_aplicacao DATE NOT NULL,
  data_proxima DATE,
  lote TEXT,
  veterinario TEXT,
  unidade TEXT DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cirurgias
CREATE TABLE IF NOT EXISTS public.cirurgias (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  data_cirurgia TIMESTAMPTZ NOT NULL,
  veterinario TEXT,
  observacoes TEXT,
  unidade TEXT DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exames
CREATE TABLE IF NOT EXISTS public.exames (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  tipo_exame TEXT NOT NULL,
  resultado TEXT,
  arquivo_url TEXT,
  data_exame DATE NOT NULL,
  veterinario TEXT,
  unidade TEXT DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  owner_id TEXT REFERENCES public.owners(id) ON DELETE SET NULL,
  data_hora TIMESTAMPTZ NOT NULL,
  tipo TEXT NOT NULL,
  veterinario TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente',
  observacoes TEXT,
  unidade TEXT DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar patient_id na tabela pets (opcional, para vinculo com prontuário)
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS patient_id TEXT REFERENCES public.patients(id) ON DELETE SET NULL;

-- 6. RLS — NOVAS TABELAS
-- ============================================================

-- TABLE: owners
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners_insert_authenticated" ON public.owners;
CREATE POLICY "owners_insert_authenticated" ON public.owners
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "owners_select_authenticated" ON public.owners;
CREATE POLICY "owners_select_authenticated" ON public.owners
  FOR SELECT TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "owners_update_authenticated" ON public.owners;
CREATE POLICY "owners_update_authenticated" ON public.owners
  FOR UPDATE TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "owners_delete_admin" ON public.owners;
CREATE POLICY "owners_delete_admin" ON public.owners
  FOR DELETE TO authenticated
  USING (is_admin());

-- TABLE: patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_insert_authenticated" ON public.patients;
CREATE POLICY "patients_insert_authenticated" ON public.patients
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "patients_select_authenticated" ON public.patients;
CREATE POLICY "patients_select_authenticated" ON public.patients
  FOR SELECT TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "patients_update_authenticated" ON public.patients;
CREATE POLICY "patients_update_authenticated" ON public.patients
  FOR UPDATE TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "patients_delete_admin" ON public.patients;
CREATE POLICY "patients_delete_admin" ON public.patients
  FOR DELETE TO authenticated
  USING (is_admin());

-- TABLE: consultas
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consultas_insert_authenticated" ON public.consultas;
CREATE POLICY "consultas_insert_authenticated" ON public.consultas
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "consultas_select_authenticated" ON public.consultas;
CREATE POLICY "consultas_select_authenticated" ON public.consultas
  FOR SELECT TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "consultas_update_authenticated" ON public.consultas;
CREATE POLICY "consultas_update_authenticated" ON public.consultas
  FOR UPDATE TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "consultas_delete_admin" ON public.consultas;
CREATE POLICY "consultas_delete_admin" ON public.consultas
  FOR DELETE TO authenticated
  USING (is_admin());

-- TABLE: vacinas
ALTER TABLE public.vacinas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vacinas_insert_authenticated" ON public.vacinas;
CREATE POLICY "vacinas_insert_authenticated" ON public.vacinas
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "vacinas_select_authenticated" ON public.vacinas;
CREATE POLICY "vacinas_select_authenticated" ON public.vacinas
  FOR SELECT TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "vacinas_update_authenticated" ON public.vacinas;
CREATE POLICY "vacinas_update_authenticated" ON public.vacinas
  FOR UPDATE TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "vacinas_delete_admin" ON public.vacinas;
CREATE POLICY "vacinas_delete_admin" ON public.vacinas
  FOR DELETE TO authenticated
  USING (is_admin());

-- TABLE: cirurgias
ALTER TABLE public.cirurgias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cirurgias_insert_authenticated" ON public.cirurgias;
CREATE POLICY "cirurgias_insert_authenticated" ON public.cirurgias
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cirurgias_select_authenticated" ON public.cirurgias;
CREATE POLICY "cirurgias_select_authenticated" ON public.cirurgias
  FOR SELECT TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "cirurgias_update_authenticated" ON public.cirurgias;
CREATE POLICY "cirurgias_update_authenticated" ON public.cirurgias
  FOR UPDATE TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "cirurgias_delete_admin" ON public.cirurgias;
CREATE POLICY "cirurgias_delete_admin" ON public.cirurgias
  FOR DELETE TO authenticated
  USING (is_admin());

-- TABLE: exames
ALTER TABLE public.exames ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exames_insert_authenticated" ON public.exames;
CREATE POLICY "exames_insert_authenticated" ON public.exames
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "exames_select_authenticated" ON public.exames;
CREATE POLICY "exames_select_authenticated" ON public.exames
  FOR SELECT TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "exames_update_authenticated" ON public.exames;
CREATE POLICY "exames_update_authenticated" ON public.exames
  FOR UPDATE TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "exames_delete_admin" ON public.exames;
CREATE POLICY "exames_delete_admin" ON public.exames
  FOR DELETE TO authenticated
  USING (is_admin());

-- TABLE: agendamentos
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agendamentos_insert_authenticated" ON public.agendamentos;
CREATE POLICY "agendamentos_insert_authenticated" ON public.agendamentos
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "agendamentos_select_authenticated" ON public.agendamentos;
CREATE POLICY "agendamentos_select_authenticated" ON public.agendamentos
  FOR SELECT TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "agendamentos_update_authenticated" ON public.agendamentos;
CREATE POLICY "agendamentos_update_authenticated" ON public.agendamentos
  FOR UPDATE TO authenticated
  USING (is_admin() OR unidade = '' OR unidade = user_unidade());

DROP POLICY IF EXISTS "agendamentos_delete_admin" ON public.agendamentos;
CREATE POLICY "agendamentos_delete_admin" ON public.agendamentos
  FOR DELETE TO authenticated
  USING (is_admin());

-- 7. ÍNDICES — NOVAS TABELAS
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_owners_nome ON owners(nome);
CREATE INDEX IF NOT EXISTS idx_owners_cpf ON owners(cpf);
CREATE INDEX IF NOT EXISTS idx_owners_unidade ON owners(unidade);
CREATE INDEX IF NOT EXISTS idx_patients_nome ON patients(nome);
CREATE INDEX IF NOT EXISTS idx_patients_owner_id ON patients(owner_id);
CREATE INDEX IF NOT EXISTS idx_patients_unidade ON patients(unidade);
CREATE INDEX IF NOT EXISTS idx_consultas_patient_id ON consultas(patient_id);
CREATE INDEX IF NOT EXISTS idx_vacinas_patient_id ON vacinas(patient_id);
CREATE INDEX IF NOT EXISTS idx_cirurgias_patient_id ON cirurgias(patient_id);
CREATE INDEX IF NOT EXISTS idx_exames_patient_id ON exames(patient_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_patient_id ON agendamentos(patient_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_unidade ON agendamentos(unidade);

-- 8. AUDIT LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id TEXT PRIMARY KEY,
  tabela TEXT NOT NULL,
  acao TEXT NOT NULL,
  registro_id TEXT NOT NULL,
  usuario_id TEXT,
  usuario_email TEXT,
  dados_anteriores JSONB,
  dados_novos JSONB,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_insert_authenticated" ON public.audit_log;
CREATE POLICY "audit_log_insert_authenticated" ON public.audit_log
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "audit_log_select_admin_only" ON public.audit_log;
CREATE POLICY "audit_log_select_admin_only" ON public.audit_log
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_audit_log_tabela ON audit_log(tabela);
CREATE INDEX IF NOT EXISTS idx_audit_log_criado_em ON audit_log(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_registro_id ON audit_log(registro_id);
