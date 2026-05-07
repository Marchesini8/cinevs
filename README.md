# CINEVS Streaming

Base de streaming com frontend React/Vite, login/cadastro e backend Express usando PostgreSQL.

## Rodar localmente

1. Instale as dependencias:

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

O projeto ja esta pronto para deploy no Railway.

1. Suba este repositorio no GitHub.
2. No Railway, clique em **New Project > Deploy from GitHub repo**.
3. Selecione o repositorio `cinevs`.
4. Adicione um banco **PostgreSQL** no mesmo projeto.
5. Configure as variaveis do servico web:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=uma-chave-grande-e-secreta
CLIENT_URL=https://cinevs.up.railway.app
GOOGLE_CLIENT_ID=179853125831-5nnp0kn44t6c2cq5k2f6cp2c1frkeaog.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=179853125831-5nnp0kn44t6c2cq5k2f6cp2c1frkeaog.apps.googleusercontent.com
```

O Railway usa o `railway.json` para rodar `npm ci && npm run build` e iniciar com
`npm run start`. Ao iniciar a API, ela cria automaticamente a tabela `users` se ela
ainda nao existir.

Depois do primeiro deploy, copie o dominio gerado pelo Railway e atualize
`CLIENT_URL` com esse endereco. Se usar dominio customizado, coloque ele tambem,
separado por virgula.

## Google Auth

O botao "Continuar com Google" usa Google Identity Services. No Google Cloud Console,
adicione os dominios do app em **Authorized JavaScript origins**:

```txt
http://localhost:5173
http://127.0.0.1:5173
https://cinevs.up.railway.app
```

Nao precisa de `GOOGLE_CLIENT_SECRET` para este fluxo. O backend recebe o token do
Google, valida o `GOOGLE_CLIENT_ID` e cria ou vincula a conta automaticamente.

## Videos dos episodios

Nao envie arquivos `.mp4` grandes para o GitHub. O projeto ignora videos em
`public/assets/*.mp4` para evitar erro no push e no deploy.

Para trocar os videos dos episodios, hospede os arquivos em um storage externo e
substitua as constantes de video em `src/main.jsx` por URLs HTTPS diretas.
