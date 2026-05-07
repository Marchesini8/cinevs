const authStorageKey = "cinevs:auth";
const selectedProfileStorageKey = "cinevs:selected-profile";
const googleClientId =
  "179853125831-5nnp0kn44t6c2cq5k2f6cp2c1frkeaog.apps.googleusercontent.com";
const sampleVideoUrl =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const driveVideos = {
  ep1: "https://drive.google.com/file/d/1JLW9o3GEeZ5HejfwaYAalmNR3YErLtgr/view?usp=sharing",
  ep2: "https://drive.google.com/file/d/1hMWDolNMuxPy2BL-NYH66VXdQoKxsDDr/view?usp=drive_link",
  ep3: "https://drive.google.com/file/d/1b7a8h0kh-rWnMYWXhhosv4koRHua5dyp/view?usp=sharing",
  ep4: "https://drive.google.com/file/d/1IWm7ddUTK0bvnm7PuRhfwrl1CXiMMF89/view?usp=sharing",
};

const episodeImages = [
  "https://m.media-amazon.com/images/S/pv-target-images/0969508dd256763c2e010ac4adb02b7eb574b92dc3cfd1c35698f28f59cc0345._BR-6_AC_SX360_FMavif_PQ50_.jpg",
  "https://m.media-amazon.com/images/S/pv-target-images/c49b5c58548476979a903163a42d7b2b2721d77aeed7cf271f0c9a45a075fbeb._BR-6_AC_SX360_FMwebp_.png",
  "https://m.media-amazon.com/images/S/pv-target-images/52c7b7fb32ddc55b0bbba237de4e0ab76973384ff8d9a39ab0936b9262340a15._BR-6_AC_SX360_FMavif_PQ50_.jpg",
  "https://m.media-amazon.com/images/S/pv-target-images/be9e7e8db59ccc5f915845ffadcf4adcfe15dd8079a932c09106a3522de938d6._BR-6_AC_SX360_FMavif_PQ50_.jpg",
];

const root = document.querySelector("#root");
let auth = readStorage(authStorageKey);
let view = auth?.token ? "home" : "auth";
let selectedSeason = 1;
let currentItem = null;

const theBoysDetail = {
  title: "The Boys",
  year: "2019",
  rating: "4.9",
  seasons: 5,
  age: "18",
  genres: ["Action & Adventure", "Sci-Fi & Fantasy"],
  image: "./public/assets/the-boys-banner.png",
  background: "./public/assets/the-boys-banner.png",
  synopsis:
    "Na trama, conhecemos um mundo em que super-herois sao as maiores celebridades do planeta, e rotineiramente abusam dos seus poderes ao inves de os usarem para o bem.",
};

const episodesBySeason = {
  1: [
    {
      title: "1. O Nome do Jogo",
      description: "Quando um Super mata o amor de sua vida, o vendedor Hughie encara um mundo novo.",
      duration: "1h 2min",
      video: driveVideos.ep1,
      image: episodeImages[0],
    },
    {
      title: "2. Cherry",
      description: "Os Caras pegam um super-heroi, Luz-Estrela se vinga e Capitao Patria fica atento.",
      duration: "59min",
      video: driveVideos.ep2,
      image: episodeImages[1],
    },
    {
      title: "3. Na Fissura",
      description: "E a corrida do seculo. Trem-Bala disputa o titulo enquanto segredos aparecem.",
      duration: "55min",
      video: driveVideos.ep3,
      image: episodeImages[2],
    },
    {
      title: "4. A Femea da Especie",
      description: "Em um episodio especial, os Caras seguem uma pista perigosa.",
      duration: "56min",
      video: driveVideos.ep4,
      image: episodeImages[3],
    },
    {
      title: "5. Bom Para a Alma",
      description: "Espaco reservado para adicionar o link do episodio.",
      duration: "1h 0min",
      video: sampleVideoUrl,
      image: "./public/assets/the-boys-banner.png",
    },
  ],
  2: [],
  3: [],
  4: [],
  5: [],
};

const catalog = [
  {
    title: "Duna: Parte Dois",
    meta: "2024 | Ficcao cientifica",
    image: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
  },
  {
    title: "Godzilla Minus One",
    meta: "2023 | Acao",
    image: "https://image.tmdb.org/t/p/w500/hkxxMIGaiCTmrEArK7J56JTKUlB.jpg",
  },
  {
    title: "Divertida Mente 2",
    meta: "2024 | Animacao",
    image: "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
  },
];

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function getGoogleDriveEmbedUrl(url) {
  const fileId = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)?.[1];
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : "";
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Algo deu errado.");
  }

  return data;
}

function setView(nextView, item = null) {
  view = nextView;
  currentItem = item;
  render();
}

function render() {
  if (!auth?.token && view !== "auth") {
    view = "auth";
  }

  if (view === "auth") {
    renderAuth();
    return;
  }

  if (view === "details") {
    renderDetails();
    return;
  }

  if (view === "player") {
    renderPlayer(currentItem || episodesBySeason[1][0]);
    return;
  }

  renderHome();
}

function header() {
  const user = auth?.user || { name: "Usuario" };
  return `
    <header class="topbar">
      <a class="brand" href="#" data-view="home" aria-label="CINEVS inicio">
        <img src="./public/assets/logo.png" alt="CINEVS" />
      </a>
      <nav class="nav-pills" aria-label="Navegacao principal">
        <button class="icon-search" type="button" aria-label="Pesquisar">⌕</button>
        <a class="${view === "home" ? "active" : ""}" href="#" data-view="home">Inicio</a>
        <a href="#" data-view="details">Series</a>
        <a href="#" data-view="home">Catalogo</a>
        <a href="#" data-view="home">Minha Lista</a>
      </nav>
      <div class="profile-actions">
        <button class="notification" aria-label="Notificacoes">9+</button>
        <div class="profile-menu">
          <button class="avatar" aria-label="Perfil"><span>${user.name?.slice(0, 1).toUpperCase() || "U"}</span></button>
          <div class="profile-dropdown" role="menu">
            <button class="danger" type="button" data-action="logout">Sair da conta</button>
          </div>
        </div>
      </div>
    </header>
  `;
}

function bindHeaderActions() {
  document.querySelectorAll("[data-view]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setView(link.dataset.view);
    });
  });

  document.querySelector("[data-action='logout']")?.addEventListener("click", () => {
    localStorage.removeItem(authStorageKey);
    localStorage.removeItem(selectedProfileStorageKey);
    auth = null;
    setView("auth");
  });
}

function renderAuth() {
  root.innerHTML = `
    <main class="auth-page">
      <section class="auth-card" aria-label="Acesso CINEVS">
        <a class="auth-brand" href="#"><img src="./public/assets/logo.png" alt="CINEVS" /></a>
        <div class="auth-copy">
          <h1>Bem-vindo de volta</h1>
          <p>Entre para acessar seu conteudo.</p>
        </div>
        <div class="google-button-wrap" id="googleButton"></div>
        <div class="auth-divider"><span></span><p>Mais opcoes de login</p><span></span></div>
        <form class="auth-form" id="loginForm">
          <label class="field"><span>@</span><input name="email" type="email" placeholder="Email" autocomplete="email" /></label>
          <label class="field"><span>•</span><input name="password" type="password" placeholder="Senha" autocomplete="current-password" /></label>
          <button class="token-button">Entrar com email</button>
        </form>
        <p class="auth-message" id="authMessage" hidden></p>
      </section>
    </main>
  `;

  setupGoogleLogin();
  document.querySelector("#loginForm").addEventListener("submit", handleLogin);
}

function setupGoogleLogin() {
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = () => {
    if (!window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential,
    });
    window.google.accounts.id.renderButton(document.querySelector("#googleButton"), {
      theme: "filled_blue",
      size: "large",
      shape: "pill",
      text: "continue_with",
      width: 320,
    });
  };
  document.head.appendChild(script);
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);

  try {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    auth = data;
    localStorage.setItem(authStorageKey, JSON.stringify(data));
    setView("home");
  } catch (error) {
    showAuthMessage(error.message);
  }
}

async function handleGoogleCredential(response) {
  try {
    const data = await apiRequest("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential: response.credential }),
    });
    auth = data;
    localStorage.setItem(authStorageKey, JSON.stringify(data));
    setView("home");
  } catch (error) {
    showAuthMessage(error.message);
  }
}

function showAuthMessage(message) {
  const element = document.querySelector("#authMessage");
  element.hidden = false;
  element.textContent = message;
}

function renderHome() {
  root.innerHTML = `
    <main class="app">
      ${header()}
      <section class="hero" style="--hero-image: url('${theBoysDetail.background}')">
        <div class="hero-content">
          <p class="eyebrow">Serie em destaque</p>
          <h1>${theBoysDetail.title}</h1>
          <div class="meta-row">
            <span class="imdb">IMDb</span><strong>${theBoysDetail.rating}</strong><span class="dot"></span>
            <strong>${theBoysDetail.year}</strong><span class="dot"></span><span class="genre">Temporada 1</span>
          </div>
          <p class="description">${theBoysDetail.synopsis}</p>
          <button class="watch-button" type="button" data-view="details">▶ Assistir</button>
        </div>
      </section>
      <section class="content-section first-section">
        <div class="section-title"><h2>Continue Assistindo</h2></div>
        <div class="watch-grid">
          <article class="continue-card" data-view="details">
            <img src="${theBoysDetail.image}" alt="" />
            <div class="card-shade"></div>
            <div class="continue-info">
              <span class="last-label">Ultima serie</span>
              <h3>The Boys</h3>
              <p>Temporada 1 · Episodio 1</p>
              <div class="progress-track"><span style="width: 42%"></span></div>
            </div>
          </article>
        </div>
      </section>
      <section class="content-section">
        <div class="section-title"><h2>Catalogo em Alta</h2></div>
        <div class="poster-grid">
          ${catalog
            .map(
              (item) => `
                <article class="poster-card">
                  <img src="${item.image}" alt="" />
                  <div class="poster-info"><h3>${item.title}</h3><p>${item.meta}</p></div>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    </main>
  `;
  bindHeaderActions();
}

function renderDetails() {
  const episodes = episodesBySeason[selectedSeason] || [];
  root.innerHTML = `
    <main class="app">
      ${header()}
      <section class="title-details-page">
        <section class="title-hero-detail" style="--detail-bg: url('${theBoysDetail.background}')">
          <div class="detail-copy">
            <h1>${theBoysDetail.title}</h1>
            <div class="detail-meta">
              <span class="age-badge">${theBoysDetail.age}</span><span class="imdb">IMDb</span>
              <strong>${theBoysDetail.rating}</strong><span class="dot"></span>
              <strong>${theBoysDetail.year}</strong><span class="dot"></span>
              <strong>${theBoysDetail.seasons} temporadas</strong>
            </div>
            <p>${theBoysDetail.synopsis}</p>
            <div class="detail-genres">${theBoysDetail.genres.map((genre) => `<span>${genre}</span>`).join("")}</div>
            <div class="detail-actions">
              <button class="primary-detail-button" type="button" data-play-first>▶ Assistir T${selectedSeason}-E1</button>
              <button class="secondary-detail-button" type="button">Trailer</button>
            </div>
          </div>
        </section>
        <section class="episodes-section">
          <div class="season-pills">
            ${Object.keys(episodesBySeason)
              .map(
                (season) => `
                  <button class="${Number(season) === selectedSeason ? "active" : ""}" type="button" data-season="${season}">
                    Temporada ${season}
                  </button>
                `,
              )
              .join("")}
          </div>
          ${
            episodes.length
              ? `<div class="episodes-row">${episodes.map(episodeCard).join("")}</div>`
              : `<div class="episodes-empty"><strong>Temporada ${selectedSeason} pronta para receber episodios</strong><p>Os episodios desta temporada aparecerao aqui assim que forem adicionados.</p></div>`
          }
        </section>
      </section>
    </main>
  `;
  bindHeaderActions();

  document.querySelectorAll("[data-season]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSeason = Number(button.dataset.season);
      renderDetails();
    });
  });

  document.querySelector("[data-play-first]")?.addEventListener("click", () => {
    const firstEpisode = episodesBySeason[selectedSeason]?.[0] || episodesBySeason[1][0];
    playEpisode(firstEpisode);
  });

  document.querySelectorAll("[data-episode]").forEach((button) => {
    button.addEventListener("click", () => {
      playEpisode(episodes[Number(button.dataset.episode)]);
    });
  });
}

function episodeCard(episode, index) {
  return `
    <article class="episode-card">
      <button type="button" data-episode="${index}">
        <img src="${episode.image}" alt="" />
        <span>${episode.duration}</span>
      </button>
      <h3>${episode.title}</h3>
      <p>${episode.description}</p>
    </article>
  `;
}

function playEpisode(episode) {
  currentItem = {
    ...theBoysDetail,
    ...episode,
    episode: `Temporada ${selectedSeason} · ${episode.title}`,
  };
  setView("player", currentItem);
}

function renderPlayer(item) {
  const driveEmbedUrl = getGoogleDriveEmbedUrl(item.video || "");
  root.innerHTML = `
    <section class="${driveEmbedUrl ? "player-page drive-player-page" : "player-page"}">
      ${
        driveEmbedUrl
          ? `<iframe class="player-video player-drive-video" src="${driveEmbedUrl}" title="${item.title}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
          : `<video class="player-video" src="${item.video || sampleVideoUrl}" poster="${item.image}" controls autoplay playsinline></video>`
      }
      <div class="player-vignette"></div>
      <header class="player-topbar">
        <div class="player-title-row">
          <button class="player-round-button" type="button" data-back aria-label="Voltar">‹</button>
          <div><strong>${item.title}</strong><p>${item.episode}</p></div>
        </div>
      </header>
    </section>
  `;

  document.querySelector("[data-back]").addEventListener("click", () => setView("details"));
}

render();
