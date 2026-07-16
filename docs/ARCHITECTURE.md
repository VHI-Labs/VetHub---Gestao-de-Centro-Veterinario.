# Arquitetura do VetHub

## Visão Geral

O VetHub é uma SPA (Single Page Application) React com backend Supabase, suportando múltiplas empresas e unidades. O fluxo de dados segue um padrão em camadas:

```
Telas (Pages)
    ↕
Componentes (Components)
    ↕
Hooks (Hooks)
    ↕
Store Zustand (queueStore)
    ↕
Core Engine (engine.ts)
    ↕
Supabase Client (lib/supabase.ts)
    ↕
Supabase (PostgreSQL + Auth + RLS)
```

## Hierarquia de Dados

```
Company (Empresa)
  ├── Unit (Unidade/Filial)
  │     ├── User (Usuário vinculado)
  │     ├── Patient (Paciente)
  │     ├── Owner (Tutor)
  │     └── ...demais entidades
  └── Company Dashboard (Métricas agregadas)
```

O sistema suporta **multi-tenant** com isolamento por empresa e unidade. O `companyId` e `unitId` são propagados via `AuthContext` e filtram todas as queries via RLS.

## Estrutura de Diretórios

```
src/
├── App.tsx                  ← Rotas + polling global 5s
├── main.tsx                 ← Entry point (BrowserRouter, AuthProvider)
├── components/              ← Componentes reutilizáveis
├── context/                 ← AuthContext (login, perfil, sessão, empresa/unidade)
├── core/                    ← Engine (CRUD), áudio, impressão
├── hooks/                   ← useStorageSync, useClock, useWaitTimer
├── lib/                     ← Clientes Supabase
├── pages/                   ← 1 arquivo por rota
├── store/                   ← Zustand queueStore
├── styles/                  ← CSS global + Tailwind
└── types/                   ← Interfaces TypeScript
```

## Fluxo de Dados

1. **Polling**: `App.tsx` executa `refresh()` a cada 5 segundos, atualizando todas as filas e histórico via engine.
2. **Eventos**: Quando um paciente é chamado/direcionado/finalizado, `updatePetStatus` dispara eventos `storage` e `storage-sync` para sincronizar abas.
3. **RLS**: Toda query passa pelas políticas Row Level Security do Supabase, garantindo que cada unidade veja apenas seus dados.
4. **Multi-tenant**: `AuthContext` fornece `companyId` e `unitId` que são usados em todas as queries para isolar dados por empresa/unidade.

## Padrão de Nomes

| Contexto | Padrão | Exemplo |
|---|---|---|
| Database | snake_case | `tipo_atendimento`, `data_hora` |
| TypeScript | camelCase | `tipoAtendimento`, `dataHora` |
| Arquivos | PascalCase (componentes) | `PetListRow.tsx` |
| Funções | camelCase | `updatePetStatus()` |

## Mapa de Rotas

```
App.tsx
├── BottomNavbar (navegação inferior)
├── Routes
│   ├── / → Landing.tsx (página pública)
│   ├── /login → Login.tsx
│   ├── /register → Register.tsx
│   ├── /reset-password → ResetPassword.tsx
│   ├── /selecionar-unidade → UnidadeSelection.tsx (autenticado)
│   ├── /recepcao → Recepcao.tsx (autenticado)
│   ├── /triagem → Triagem.tsx (público)
│   ├── /pronto-atendimento → ProntoAtendimento.tsx (autenticado)
│   ├── /painel-caes → PainelCaes.tsx (público)
│   ├── /painel-gatos → PainelGatos.tsx (público)
│   ├── /selecionar-tv → TvSelection.tsx (autenticado)
│   ├── /prontuario → Prontuario.tsx (autenticado)
│   ├── /prontuario/tutor/:id → TutorDetail.tsx
│   ├── /prontuario/paciente/:id → PacienteDetail.tsx
│   ├── /agendamentos → Agendamentos.tsx (autenticado)
│   ├── /veterinarios → Veterinarios.tsx (paywall)
│   ├── /estoque → Estoque.tsx (paywall)
│   ├── /financeiro → Financeiro.tsx (paywall)
│   ├── /financeiro/servicos → Servicos.tsx (paywall)
│   ├── /trocar-senha → ForcePasswordChange.tsx (autenticado)
│   ├── /admin → CompanySelection.tsx (admin)
│   ├── /admin/legacy → AdminPage.tsx (admin)
│   ├── /admin/empresa/:companyId → CompanyDashboard.tsx (admin)
│   ├── /admin/empresa/:companyId/unidades → UnitManagement.tsx (admin)
│   ├── /admin/empresa/:companyId/unidade/:unitId → CompanyUsers.tsx (admin)
│   ├── /admin/empresa/:companyId/usuarios → CompanyUsers.tsx (admin)
│   ├── /admin/empresa/:companyId/auditoria → AuditLog.tsx (admin)
│   └── /admin/auditoria → AuditLog.tsx (admin)
└── Footer (oculto em login, triagem, painéis TV, trocar-senha)
```

## Sincronização entre Abas

Quando um usuário realiza uma ação em uma aba, outras abas (ex: painéis TV) precisam refletir a mudança:

1. `updatePetStatus()` chama `localStorage.setItem('vethub_last_update', timestamp)`
2. O navegador dispara o evento nativo `storage` em todas as outras abas
3. `useStorageSync()` captura o evento e chama `refresh()`
4. A store recarrega todos os dados do Supabase

## Constantes Importantes

| Constante | Valor | Descrição |
|---|---|---|
| `CALL_DISPLAY_MS` | 10000 | Duração da chamada ativa no painel TV |
| `PLAYLIST_INTERVAL_MS` | 30000 | Rotação de vídeos YouTube no painel |
| Polling | 5000ms | Intervalo de refresh automático |
