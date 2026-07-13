-- ============================================================
-- HOVET - Migration: Veterinários, Estoque, Financeiro
-- Execute no painel do Supabase > SQL Editor
-- ============================================================

-- ============================================================
-- TABLE: veterinarios
-- ============================================================
CREATE TABLE IF NOT EXISTS public.veterinarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  crmv TEXT,
  especialidade TEXT,
  telefone TEXT,
  email TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  unidade TEXT DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: medicamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.medicamentos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  principio_ativo TEXT,
  fabricante TEXT,
  forma_farmaceutica TEXT,
  concentracao TEXT,
  unidade_medida TEXT,
  preco_custo NUMERIC,
  preco_venda NUMERIC,
  estoque_minimo INTEGER DEFAULT 0,
  estoque_atual INTEGER DEFAULT 0,
  validade DATE,
  unidade TEXT DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: estoque_movimentacoes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.estoque_movimentacoes (
  id TEXT PRIMARY KEY,
  medicamento_id TEXT NOT NULL REFERENCES public.medicamentos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  motivo TEXT,
  consulta_id TEXT REFERENCES public.consultas(id) ON DELETE SET NULL,
  paciente_id TEXT REFERENCES public.patients(id) ON DELETE SET NULL,
  veterinario_id TEXT REFERENCES public.veterinarios(id) ON DELETE SET NULL,
  usuario_id TEXT,
  unidade TEXT DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: servicos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.servicos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  preco NUMERIC NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  unidade TEXT DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: faturas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.faturas (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  owner_id TEXT REFERENCES public.owners(id) ON DELETE SET NULL,
  consulta_id TEXT REFERENCES public.consultas(id) ON DELETE SET NULL,
  cirurgia_id TEXT REFERENCES public.cirurgias(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Aberta',
  valor_total NUMERIC NOT NULL DEFAULT 0,
  valor_pago NUMERIC NOT NULL DEFAULT 0,
  desconto NUMERIC DEFAULT 0,
  observacoes TEXT,
  unidade TEXT DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: fatura_itens
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fatura_itens (
  id TEXT PRIMARY KEY,
  fatura_id TEXT NOT NULL REFERENCES public.faturas(id) ON DELETE CASCADE,
  servico_id TEXT REFERENCES public.servicos(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: pagamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id TEXT PRIMARY KEY,
  fatura_id TEXT NOT NULL REFERENCES public.faturas(id) ON DELETE CASCADE,
  valor NUMERIC NOT NULL,
  metodo TEXT NOT NULL,
  data_pagamento TIMESTAMPTZ NOT NULL DEFAULT now(),
  referencia TEXT,
  usuario_id TEXT,
  unidade TEXT DEFAULT '',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_veterinarios_nome ON veterinarios(nome);
CREATE INDEX IF NOT EXISTS idx_veterinarios_unidade ON veterinarios(unidade);
CREATE INDEX IF NOT EXISTS idx_medicamentos_nome ON medicamentos(nome);
CREATE INDEX IF NOT EXISTS idx_medicamentos_unidade ON medicamentos(unidade);
CREATE INDEX IF NOT EXISTS idx_estoque_movimentacoes_medicamento_id ON estoque_movimentacoes(medicamento_id);
CREATE INDEX IF NOT EXISTS idx_estoque_movimentacoes_criado_em ON estoque_movimentacoes(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_faturas_paciente_id ON faturas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas(status);
CREATE INDEX IF NOT EXISTS idx_faturas_unidade ON faturas(unidade);
CREATE INDEX IF NOT EXISTS idx_faturas_criado_em ON faturas(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_fatura_itens_fatura_id ON fatura_itens(fatura_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_fatura_id ON pagamentos(fatura_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_criado_em ON pagamentos(criado_em DESC);

-- ============================================================
-- RLS: veterinarios
-- ============================================================
ALTER TABLE public.veterinarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "veterinarios_insert_authenticated" ON public.veterinarios;
CREATE POLICY "veterinarios_insert_authenticated" ON public.veterinarios
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "veterinarios_select_authenticated" ON public.veterinarios;
CREATE POLICY "veterinarios_select_authenticated" ON public.veterinarios
  FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "veterinarios_update_authenticated" ON public.veterinarios;
CREATE POLICY "veterinarios_update_authenticated" ON public.veterinarios
  FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "veterinarios_delete_admin" ON public.veterinarios;
CREATE POLICY "veterinarios_delete_admin" ON public.veterinarios
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- RLS: medicamentos
-- ============================================================
ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "medicamentos_insert_authenticated" ON public.medicamentos;
CREATE POLICY "medicamentos_insert_authenticated" ON public.medicamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "medicamentos_select_authenticated" ON public.medicamentos;
CREATE POLICY "medicamentos_select_authenticated" ON public.medicamentos
  FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "medicamentos_update_authenticated" ON public.medicamentos;
CREATE POLICY "medicamentos_update_authenticated" ON public.medicamentos
  FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "medicamentos_delete_admin" ON public.medicamentos;
CREATE POLICY "medicamentos_delete_admin" ON public.medicamentos
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- RLS: estoque_movimentacoes
-- ============================================================
ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "estoque_movimentacoes_insert_authenticated" ON public.estoque_movimentacoes;
CREATE POLICY "estoque_movimentacoes_insert_authenticated" ON public.estoque_movimentacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "estoque_movimentacoes_select_authenticated" ON public.estoque_movimentacoes;
CREATE POLICY "estoque_movimentacoes_select_authenticated" ON public.estoque_movimentacoes
  FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "estoque_movimentacoes_update_authenticated" ON public.estoque_movimentacoes;
CREATE POLICY "estoque_movimentacoes_update_authenticated" ON public.estoque_movimentacoes
  FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "estoque_movimentacoes_delete_admin" ON public.estoque_movimentacoes;
CREATE POLICY "estoque_movimentacoes_delete_admin" ON public.estoque_movimentacoes
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- RLS: servicos
-- ============================================================
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "servicos_insert_authenticated" ON public.servicos;
CREATE POLICY "servicos_insert_authenticated" ON public.servicos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "servicos_select_authenticated" ON public.servicos;
CREATE POLICY "servicos_select_authenticated" ON public.servicos
  FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "servicos_update_authenticated" ON public.servicos;
CREATE POLICY "servicos_update_authenticated" ON public.servicos
  FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "servicos_delete_admin" ON public.servicos;
CREATE POLICY "servicos_delete_admin" ON public.servicos
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- RLS: faturas
-- ============================================================
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "faturas_insert_authenticated" ON public.faturas;
CREATE POLICY "faturas_insert_authenticated" ON public.faturas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "faturas_select_authenticated" ON public.faturas;
CREATE POLICY "faturas_select_authenticated" ON public.faturas
  FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "faturas_update_authenticated" ON public.faturas;
CREATE POLICY "faturas_update_authenticated" ON public.faturas
  FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "faturas_delete_admin" ON public.faturas;
CREATE POLICY "faturas_delete_admin" ON public.faturas
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- RLS: fatura_itens
-- ============================================================
ALTER TABLE public.fatura_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fatura_itens_insert_authenticated" ON public.fatura_itens;
CREATE POLICY "fatura_itens_insert_authenticated" ON public.fatura_itens
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "fatura_itens_select_authenticated" ON public.fatura_itens;
CREATE POLICY "fatura_itens_select_authenticated" ON public.fatura_itens
  FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "fatura_itens_update_authenticated" ON public.fatura_itens;
CREATE POLICY "fatura_itens_update_authenticated" ON public.fatura_itens
  FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "fatura_itens_delete_admin" ON public.fatura_itens;
CREATE POLICY "fatura_itens_delete_admin" ON public.fatura_itens
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- RLS: pagamentos
-- ============================================================
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pagamentos_insert_authenticated" ON public.pagamentos;
CREATE POLICY "pagamentos_insert_authenticated" ON public.pagamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "pagamentos_select_authenticated" ON public.pagamentos;
CREATE POLICY "pagamentos_select_authenticated" ON public.pagamentos
  FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "pagamentos_update_authenticated" ON public.pagamentos;
CREATE POLICY "pagamentos_update_authenticated" ON public.pagamentos
  FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR unidade = ''
    OR unidade = user_unidade()
  );

DROP POLICY IF EXISTS "pagamentos_delete_admin" ON public.pagamentos;
CREATE POLICY "pagamentos_delete_admin" ON public.pagamentos
  FOR DELETE
  TO authenticated
  USING (is_admin());
