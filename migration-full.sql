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
