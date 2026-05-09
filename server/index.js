import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

const app = express();
const port = process.env.PORT || 3001;
const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-me";
const googleClientId =
  process.env.GOOGLE_CLIENT_ID ||
  "179853125831-5nnp0kn44t6c2cq5k2f6cp2c1frkeaog.apps.googleusercontent.com";
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sitePath = path.resolve(__dirname, "..");
const indexPath = path.join(sitePath, "index.html");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("railway.app")
    ? { rejectUnauthorized: false }
    : undefined,
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origem não permitida pelo CORS."));
    },
    credentials: true,
  }),
);
app.use(express.json());

function ensureDatabaseConfigured(res) {
  if (!process.env.DATABASE_URL) {
    res.status(503).json({
      message: "Banco de dados não configurado. Configure DATABASE_URL no Railway.",
    });
    return false;
  }

  return true;
}

async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL não configurada. Configure o PostgreSQL do Railway no .env.");
    return;
  }

  await pool.query(`
    create extension if not exists pgcrypto;

    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      name varchar(120) not null,
      email varchar(180) not null unique,
      password_hash text,
      provider varchar(40) not null default 'email',
      google_id varchar(180) unique,
      avatar_url text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);
}

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: "7d" },
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    provider: user.provider,
    avatarUrl: user.avatar_url,
  };
}

function escapeForInlineScript(value = "") {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getGoogleCookies(response) {
  const getSetCookie = response.headers.getSetCookie?.() || [];
  const singleHeader = response.headers.get("set-cookie");
  const cookies = getSetCookie.length ? getSetCookie : singleHeader ? [singleHeader] : [];

  return cookies.map((cookie) => cookie.split(";")[0]).join("; ");
}

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function findDriveConfirmUrl(html, fileId) {
  const directMatch = html.match(/https:\/\/drive\.usercontent\.google\.com\/download\?[^"'<>\\]+/);
  if (directMatch) {
    return decodeHtml(directMatch[0]);
  }

  const relativeMatch = html.match(/href="(\/uc\?export=download[^"]+)"/);
  if (relativeMatch) {
    return `https://drive.google.com${decodeHtml(relativeMatch[1])}`;
  }

  const formActionMatch = html.match(/<form[^>]+id="download-form"[^>]+action="([^"]+)"/);
  if (formActionMatch) {
    const params = new URLSearchParams();
    html.replace(
      /<input[^>]+type="hidden"[^>]+name="([^"]+)"[^>]+value="([^"]*)"/g,
      (_match, name, value) => {
        params.set(decodeHtml(name), decodeHtml(value));
        return "";
      },
    );

    if (params.get("id") === fileId) {
      return `${decodeHtml(formActionMatch[1])}?${params.toString()}`;
    }
  }

  const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)&/);
  if (confirmMatch) {
    const params = new URLSearchParams({
      export: "download",
      id: fileId,
      confirm: confirmMatch[1],
    });

    return `https://drive.google.com/uc?${params.toString()}`;
  }

  return null;
}

async function fetchDriveFile(fileId, rangeHeader) {
  const requestHeaders = {};
  if (rangeHeader) {
    requestHeaders.Range = rangeHeader;
  }

  const firstResponse = await fetch(
    `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`,
    { headers: requestHeaders },
  );
  const firstContentType = firstResponse.headers.get("content-type") || "";

  if (!firstContentType.includes("text/html")) {
    return firstResponse;
  }

  const html = await firstResponse.text();
  const confirmUrl = findDriveConfirmUrl(html, fileId);

  if (!confirmUrl) {
    return firstResponse;
  }

  const cookie = getGoogleCookies(firstResponse);
  const confirmHeaders = { ...requestHeaders };
  if (cookie) {
    confirmHeaders.Cookie = cookie;
  }

  return fetch(confirmUrl, { headers: confirmHeaders });
}

function renderIndexHtml() {
  return fs
    .readFileSync(indexPath, "utf8")
    .replace("__GOOGLE_CLIENT_ID__", escapeForInlineScript(googleClientId || ""));
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token não informado." });
  }

  try {
    req.auth = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: "Sessão expirada. Entre novamente." });
  }
}

async function verifyGoogleCredential(credential) {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
  );
  const payload = await response.json().catch(() => ({}));

  if (
    !response.ok ||
    payload.aud !== googleClientId ||
    !["true", true].includes(payload.email_verified)
  ) {
    throw new Error("Token do Google inválido.");
  }

  return {
    googleId: payload.sub,
    name: payload.name || payload.email?.split("@")[0] || "Usuário Google",
    email: payload.email,
    avatarUrl: payload.picture || null,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    googleConfigured: Boolean(googleClientId),
  });
});

app.get("/api/drive-video/:fileId", async (req, res) => {
  const { fileId } = req.params;

  if (!/^[0-9A-Za-z_-]{10,}$/.test(fileId)) {
    return res.status(400).json({ message: "ID do vÃ­deo invÃ¡lido." });
  }

  try {
    const driveResponse = await fetchDriveFile(fileId, req.headers.range);
    const contentType = driveResponse.headers.get("content-type") || "";

    if (!driveResponse.ok || contentType.includes("text/html") || !driveResponse.body) {
      return res.status(502).json({
        message:
          "NÃ£o foi possÃ­vel carregar este vÃ­deo do Google Drive. Confira se o arquivo estÃ¡ compartilhado como pÃºblico.",
      });
    }

    res.status(driveResponse.status === 206 ? 206 : 200);
    res.setHeader("Content-Type", contentType || "video/mp4");
    res.setHeader("Accept-Ranges", driveResponse.headers.get("accept-ranges") || "bytes");
    res.setHeader("Cache-Control", "private, max-age=300");
    res.setHeader("Content-Disposition", "inline");

    ["content-length", "content-range"].forEach((header) => {
      const value = driveResponse.headers.get(header);
      if (value) {
        res.setHeader(header, value);
      }
    });

    Readable.fromWeb(driveResponse.body).pipe(res);
  } catch (error) {
    console.error("Erro ao carregar vÃ­deo do Drive:", error);
    res.status(502).json({ message: "NÃ£o foi possÃ­vel iniciar o vÃ­deo agora." });
  }
});

app.post("/api/auth/register", async (req, res) => {
  if (!ensureDatabaseConfigured(res)) {
    return;
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Preencha nome, email e senha." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "A senha precisa ter pelo menos 6 caracteres." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `insert into users (name, email, password_hash)
       values ($1, lower($2), $3)
       returning id, name, email, provider, avatar_url`,
      [name.trim(), email.trim(), passwordHash],
    );
    const user = result.rows[0];

    res.status(201).json({ token: createToken(user), user: sanitizeUser(user) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Esse email já está cadastrado." });
    }

    console.error(error);
    res.status(500).json({ message: "Não foi possível criar sua conta." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  if (!ensureDatabaseConfigured(res)) {
    return;
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Informe email e senha." });
  }

  try {
    const result = await pool.query(
      `select id, name, email, password_hash, provider, avatar_url
       from users
       where email = lower($1)
       limit 1`,
      [email.trim()],
    );
    const user = result.rows[0];

    if (!user?.password_hash) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }

    res.json({ token: createToken(user), user: sanitizeUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível entrar agora." });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  if (!ensureDatabaseConfigured(res)) {
    return;
  }

  const result = await pool.query(
    `select id, name, email, provider, avatar_url
     from users
     where id = $1
     limit 1`,
    [req.auth.sub],
  );

  if (!result.rows[0]) {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }

  res.json({ user: sanitizeUser(result.rows[0]) });
});

app.post("/api/auth/google", async (req, res) => {
  if (!ensureDatabaseConfigured(res)) {
    return;
  }

  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "Token do Google não informado." });
  }

  try {
    const googleUser = await verifyGoogleCredential(credential);
    const existingUser = await pool.query(
      `select id, name, email, provider, google_id, avatar_url
       from users
       where email = lower($1)
       limit 1`,
      [googleUser.email],
    );

    let user = existingUser.rows[0];

    if (user?.google_id && user.google_id !== googleUser.googleId) {
      return res.status(409).json({ message: "Este email já está vinculado a outra conta Google." });
    }

    if (user) {
      const result = await pool.query(
        `update users
         set provider = case when provider = 'email' then 'google' else provider end,
             google_id = coalesce(google_id, $2),
             avatar_url = coalesce($3, avatar_url),
             updated_at = now()
         where id = $1
         returning id, name, email, provider, avatar_url`,
        [user.id, googleUser.googleId, googleUser.avatarUrl],
      );

      user = result.rows[0];
    } else {
      const result = await pool.query(
        `insert into users (name, email, provider, google_id, avatar_url)
         values ($1, lower($2), 'google', $3, $4)
         returning id, name, email, provider, avatar_url`,
        [googleUser.name, googleUser.email, googleUser.googleId, googleUser.avatarUrl],
      );

      user = result.rows[0];
    }

    res.json({ token: createToken(user), user: sanitizeUser(user) });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: error.message || "Não foi possível entrar com Google." });
  }
});

app.use("/public", express.static(path.join(sitePath, "public")));
app.use("/src", express.static(path.join(sitePath, "src")));
app.use(express.static(sitePath, { index: false }));

app.use((_req, res) => {
  try {
    res.type("html").send(renderIndexHtml());
  } catch (error) {
    console.error("Erro ao carregar index.html:", error);
    res.status(500).send("Erro ao carregar a aplicação.");
  }
});

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`CINEVS API rodando em http://127.0.0.1:${port}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao iniciar banco de dados:", error);
    process.exit(1);
  });
