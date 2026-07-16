# Autenticação e Rotas

## Tecnologia

Autenticação via **Supabase Auth** (email/senha). Sessão gerenciada pelo `AuthContext` (`src/context/AuthContext.tsx`).

## Fluxo de Login

```
Usuário → Login.tsx
  → signIn(email, password)
    → supabase.auth.signInWithPassword()
  → onAuthStateChange detecta sessão
  → ensureProfile(): cria user_profiles se não existir
  → fetchProfile(): carrega role, unidade, funcoes, companyId, unitId
  → Redireciona:
      forcePasswordChange → /trocar-senha
      role === "admin" → /admin (seleção de empresa)
      senão, unidade salva → /recepcao
      senão → /selecionar-unidade
```

### Primeiro Usuário

O primeiro usuário a fazer login recebe `role = 'admin'` automaticamente. Usuários subsequentes recebem `role = 'user'`.

### Forçar Troca de Senha

Quando `force_password_change = true` no `user_profiles`, o usuário é redirecionado para `/trocar-senha` antes de acessar qualquer outra rota. Após a troca, o flag é desativado.

## Rotas

| Rota | Página | Proteção | Descrição |
|---|---|---|---|
| `/` | Landing | Pública | Landing page pública |
| `/login` | Login | Pública | Tela de login |
| `/register` | Register | Pública | Cadastro de novo usuário |
| `/reset-password` | ResetPassword | Pública | Recuperação de senha |
| `/selecionar-unidade` | UnidadeSelection | Autenticado | Escolha de unidade |
| `/recepcao` | Recepcao | Autenticado | Fila de agendados |
| `/pronto-atendimento` | ProntoAtendimento | Autenticado | Fila de emergência |
| `/triagem` | Triagem | **Pública** | Kiosk de autoatendimento |
| `/painel-caes` | PainelCaes | **Pública** | Painel TV cães |
| `/painel-gatos` | PainelGatos | **Pública** | Painel TV gatos |
| `/selecionar-tv` | TvSelection | Autenticado | Seletor de canal TV |
| `/prontuario` | Prontuario | Autenticado | Prontuários |
| `/prontuario/tutor/:id` | TutorDetail | Autenticado | Detalhe do tutor |
| `/prontuario/paciente/:id` | PacienteDetail | Autenticado | Detalhe do paciente |
| `/agendamentos` | Agendamentos | Autenticado | Agendamentos |
| `/veterinarios` | Veterinarios | Paywall | Veterinários |
| `/estoque` | Estoque | Paywall | Estoque de medicamentos |
| `/financeiro` | Financeiro | Paywall | Financeiro |
| `/financeiro/servicos` | Servicos | Paywall | Cadastro de serviços |
| `/trocar-senha` | ForcePasswordChange | Autenticado | Troca obrigatória de senha |
| `/admin` | CompanySelection | Admin | Seleção de empresa |
| `/admin/legacy` | AdminPage | Admin | Painel admin legado |
| `/admin/empresa/:companyId` | CompanyDashboard | Admin | Dashboard da empresa |
| `/admin/empresa/:companyId/unidades` | UnitManagement | Admin | Gestão de unidades |
| `/admin/empresa/:companyId/unidade/:unitId` | CompanyUsers | Admin | Usuários da unidade |
| `/admin/empresa/:companyId/usuarios` | CompanyUsers | Admin | Usuários da empresa |
| `/admin/empresa/:companyId/auditoria` | AuditLog | Admin | Auditoria da empresa |
| `/admin/auditoria` | AuditLog | Admin | Auditoria global |
| `*` | Redirect `/` | — | Rota não encontrada |

### Proteção de Rotas

O componente `ProtectedRoute` verifica:

1. **Loading**: exibe spinner enquanto carrega sessão
2. **Não autenticado**: redireciona para `/`
3. **Admin (`requireAdmin`)**: se `role !== 'admin'`, redireciona para `/recepcao`

### Paywall

Rotas com `<PaywallCard>` verificam se a empresa possui a feature ativa. Se não, exibe banner de upsell.

## Roles e Permissões

### Hierarquia

| Role | Acesso |
|---|---|
| `admin` | Tudo (ignora RLS e funcoes) |
| `coordinator` | Tudo exceto admin panel |
| `user` | Restrito à própria unidade + funcoes |

### Permissões Granulares (funcoes)

Array de strings armazenado em `user_profiles.funcoes`:

| Permissão | Funcionalidade |
|---|---|
| `Recepcao` | Acesso à fila de recepção |
| `Fila` | Gerenciamento de fila |
| `Videos` | Gerenciar playlist de vídeos |
| `Relatorios` | Visualizar relatórios |
| `TV` | Acesso aos painéis TV |
| `Prontuario` | Acesso a prontuários |
| `Agendamentos` | Acesso a agendamentos |

Admin e coordenador têm acesso implícito a todas as funções.

## Troca de Unidade

1. Click no nome do campus na Topbar → `ChangeCampusModal`
2. **User**: visualiza apenas o campus atual (travado)
3. **Admin/Coordinator**: pode selecionar qualquer campus, com re-verificação de senha
4. Ao trocar, `user_profiles.unidade` é atualizado e a store recarrega os dados

## AuthContext

Valores expostos pelo hook `useAuth()`:

| Propriedade | Tipo | Descrição |
|---|---|---|
| `user` | `User \| null` | Objeto do usuário Supabase |
| `role` | `string` | `admin`, `coordinator`, `user` |
| `unidade` | `string` | Unidade selecionada |
| `funcoes` | `string[]` | Array de permissões |
| `companyId` | `string` | ID da empresa vinculada |
| `unitId` | `string` | ID da unidade vinculada |
| `forcePasswordChange` | `boolean` | Se deve forçar troca de senha |
| `loading` | `boolean` | Sessão está sendo carregada |
| `signIn` | `function` | Login |
| `signUp` | `function` | Cadastro |
| `signOut` | `function` | Logout |
| `resetPassword` | `function` | Recuperação de senha |
| `refreshProfile` | `function` | Recarrega perfil |
| `clearForcePasswordChange` | `function` | Desativa flag de troca forçada |
