<div align="center">

<br />

# 🐾 VetHub

### Gestão Veterinária Simplificada

> Sistema de gestão veterinária para clínicas e hospitais — fila de espera inteligente, prontuários, agendamentos e painéis de TV.

<br />

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

<br />

[**Acesse o VetHub →**](https://vet-hub-gestao-de-centro-veterinari.vercel.app)

</div>

---

## Sobre o Projeto

O **VetHub** é uma plataforma web completa para gestão de clínicas e hospitais veterinários. Ele organiza todo o fluxo de atendimento — do check-in à saída do paciente — com ferramentas pensadas para a rotina veterinária.

### Propósito

Tornar a gestão do atendimento veterinário mais simples, eficiente e透明e, ajudando clínicas a oferecerem uma experiência melhor aos seus pacientes e responsáveis.

---

## Stack

| Tecnologia | Versão | Finalidade |
|:---|---:|:---|
| **React** | 18.3 | Interface de usuário |
| **TypeScript** | 5.6 | Tipagem estática |
| **Vite** | 6.0 | Build e dev server |
| **Tailwind CSS** | 3.4 | Estilização utilitária |
| **Zustand** | 5.0 | Gerenciamento de estado |
| **Supabase** | 2.110 | Backend, auth e banco de dados |
| **React Router DOM** | 6.28 | Roteamento SPA |
| **Framer Motion** | 12.42 | Animações |
| **Lucide React** | 0.468 | Ícones |
| **jsPDF** | 4.2 | Geração de PDF |

---

## Funcionalidades

### Fila de Espera Inteligente
Triagem por prioridade com cores (vermelho/amarelo/verde), chamada automática por voz (TTS) e exibição em tempo real nos painéis da clínica.

### Prontuários Completos
Cadastro de tutores e pacientes com histórico detalhado de todas as consultas e procedimentos. Upload de exames e documentos.

### Agendamentos
Gerenciamento de consultas, cirurgias, exames e vacinas com calendário visual.

### Painéis de TV
Exibição da fila de espera e vídeos institucionais na sala de espera com layout profissional e suporte a YouTube.

### Relatórios e Métricas
Gráficos de distribuição por prioridade, métricas em tempo real e exportação de dados em PDF.

### Controle de Acesso
Perfis por função (administrador, coordenador, atendente) com autenticação via Supabase e log de auditoria.

### Atendimento Rápido
Fluxo otimizado com senhas dinâmicas, encaminhamento ágil e notificações sonoras.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- npm ou yarn
- Conta no [Supabase](https://supabase.com/)

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/VHI-Labs/VetHub---Gestao-de-Centro-Veterinario.git
cd VetHub---Gestao-de-Centro-Veterinario

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

---

## Scripts Disponíveis

| Comando | Descrição |
|:---|:---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Pré-visualiza o build de produção |
| `npm run lint` | Verifica erros de TypeScript e ESLint |
| `npm run test` | Roda os testes em modo watch |
| `npm run test:run` | Roda os testes uma vez |
| `npm run test:coverage` | Roda testes com cobertura |

---

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── __tests__/       # Testes dos componentes
│   ├── AgendamentoForm.tsx
│   ├── BottomNavbar.tsx
│   ├── CalendarioAgendamento.tsx
│   ├── CalledQueueSidebar.tsx
│   ├── ConsultaForm.tsx
│   ├── DonutChart.tsx
│   ├── Footer.tsx
│   ├── MedicamentoForm.tsx
│   ├── MonthlyReport.tsx
│   ├── PacienteForm.tsx
│   ├── PaywallCard.tsx
│   ├── PetListRow.tsx
│   ├── Topbar.tsx
│   ├── TutorForm.tsx
│   └── ...
├── context/             # Contextos React (Auth, Demo)
├── core/                # Lógica de negócio (EHR, audit)
├── hooks/               # Custom hooks
├── pages/               # Páginas da aplicação
│   ├── Landing.tsx      # Landing page pública
│   ├── Login.tsx        # Login
│   ├── Recepcao.tsx     # Recepção
│   ├── Triagem.tsx      # Triagem
│   ├── Prontuario.tsx   # Prontuários
│   ├── Agendamentos.tsx # Agendamentos
│   ├── PainelCaes.tsx   # Painel TV - Cães
│   ├── PainelGatos.tsx  # Painel TV - Gatos
│   ├── Financeiro.tsx   # Financeiro
│   ├── Estoque.tsx      # Estoque
│   ├── Veterinarios.tsx # Veterinários
│   └── AdminPage.tsx    # Painel admin
├── store/               # Zustand stores
├── styles/              # Estilos globais (Tailwind)
├── test/                # Setup de testes
├── App.tsx              # Router principal
└── main.tsx             # Entry point
```

---

## Deploy

O projeto está configurado para deploy na [Vercel](https://vercel.com):

```bash
# Build de produção
npm run build

# O output está na pasta dist/
```

Para deploy manual, basta importar o repositório no Vercel. As variáveis de ambiente precisam ser configuradas no painel da Vercel.

---

## Autores

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="https://github.com/vihisantos">
          <img src="https://raw.githubusercontent.com/VHI-Labs/VetHub---Gestao-de-Centro-Veterinario/master/public/team/vitor.png" alt="Vitor Santos" width="100" style="border-radius:50%; object-fit:cover" />
          <br />
          <b>Vitor Santos</b>
          <br />
          <sub>Desenvolvedor Full Stack</sub>
          <br />
          <sub>Gestão Piracicaba - SP</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/IngridBrito">
          <img src="https://raw.githubusercontent.com/VHI-Labs/VetHub---Gestao-de-Centro-Veterinario/master/public/team/ingrid.png" alt="Ingrid Brito" width="100" style="border-radius:50%; object-fit:cover" />
          <br />
          <b>Ingrid Brito</b>
          <br />
          <sub>Desenvolvedora Full Stack</sub>
          <br />
          <sub>Gestão Grande São Paulo Capital</sub>
        </a>
      </td>
    </tr>
  </table>

  <br />

  <p><em>Desenvolvido com ❤️ para transformar o atendimento veterinário em todo o Brasil.</em></p>
</div>

---

<div align="center">

  <sub>© 2026 VetHub. Todos os direitos reservados. 🇧🇷</sub>

</div>
