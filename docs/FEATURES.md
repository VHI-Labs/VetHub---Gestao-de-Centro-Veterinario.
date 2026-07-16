# Funcionalidades

## Gerenciamento de Fila

### Fluxo Completo

```
Triagem (público)
  → Tutor preenche dados no kiosk
  → Gera senha A001 (agendado) ou N001 (pronto atendimento)
  → Pet entra na fila com status "Aguardando direcionamento"
  
Recepção (atendente)
  → Visualiza fila de agendados (prefixo A)
  → Chama paciente (delay 3s)
  → Direciona para: GUICHÊ 1, GUICHÊ 2 ou Triagem
  → Paciente vai para sidebar "Chamados"
  
Pronto Atendimento (atendente)
  → Visualiza fila de emergência (prefixo N)
  → Mesmo fluxo: chamar → direcionar → concluir
  
Finalização (qualquer atendente)
  → Na sidebar, click "✓ Concluir"
  → Status vira "Finalizado"
  → Paciente sai da fila
  → Aparece no histórico
```

### Status dos Pacientes

| Status | Significado | Aparece em |
|---|---|---|
| `Aguardando direcionamento` | Aguardando na fila | Lista principal |
| `Chamado` | Chamado para atendimento | Sidebar "Chamados" |
| `Direcionado` | Direcionado a um guichê | Sidebar "Chamados" |
| `Finalizado` | Atendimento concluído | Histórico / Relatórios |

### Botões por Paciente

| Botão | Ação | Delay |
|---|---|---|
| 📣 Chamar | `status → "Chamado"` | 3s |
| ⬆️ Direcionar | `status → "Direcionado"` | Imediato |
| ✓ Concluir | `status → "Finalizado"` | Imediato |
| 📣 Rechamar | `status → "Chamado"` (novamente) | 3s |

---

## Triagem (Kiosk de Autoatendimento)

Rota: `/triagem` (pública, sem login necessário)

Fluxo simplificado em 3 etapas:

1. **Selecionar espécie**: Cão, Gato ou Animais Silvestres
2. **Tipo de atendimento**: Pronto Atendimento, Consulta Marcada, Cirurgia Agendada, Exames
3. **Já é paciente?**: Sim ou Não — geração imediata da senha (sem formulários)
4. **Senha gerada**: Exibe o ticket com opção de imprimir

O sistema não coleta dados do tutor ou pet na triagem — a senha é gerada de forma ágil com base apenas na espécie e tipo de atendimento.

Auto-reset após 15 segundos de inatividade.

**Parâmetro de URL**: `/triagem?campus=Mooca` seleciona o campus automaticamente.

---

## Painéis TV

### Telas

- `/painel-caes` — Cães
- `/painel-gatos` — Gatos + Animais Silvestres (mesclados, ordenados por chamada mais recente)

### Layout (TvPanelLayout)

```
┌──────────────────────────────────────┐
│          CHAMADA ATIVA               │  ← 10s com animação shimmer
│          "Senha A001"                │
│          "GUICHÊ 1"                  │
├───────────────────────┬──────────────┤
│                       │  Histórico   │
│   Vídeo YouTube       │  de Chamadas │
│   (30s rotação)       │  (últimos 6) │
│                       │              │
└───────────────────────┴──────────────┘
```

### Áudio

- **Gongo**: duas notas (frequências 523Hz + 659Hz) via Web Audio API
- **Voz**: sintetizador em português: *"Senha {número}. Comparecer ao {local}."*
- **Unlock**: banner solicitando interação do usuário se o autoplay for bloqueado

### Vídeos

Playlist de vídeos YouTube gerenciada via `VideoManager` (abas laterais). Rotação automática a cada 30 segundos.

---

## Dashboard e Relatórios

### Dashboard (Aba "Visão Geral")

Cards com métricas:
- Total de pacientes (ativos + histórico)
- Por espécie (Cães, Gatos, Silvestres)
- Tempo médio de espera por espécie (da criação à chamada)

### Relatório Mensal

Modal acessado pelo botão "Relatório" no Dashboard. Gera estatísticas por espécie para o mês selecionado:

- **Total de pacientes** no período
- **Tempo médio de espera** (cadastro → chamada)
- **Finalizados** no período
- **Tempo médio de atendimento** (cadastro → finalização)

---

## Impressão

### Senha de Triagem

Após o cadastro no kiosk, o tutor pode imprimir a senha com espécie, tipo de atendimento e timestamp.

### Formulários

`core/print.ts` gera formulários de prescrição e encaminhamento para impressão, com dados completos do paciente.

---

## Vídeos (Recepção)

Na aba "Vídeos" (presente em Recepção e Pronto Atendimento):

- Adicionar vídeos YouTube à playlist
- Remover vídeos da playlist
- Ordenar por ordem de exibição
- Controle de áudio (mute/unmute)

Apenas usuários com permissão `Videos` podem gerenciar.

---

## Admin — Gestão Multi-Empresa

Rota: `/admin` (admin only)

### Seleção de Empresa (`CompanySelection.tsx`)

- Lista todas as empresas cadastradas com estatísticas (unidades, usuários)
- **Criar empresa**: nome, slug, logo, capa
- **Editar empresa**: alterar dados cadastrais
- **Excluir empresa**: com confirmação
- Busca por nome de empresa

### Dashboard da Empresa (`CompanyDashboard.tsx`)

Rota: `/admin/empresa/:companyId`

Cards de métricas agregadas:
- Usuários, Unidades, Pacientes, Tutores
- Consultas, Vacinas, Cirurgias, Agendamentos
- Veterinários, Medicamentos, Faturas
- Faturas abertas, Receita total

Lista de unidades com contadores de usuários, pacientes e consultas.

### Gestão de Unidades (`UnitManagement.tsx`)

Rota: `/admin/empresa/:companyId/unidades`

- **Listar unidades** da empresa
- **Criar unidade**: nome, slug, endereço, telefone
- **Editar unidade**: alterar dados
- **Excluir unidade**: com confirmação
- Acessar gestão de usuários da unidade

### Gestão de Usuários (`CompanyUsers.tsx`)

Rota: `/admin/empresa/:companyId/unidade/:unitId` ou `/admin/empresa/:companyId/usuarios`

- **Listar usuários** da empresa com filtro por role e busca
- **Criar usuário**: email + senha (envio automático)
- **Alterar role**: admin → coordinator → user (cíclico)
- **Atribuir unidade**: selecionar unidade para cada usuário
- **Permissões**: checkboxes individuais para `funcoes`
- **Resetar senha**: envio de email de reset
- **Excluir usuário**: com confirmação
- **Sincronizar**: botão para criar perfis faltantes no `user_profiles`
- Atualização automática a cada 10 segundos

### Forçar Troca de Senha (`ForcePasswordChange.tsx`)

Rota: `/trocar-senha`

- Fluxo obrigatório para usuários com `force_password_change = true`
- Validação de senha (mínimo 6 caracteres)
- Confirmação de senha
- Após troca, redireciona para `/recepcao`

### Auditoria (`AuditLog.tsx`)

Rota: `/admin/empresa/:companyId/auditoria` ou `/admin/auditoria`

- Log de ações administrativas
- Filtrável por empresa
