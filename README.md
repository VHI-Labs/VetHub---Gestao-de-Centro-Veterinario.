<div align="center">

<br />

# 🐾 HOVET

### Sistema de Gerenciamento de Filas para Centros Médicos Veterinários

> Sistema de gerenciamento de filas para **Centros Médicos Veterinários (CMVs)**

<br />

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

<br />

[**Acesse o VetHub →**](https://vet-hub-gestao-de-centro-veterinari.vercel.app)

</div>

---

## 📋 Sobre o Projeto

O **HOVET** é uma plataforma web moderna para gerenciamento de filas de atendimento em Centros Médicos Veterinários. O sistema otimiza o fluxo de pacientes desde a **triagem** até o **atendimento**, com painéis digitais para salas de espera e televisores.

### 🎯 Propósito

Digitalizar e organizar o atendimento veterinário, proporcionando uma experiência mais fluida tanto para os tutores quanto para a equipe veterinária.

---

## 🚀 Tecnologias Utilizadas

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" width="48" alt="React" /><br/><b>React</b>
    </td>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="48" alt="TypeScript" /><br/><b>TypeScript</b>
    </td>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg" width="48" alt="Vite" /><br/><b>Vite</b>
    </td>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" width="48" alt="Tailwind CSS" /><br/><b>Tailwind</b>
    </td>
    <td align="center" width="96">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg" width="48" alt="Supabase" /><br/><b>Supabase</b>
    </td>
  </tr>
</table>

| Tecnologia | Versão | Finalidade |
|:---|---:|:---|
| **React** | 18.3 | Interface de usuário |
| **TypeScript** | 5.6 | Tipagem estática |
| **Vite** | 6.0 | Build e dev server |
| **Tailwind CSS** | 3.4 | Estilização utilitária |
| **Zustand** | 5.0 | Gerenciamento de estado |
| **Supabase** | 2.106 | Backend, autenticação e banco de dados |
| **React Router DOM** | 6.28 | Roteamento SPA |
| **Lucide React** | 0.468 | Biblioteca de ícones |
| **PostCSS / Autoprefixer** | 8.5 / 10.5 | Processamento CSS |

---

## ✨ Funcionalidades

<table>
  <tr>
    <td width="50%">
      <h3>🔐 Autenticação</h3>
      <p>Login seguro via Supabase com controle de permissões por papel (admin, coordenador, usuário).</p>
    </td>
    <td width="50%">
      <h3>🏥 Triagem</h3>
      <p>Kiosk digital de autoatendimento em 3 etapas: espécie, tipo de consulta e identificação do tutor.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📋 Filas de Atendimento</h3>
      <p>Gerenciamento de filas separadas por espécie (cães, gatos, silvestres) com chamada por voz.</p>
    </td>
    <td width="50%">
      <h3>🖥️ Painéis TV</h3>
      <p>Painéis digitais para exibição nas TVs das salas de espera com fila, histórico e YouTube integrado.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📊 Dashboard</h3>
      <p>Métricas de atendimento, gráfico de distribuição por prioridade e filtros por período.</p>
    </td>
    <td width="50%">
      <h3>🖨️ Impressão</h3>
      <p>Impressão de senhas de triagem e formulários de encaminhamento médico.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔊 Chamada por Voz</h3>
      <p>Sistema de áudio com gongo + sintetizador de voz em português para chamar pacientes.</p>
    </td>
    <td width="50%">
      <h3>📱 PWA</h3>
      <p>Suporte a Progressive Web App com service worker para funcionamento offline parcial.</p>
    </td>
  </tr>
</table>

## 📚 Documentação

Documentação detalhada disponível na pasta [`docs/`](docs/):

| Documento | Descrição |
|---|---|
| [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Arquitetura do sistema, fluxo de dados, estrutura de diretórios |
| [`SETUP.md`](docs/SETUP.md) | Instalação, configuração do Supabase, variáveis de ambiente |
| [`DATABASE.md`](docs/DATABASE.md) | Schema completo, RLS policies, migrations |
| [`AUTH.md`](docs/AUTH.md) | Autenticação, rotas, roles e permissões |
| [`FEATURES.md`](docs/FEATURES.md) | Funcionalidades detalhadas (filas, triagem, painéis, relatórios) |
| [`DEPLOY.md`](docs/DEPLOY.md) | Build e deploy (Vercel, Netlify, Cloudflare) |

---

## 👨‍💻 Autores

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="https://github.com/capybaraholding">
          <img src="https://ui-avatars.com/api/?name=Manoel+Vitor+Santos+Santana&background=0f766e&color=fff&size=100&font-size=0.35&bold=true" alt="Manoel Vitor" width="100" style="border-radius:50%" />
          <br />
          <b>Manoel Vitor</b>
          <br />
          <sub>Santos Santana</sub>
          <br />
          <sub>🚀 Capybara Holding</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/IngridCBrito">
          <img src="https://ui-avatars.com/api/?name=Ingrid+da+Conceicao+Brito&background=881337&color=fff&size=100&font-size=0.33&bold=true" alt="Ingrid da Conceição Brito" width="100" style="border-radius:50%" />
          <br />
          <b>Ingrid da</b>
          <br />
          <sub>Conceição Brito</sub>
          <br />
          <sub>🎨 Design & Dev</sub>
        </a>
      </td>
    </tr>
  </table>

  <br />

  <p><em>Projeto desenvolvido com ❤️ para melhorar o atendimento veterinário universitário.</em></p>
</div>

---

<div align="center">

  <sub>© 2026 — HOVET · Capybara Holding</sub>

</div>
