# Deploy

## Build

```bash
npm run build
```

O build gera os arquivos em `dist/`.

## Opções de Hospedagem

### Vercel (recomendado)

1. Conecte o repositório no [Vercel](https://vercel.com)
2. Configurações:
   - **Framework**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Install command**: `npm install`
3. **Environment variables**:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
   ```
4. **Redirects** (vercel.json):
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

### Netlify

1. Conecte o repositório no [Netlify](https://netlify.com)
2. Configurações:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. **Environment variables**: mesmas do Vercel
4. **Redirects** (netlify.toml):
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Cloudflare Pages

1. Conecte o repositório no [Cloudflare Pages](https://pages.cloudflare.com)
2. Configurações:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. **Environment variables**: mesmas
4. **SPA mode**: ativar nas configurações do projeto

## Pós-Deploy

1. No Supabase: **Authentication > URL Configuration** — adicione a URL de produção
2. Teste o fluxo completo: login → fila → chamar → concluir
3. Verifique os painéis TV em outra aba

## CI/CD

O projeto não possui configuração de CI/CD. Para automatizar:

- **Vercel**: deploy automático ao fazer push na branch principal
- **GitHub Actions**: pode-se configurar workflow para build + deploy
