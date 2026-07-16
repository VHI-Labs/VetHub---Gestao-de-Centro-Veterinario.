# 🐾 VetHub — Guia de Contribuição

> **Para: Ingrid (e futuros devs do time)**  
> **Propósito:** Esse documento é o manual pra você fazer alterações no VetHub sem quebrar nada e seguindo os padrões do projeto. Tá tudo aqui: arquitetura, convenções, workflow e checklist.

---

## 📋 Sumário

1. [Stack & Ferramentas](#-stack--ferramentas)
2. [Arquitetura do Projeto](#-arquitetura-do-projeto)
3. [Convenções de Código](#-convenções-de-código)
4. [Como fazer alterações seguras](#-como-fazer-alterações-seguras)
5. [Testes — Obrigatório Ler](#-testes--obrigatório-ler)
6. [Workflow Git](#-workflow-git)
7. [Checklist Antes de Commitar](#-checklist-antes-de-commitar)
8. [FAQ para Devs](#-faq-para-devs)

---

## 🛠 Stack & Ferramentas

| Tecnologia | Versão | Pra quê |
|---|---|---|
| **React** | 18.3 | Framework de UI |
| **TypeScript** | 5.6 | Tipagem estática |
| **Vite** | 6 | Build & dev server |
| **Tailwind CSS** | 3.4 | Estilização utility-first |
| **React Router** | 6.28 | Roteamento SPA |
| **Zustand** | 5 | Gerenciamento de estado global |
| **Supabase** | ^2.110 | Backend (Auth + BD PostgreSQL) |
| **Framer Motion** | 12 | Animações declarativas |
| **Lucide React** | 0.468 | Ícones |
| **React FluentUI Emoji** | 1.3 | Emojis estilizados |
| **jsPDF** | 4 | Geração de PDF |
| **Vitest** | 4 | Test runner |
| **Testing Library** | 16 | Testes de componentes |

### Scripts disponíveis

```bash
npm run dev           # Dev server na porta 5173
npm run build         # Build de produção
npm run lint          # Typecheck + ESLint
npm test              # Testes em modo watch
npm run test:run      # Testes uma vez (CI)
npm run test:coverage # Testes com cobertura
```

---

## 🏗 Arquitetura do Projeto

```
src/
├── core/              # ⚡ Lógica de negócio PURA (sem React)
│   ├── engine.ts      #    Motor da fila, triagem, TVs
│   ├── ehr.ts         #    Prontuário eletrônico (CRUD)
│   ├── estoque.ts     #    Estoque & medicamentos
│   ├── financeiro.ts  #    Financeiro & faturamento
│   ├── veterinarios.ts#    CRUD de veterinários
│   ├── audio.ts       #    Sistema de som (gong + TTS)
│   ├── audit.ts       #    Log de auditoria
│   └── print.ts       #    Impressão de senhas
│
├── components/        # 🧩 Componentes React reutilizáveis
│   ├── __tests__/     #    Testes dos componentes
│   └── __mocks__/     #    Mocks para testes (Topbar)
│
├── pages/             # 📄 Páginas (rotas)
│   ├── __tests__/     #    Testes das páginas
│
├── hooks/             # 🪝 Hooks React customizados
│   ├── __tests__/     #    Testes dos hooks
│
├── store/             # 🗄 Estado global (Zustand)
│   ├── queueStore.ts  #    Store da fila de espera
│   ├── __tests__/     #    Testes da store
│
├── context/           # 🌐 Contextos React
│   ├── AuthContext.tsx #    Autenticação
│   ├── DemoContext.tsx #    Demo/trial
│   ├── __mocks__/     #    Mocks pra testes
│
├── lib/               # 📦 Libs externas configuradas
│   └── supabase.ts    #    Cliente Supabase
│
├── types/             # 📐 Tipos TypeScript globais
│   └── index.ts
│
├── test/              # 🧪 Helpers pra testes
│   ├── setup.ts       #    Setup global (jest-dom + polyfills)
│   ├── helpers.tsx    #    renderWithRouter, mockUseAuth
│   ├── mocks.ts       #    createMockSupabase, mockLocalStorage
│   ├── mockFactories.ts # Factories de dados mock
│   └── pageTestSetup.tsx # renderPage helper
│
└── App.tsx            # 🚀 Entry point com rotas
```

### 🔑 Regra de Ouro da Arquitetura

- **`core/`** → Funções PURAS, sem React, sem hooks, sem JSX.  
  Só recebem dados, processam, retornam. Testáveis sem mock de React.
- **`components/`** → Componentes burrinhos ou com estado local.  
  Recebem props, renderizam. Podem chamar core/ e hooks/.
- **`pages/`** → Orquestradores. Montam o estado global + hooks + componentes.
- **`hooks/`** → Lógica React reutilizável (efeitos, timers, etc).
- **`store/`** → Estado global (Zustand). Ponto único de verdade pra fila.

---

## 📐 Convenções de Código

### Nomenclatura

| Tipo | Padrão | Exemplo |
|---|---|---|
| Arquivos | `camelCase.ts` (JS/TS puro) | `engine.ts`, `ehr.ts` |
| Componentes | `PascalCase.tsx` | `MetricCard.tsx` |
| Funções puras | `camelCase` | `formatPetForDb()` |
| Componentes | `PascalCase` | `export default function PetListRow()` |
| Hooks | `usePrefixo` | `useClock()`, `useWaitTimer()` |
| Stores | `camelCase` | `useQueueStore`, `queueStore.ts` |
| Tipos/Interfaces | `PascalCase` | `interface Pet {}` |
| Testes | `arquivo.test.ts` | `engine.test.ts` |

### Estilo de Código

- **TypeScript estrito** — sempre tipar!
- **Sem classes** — só funções e hooks
- **Props de componente** → interface separada (ex: `PetListRowProps`)
- **`export default function`** para componentes
- **`export function`** para funções puras (várias por arquivo)
- **Event handlers** → `handleXxx` (ex: `handleSave`, `handleDelete`)
- **Constantes** → `UPPER_SNAKE_CASE`
- **Cores no db** → `snake_case` (ex: `data_hora`, `tipo_atendimento`)
- **Cores no front** → `camelCase` (ex: `dataHora`, `tipoAtendimento`)

### CSS

O projeto usa **Tailwind CSS** com classes utilitárias e também **inline styles** com objetos `React.CSSProperties`. O estilo global fica em `src/styles/global.css`.

```tsx
// ✅ Preferido: inline styles com type safety
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  borderRadius: 8, border: "1.5px solid rgba(15,118,110,0.15)",
}

// ✅ Tailwind para coisas simples
<div className="min-h-screen flex items-center justify-center" />
```

### Formatação de Dados (DB → Front)

Sempre que buscar dados do Supabase, usar as funções `formatXxxDbToTs()` que convertem de `snake_case` para `camelCase`. **NUNCA** acessar `row.data_hora` diretamente no front — usar `formatDbToPet(row).dataHora`.

---

## ✅ Como fazer alterações seguras

### 1. Entenda o fluxo

Antes de alterar qualquer arquivo:
1. Veja se a função já existe em `core/`
2. Veja se o tipo já existe em `types/index.ts`
3. Veja se já tem teste pro que você quer alterar
4. Rode `npm run test:run` ANTES de começar

### 2. Altere com segurança

#### Se você tá alterando uma função em `core/`:
```ts
// 1. Altere a função
export function cleanText(value: unknown, fallback = ''): string {
  // ...
}

// 2. Atualize os testes
// src/core/__tests__/engine.test.ts
describe('cleanText', () => {
  it('deve funcionar com o novo caso', () => {
    expect(cleanText('novo')).toBe('novo')
  })
})

// 3. Rode os testes daquele módulo
// npm test -- src/core/__tests__/engine.test.ts
```

#### Se você tá alterando um componente:
```tsx
// 1. Altere o componente
export default function MetricCard({ icon, label, value }: MetricCardProps) {
  // ...
}

// 2. Crie/atualize o teste
// src/components/__tests__/MetricCard.test.tsx
describe('MetricCard', () => {
  it('renderiza com as props novas', () => {
    render(<MetricCard icon="🐾" label="Teste" value={42} />)
    expect(screen.getByText('Teste')).toBeInTheDocument()
  })
})
```

#### Se você tá adicionando uma página:
```tsx
// 1. Crie o arquivo em src/pages/
// 2. Adicione a rota em App.tsx
// 3. Crie o teste em src/pages/__tests__/
// 4. Use renderPage() do test/pageTestSetup.tsx
```

### 3. Mock vs Real

NUNCA chame Supabase nos testes. Use mocks:

```ts
// Mock de engine
vi.mock('../../core/engine')

// Mock do AuthContext
vi.mock('../../context/AuthContext')

// Mock de componente filho
vi.mock('../../components/Topbar', () => ({
  default: ({ title }: { title: string }) =>
    <div data-testid="topbar">{title}</div>,
}))
```

### 4. Padrão de Teste pra Componentes com Formulários

Formulários usam `createPortal` para renderizar modais. O padrão é:

```tsx
// Mock do componente (se ele for complexo)
vi.mock('../../components/TutorForm', () => ({
  default: ({ onSave, onClose }: any) => (
    <div data-testid="tutor-form">
      <button onClick={() => onSave({ id: 'new-tutor' })}>Salvar Tutor</button>
      <button onClick={onClose}>Fechar Tutor</button>
    </div>
  ),
}))
```

---

## 🧪 Testes — Obrigatório Ler

### Filosofia

- **core/ functions** → Teste puro, sem mock de React. Rápido, confiável.
- **components/ + pages/** → Teste de renderização, interação do usuário, estados vazios/de erro/loading.
- **store/** → Testa estado inicial, ações, dados carregados via mock.
- **hooks/** → Testa timers, eventos, cleanup.

### Cobertura Alvo

| Camada | Cobertura esperada |
|---|---|
| core/ functions | 95%+ |
| store/ | 90%+ |
| hooks/ | 90%+ |
| components/ | 80%+ (críticos: 90%+) |
| pages/ | 70%+ (rotas principais) |

### Como rodar

```bash
# Rodar todos os testes
npm run test:run

# Rodar com cobertura
npm run test:coverage

# Rodar um arquivo específico
npm test -- src/core/__tests__/engine.test.ts

# Rodar em modo watch (desenvolvimento)
npm test
```

### Debug de testes

Se um teste falhar:
1. `npm test -- --reporter=verbose` pra ver detalhes
2. Verifique se os mocks estão corretos
3. Verifique se o componente não chama algo que não foi mockado
4. Use `screen.debug()` pra ver o HTML renderizado

Exemplo de debug:
```ts
it('debug test', () => {
  render(<MeuComponente />)
  screen.debug() // Mostra o HTML completo
})
```

---

## 🔄 Workflow Git

```
main
  └── feat/nome-da-feature  (branch de feature)
       └── PR → main        (Pull Request)
```

### Passo a passo

```bash
# 1. Atualizar main
git checkout main
git pull origin main

# 2. Criar branch
git checkout -b feat/minha-feature

# 3. Fazer alterações
# ... código ...

# 4. Rodar testes
npm run test:run
npm run lint

# 5. Commitar (commits semânticos)
git add .
git commit -m "feat: adiciona X funcionalidade"

# 6. Subir
git push origin feat/minha-feature

# 7. Criar PR no GitHub
```

### Prefixos de Commit

| Prefixo | Quando usar |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `test:` | Adição/alteração de testes |
| `docs:` | Documentação |
| `refactor:` | Refatoração sem mudar comportamento |
| `style:` | Formatação, estilos CSS |
| `chore:` | Configuração, dependências, build |

---

## ✅ Checklist Antes de Commitar

- [ ] `npm run lint` passou sem erros
- [ ] `npm run test:run` passou (todos os testes)
- [ ] Cobertura dos novos códigos está OK (`npm run test:coverage`)
- [ ] Tipos TypeScript estão corretos (sem `any` desnecessário)
- [ ] Funções em `core/` são puras (sem React, sem efeitos colaterais)
- [ ] Componentes têm interfaces de props tipadas
- [ ] Mockei dependências externas nos testes (Supabase, Auth, etc)
- [ ] Testei estado de loading, vazio e erro nos componentes
- [ ] Usei `formatXxxDbToTs()` pra converter dados do banco
- [ ] Usei `cleanText()` pra sanitizar valores undefined/null
- [ ] Nomeei arquivos no padrão certo (PascalCase TSX, camelCase TS)
- [ ] Removi `console.log` de debug

---

## ❓ FAQ para Devs

### "Onde coloco lógica de negócio?"

**SEMPRE em `core/`**. NUNCA em componente ou página.  
Se a lógica envolve calcular, filtrar, transformar dados → `core/`.

### "Preciso adicionar um campo novo no banco?"

1. Adicione no Supabase (via SQL ou dashboard)
2. Atualize a interface em `types/index.ts`
3. Adicione o campo nas funções `formatXxxDbToTs()` e `formatXxxForDb()` em `core/`
4. Atualize o componente que usa o dado

### "Como faço pra testar algo que usa Supabase?"

Sempre mock! Veja o padrão em `src/test/mocks.ts`:
```ts
vi.mock('../../lib/supabase', () => ({
  supabase: { from: vi.fn(), rpc: vi.fn() }
}))
```

### "Como adiciono uma nova rota?"

1. Adicione o componente da página em `src/pages/`
2. Adicione a rota em `src/App.tsx` dentro de `<Routes>`
3. Se precisar de proteção, envolva em `<ProtectedRoute>` ou `<ProtectedRoute requireAdmin>`
4. Se for feature premium, envolva em `<PaywallCard feature="xxx">`

### "Qual hook usar pra timer/intervalo?"

- `useClock()` → Relógio que atualiza a cada segundo
- `useWaitTimer(dataHora)` → Timer de espera "Aguardando há Xh Ym Zs"
- `useStorageSync()` → Sincroniza store com eventos `storage`
- `useRealtimeQueue()` → Sincroniza store com Supabase Realtime

### "Preciso criar um modal/formulário novo?"

Siga o padrão dos formulários existentes:
1. Crie em `src/components/`
2. Use `createPortal` pro modal (renderiza fora da árvore)
3. Props: `onSave: (data) => void` e `onClose: () => void`
4. Teste com mocks do formulário nas páginas que o usam

---

## 🎯 Resumo pra não errar

```
1. core/ → lógica pura → testar sem mock
2. components/ → renderização → testar com mock de core/ e context/
3. pages/ → orquestração → testar com mock de componentes filhos
4. hooks/ → efeitos/timers → testar com fake timers
5. store/ → estado global → testar com mock de engine/
```

**“Teste como se fosse o dono. Código como se fosse seu legado.”** 🐾
