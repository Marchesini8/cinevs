# CINEVS Streaming

Base de streaming com frontend React/Vite, login/cadastro e backend Express usando PostgreSQL.

## Rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Copie `.env.example` para `.env` e preencha:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=sua-chave-secreta
PORT=3001
CLIENT_URL=http://127.0.0.1:5173
GOOGLE_CLIENT_ID=
VITE_GOOGLE_CLIENT_ID=
```

3. Inicie frontend e backend:

```bash
npm run dev
```

Frontend: http://127.0.0.1:5173  
API: http://127.0.0.1:3001

## Railway PostgreSQL

O projeto já está pronto para deploy no Railway.

1. Suba este repositório no GitHub.
2. No Railway, clique em **New Project > Deploy from GitHub repo**.
3. Selecione o repositório `cinevs`.
4. Adicione um banco **PostgreSQL** no mesmo projeto.
5. Configure as variáveis do serviço web:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=uma-chave-grande-e-secreta
CLIENT_URL=https://cinevs.up.railway.app
GOOGLE_CLIENT_ID=179853125831-5nnp0kn44t6c2cq5k2f6cp2c1frkeaog.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=179853125831-5nnp0kn44t6c2cq5k2f6cp2c1frkeaog.apps.googleusercontent.com
```

O Railway usa o `railway.json` para rodar `npm ci && npm run build` e iniciar com
`npm run start`. Ao iniciar a API, ela cria automaticamente a tabela `users` se ela
ainda não existir.

Depois do primeiro deploy, copie o domínio gerado pelo Railway e atualize
`CLIENT_URL` com esse endereço. Se usar domínio customizado, coloque ele também,
separado por vírgula.

## Google Auth

O botão "Continuar com Google" usa Google Identity Services. No Google Cloud Console,
adicione os domínios do app em **Authorized JavaScript origins**:

```txt
http://localhost:5173
http://127.0.0.1:5173
https://cinevs.up.railway.app
```

Não precisa de `GOOGLE_CLIENT_SECRET` para este fluxo. O backend recebe o token do
Google, valida o `GOOGLE_CLIENT_ID` e cria ou vincula a conta automaticamente.

## Vídeos dos episódios

Não envie arquivos `.mp4` grandes para o GitHub. O projeto ignora vídeos em
`public/assets/*.mp4` para evitar erro no push e no deploy.

Para trocar os vídeos dos episódios, hospede os arquivos em um storage externo e
substitua as constantes de vídeo em `app.js` por URLs HTTPS diretas.
