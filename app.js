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
let view = "home";
let selectedSeason = 1;
let currentItem = null;
let pendingPlaybackItem = null;
let headerCleanup = null;
let featuredIndex = 0;

const theBoysDetail = {
  title: "The Boys",
  year: "2019",
  rating: "4.9",
  seasons: 5,
  age: "18",
  genres: ["Action & Adventure", "Sci-Fi & Fantasy"],
  image: "./public/assets/the-boys-butcher-banner.jpg",
  background: "./public/assets/the-boys-butcher-banner.jpg",
  backgroundVideoId: "XzbWryxxn0c",
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

const seriesCatalog = [
  {
    ...theBoysDetail,
    meta: "2019 | 5 temporadas",
    poster: "./public/assets/the-boys-banner.png",
  },
];

const featuredSlides = [
  {
    type: "Serie em destaque",
    title: theBoysDetail.title,
    rating: theBoysDetail.rating,
    year: theBoysDetail.year,
    tags: ["Temporada 1"],
    description: theBoysDetail.synopsis,
    background: "https://img.youtube.com/vi/XzbWryxxn0c/maxresdefault.jpg",
    logo: "./public/assets/the-boys-logo.png",
    item: theBoysDetail,
  },
  {
    type: "Filme em destaque",
    title: "Duna: Parte Dois",
    rating: "4.8",
    year: "2024",
    tags: ["Ficcao cientifica"],
    description: "Paul Atreides se une a Chani e aos Fremen em uma jornada de vinganca, destino e sobrevivencia em Arrakis.",
    background: "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    item: catalog[0],
  },
  {
    type: "Filme em destaque",
    title: "Godzilla Minus One",
    rating: "4.7",
    year: "2023",
    tags: ["Acao"],
    description: "Um Japao devastado encara uma nova ameaca colossal em meio ao trauma e a reconstrucao do pos-guerra.",
    background: "https://image.tmdb.org/t/p/w1280/fY3lD0jM5AoHJMunjGWqJ0hRteI.jpg",
    item: catalog[1],
  },
];

const extraPosters = [
  {
    title: "Michael",
    meta: "2026 | Drama",
    image: "https://image.tmdb.org/t/p/w500/4a3oHj0wHxV5Uw95Ww7NnT4v8DU.jpg",
  },
  {
    title: "Super Mario Galaxy: O Filme",
    meta: "2026 | Animacao",
    image: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
  },
  {
    title: "Avatar: Fogo e Cinzas",
    meta: "2025 | Aventura",
    image: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
  },
  {
    title: "Homem-Aranha: De Volta ao Lar",
    meta: "2017 | Acao",
    image: "https://image.tmdb.org/t/p/w500/9Fgs1ewIZiBBTto1XDHeBN0D8ug.jpg",
  },
  {
    title: "Panico",
    meta: "2022 | Terror",
    image: "https://image.tmdb.org/t/p/w500/oadFpqhJ26yxqIlYcGioZ2W3EHN.jpg",
  },
  {
    title: "Supernatural",
    meta: "2005 | 15 temporadas",
    image: "https://image.tmdb.org/t/p/w500/KoYWXbnYuS3b0GyQPkbuexlVK9.jpg",
  },
  {
    title: "Euphoria",
    meta: "2019 | Drama",
    image: "https://image.tmdb.org/t/p/w500/3Q0hd3heuWwDWpwcDkhQOA6TYWI.jpg",
  },
  {
    title: "Invencivel",
    meta: "2021 | Animacao",
    image: "https://image.tmdb.org/t/p/w500/dMOpdkrDC5dQxqNydgKxXjBKyAc.jpg",
  },
  {
    title: "Tres Gracas",
    meta: "2025 | Drama",
    image: "https://image.tmdb.org/t/p/w500/8WUVHemHFH2ZIP6NWkwlHWsyrEL.jpg",
  },
  {
    title: "Origem",
    meta: "2022 | Suspense",
    image: "https://image.tmdb.org/t/p/w500/c5Sc5mfuAA6e3tNQllC36L7ZQ2A.jpg",
  },
];

const recentlyAdded = [
  { title: "The Nanny", meta: "Serie", image: "https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg" },
  { title: "Cidades Assombradas", meta: "Documentario", image: "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg" },
  { title: "Rastro do Ouro", meta: "Animacao", image: "https://image.tmdb.org/t/p/w500/yOm993lsJyPmBodlYjgpPwBjXP9.jpg" },
  { title: "Doc", meta: "Drama", image: "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg" },
  { title: "Terra a Deriva", meta: "Ficcao cientifica", image: "https://image.tmdb.org/t/p/w500/u2DXsU95QXxbpT0mFWj1L0zhr3F.jpg" },
  { title: "Jovens Maes", meta: "Reality", image: "https://image.tmdb.org/t/p/w500/8w7ow9ErjEQYF0Y2yzXt6bR56Xc.jpg" },
  { title: "No Rastro do Perigo", meta: "Acao", image: "https://image.tmdb.org/t/p/w500/bQS43HSLZzMjZkcHJz4fGc7fNdz.jpg" },
  { title: "A Fortuna de Escobar", meta: "Acao", image: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg" },
  { title: "Jester", meta: "Terror", image: "https://image.tmdb.org/t/p/w500/lQYx4YspH4xu2Hm3H27xOOgQyZ7.jpg" },
  { title: "Socorro!", meta: "Terror", image: "https://image.tmdb.org/t/p/w500/4jeFXQYytChdZYE9JYO7Un87IlW.jpg" },
];

const homeRows = [
  {
    title: "Adicionados Recentemente",
    items: recentlyAdded,
  },
  {
    title: "Em Alta",
    items: [seriesCatalog[0], extraPosters[9], extraPosters[0], extraPosters[1], extraPosters[6], extraPosters[5], extraPosters[2], extraPosters[3]],
  },
  {
    title: "Filmes",
    items: [catalog[0], catalog[1], catalog[2], extraPosters[0], extraPosters[1], extraPosters[2], extraPosters[3], extraPosters[4], extraPosters[8], extraPosters[9]],
  },
  {
    title: "Animes",
    items: [
      { title: "Naruto", meta: "Anime", image: "https://image.tmdb.org/t/p/w500/x3C9i4xT3XP0M1h7M4B0l5yngD3.jpg" },
      { title: "Dragon Ball", meta: "Anime", image: "https://image.tmdb.org/t/p/w500/f2zhRLqwRLrKhEMeIM7Z5buJFo3.jpg" },
      { title: "Blue Lock", meta: "Anime", image: "https://image.tmdb.org/t/p/w500/3Tazk2pJ0q1b0M2hIYkN5g5pZ8K.jpg" },
      { title: "JoJo's Bizarre Adventure", meta: "Anime", image: "https://image.tmdb.org/t/p/w500/ogAWwbh3frWtiTyyXrZaVFtqCgp.jpg" },
      { title: "Godzilla Ponto Singular", meta: "Anime", image: "https://image.tmdb.org/t/p/w500/6U0sHfe1J1rH4YcBTdX3dHh0dTX.jpg" },
      { title: "Dan Da Dan", meta: "Anime", image: "https://image.tmdb.org/t/p/w500/6qfZAOEUFIrbUH3JvePclx1nXzz.jpg" },
    ],
  },
  {
    title: "Shorts",
    items: [
      { title: "Voltar ao Passado", meta: "Romance", image: "https://image.tmdb.org/t/p/w500/8kOWDBK6XlPUzckuHDo3wwVRFwt.jpg" },
      { title: "Nova Cara", meta: "Drama", image: "https://image.tmdb.org/t/p/w500/aWxwnYoe8p2d2fcxOqtvAtJ72Rw.jpg" },
      { title: "Vinganca no Palacio", meta: "Drama", image: "https://image.tmdb.org/t/p/w500/uUiIGztTrfDhPdAFJpr6m4UBMAd.jpg" },
      { title: "Uma Esposa Nunca Perdoa", meta: "Suspense", image: "https://image.tmdb.org/t/p/w500/e1mjopzAS2KNsvpbpahQ1a6SkSn.jpg" },
      { title: "Seu Coracao Secreto", meta: "Romance", image: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg" },
      { title: "Saudades Depois do Adeus", meta: "Drama", image: "https://image.tmdb.org/t/p/w500/5ik4ATKmNtmJU6AYD0bLm56BCVM.jpg" },
    ],
  },
  {
    title: "Desenhos",
    items: [
      { title: "Os Oblongs", meta: "Desenho", image: "https://image.tmdb.org/t/p/w500/1qVjgG5BLv0OP2gAhP8MJDN5VPW.jpg" },
      { title: "Luluzinha", meta: "Desenho", image: "https://image.tmdb.org/t/p/w500/7QSM3AsgWXctWBm7OFov9dGdZgt.jpg" },
      { title: "Teletubbies", meta: "Infantil", image: "https://image.tmdb.org/t/p/w500/wBYeA0y4kYW8HKSUDAW8gYQ5Yw.jpg" },
      { title: "RoboCop: A Serie Animada", meta: "Acao", image: "https://image.tmdb.org/t/p/w500/w46Vw536HwNnEzOa7J24YH9DPRS.jpg" },
      { title: "Esquadrao de Herois", meta: "Herois", image: "https://image.tmdb.org/t/p/w500/aG2VgPHJ9JDwWJ3O9A3W4iL5KRq.jpg" },
      { title: "Barbie: It Takes Two", meta: "Infantil", image: "https://image.tmdb.org/t/p/w500/z3y3ChnyYwY1ZSe0o5WsC8jQ3K9.jpg" },
    ],
  },
];

const topMovies = [extraPosters[0], extraPosters[1], extraPosters[2], extraPosters[3], extraPosters[4], extraPosters[8], catalog[0], catalog[1], catalog[2], extraPosters[9]];
const topSeries = [seriesCatalog[0], extraPosters[9], extraPosters[6], extraPosters[7], extraPosters[5], extraPosters[8], extraPosters[4], recentlyAdded[5], recentlyAdded[6], recentlyAdded[9]];

function searchableItems() {
  return [
    ...seriesCatalog.map((item) => ({
      type: "Serie",
      title: item.title,
      meta: item.meta,
      image: item.poster || item.image,
      view: "details",
      item,
    })),
    ...catalog.map((item) => ({
      type: "Filme",
      title: item.title,
      meta: item.meta,
      image: item.image,
      view: "home",
      item,
    })),
  ];
}

function searchResultsMarkup(query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const results = searchableItems().filter((item) => {
    const searchableText = `${item.title} ${item.meta} ${item.type}`.toLowerCase();
    return !normalizedQuery || searchableText.includes(normalizedQuery);
  });

  if (!results.length) {
    return `<div class="search-empty"><strong>Nada encontrado</strong><span>Tente buscar outro filme ou serie.</span></div>`;
  }

  return results
    .map(
      (item, index) => `
        <button class="search-result" type="button" data-search-result="${index}">
          <img src="${item.image}" alt="" onerror="this.onerror=null;this.src='./public/assets/the-boys-banner.png';" />
          <span>
            <strong>${item.title}</strong>
            <small>${item.type} · ${item.meta}</small>
          </span>
        </button>
      `,
    )
    .join("");
}

function mediaCard(item) {
  return `
    <article class="media-card" role="button" tabindex="0" data-view="details" aria-label="Abrir ${item.title}">
      <img src="${item.poster || item.image}" alt="" onerror="this.onerror=null;this.src='./public/assets/the-boys-banner.png';" />
      <strong>${item.title}</strong>
    </article>
  `;
}

function contentRow(row) {
  return `
    <section class="content-section shelf-section">
      <div class="section-title"><h2>${row.title}</h2></div>
      <div class="media-row">
        ${row.items.map(mediaCard).join("")}
      </div>
    </section>
  `;
}

function rankedCard(item, index) {
  return `
    <article class="ranked-card" role="button" tabindex="0" data-view="details" aria-label="${index + 1}. ${item.title}">
      <span class="rank-number">${index + 1}</span>
      <img src="${item.poster || item.image}" alt="" onerror="this.onerror=null;this.src='./public/assets/the-boys-banner.png';" />
    </article>
  `;
}

function rankedRow(title, items) {
  return `
    <section class="content-section ranked-section">
      <div class="section-title"><h2>${title}</h2></div>
      <div class="ranked-row">
        ${items.slice(0, 10).map(rankedCard).join("")}
      </div>
    </section>
  `;
}

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function getGoogleDriveEmbedUrl(url) {
  const fileId = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)?.[1];
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview?autoplay=1` : "";
}

function getYoutubeBackgroundUrl(videoId) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: videoId,
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
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
  if (document.startViewTransition) {
    document.startViewTransition(render);
    return;
  }
  render();
}

function animatePageIn() {
  root.classList.remove("view-enter");
  requestAnimationFrame(() => {
    root.classList.add("view-enter");
    window.setTimeout(() => root.classList.remove("view-enter"), 520);
  });
}

function navigateWithFeedback(trigger, nextView, item = null) {
  trigger?.classList.add("is-selecting");
  window.setTimeout(() => setView(nextView, item), trigger ? 150 : 0);
}

function render() {
  if (!auth?.token && view === "player") {
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

  if (view === "series") {
    renderSeries();
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
  const userInitial = user.name?.slice(0, 1).toUpperCase() || "U";
  const avatarMarkup = user.avatarUrl
    ? `<img src="${user.avatarUrl}" alt="" />`
    : `<span>${userInitial}</span>`;
  return `
    <header class="topbar">
      <a class="brand" href="#" data-view="home" aria-label="CINEVS inicio">
        <img src="./public/assets/logo.png" alt="CINEVS" />
      </a>
      <nav class="nav-pills" aria-label="Navegacao principal">
        <div class="search-wrap">
          <button class="icon-search" type="button" aria-label="Pesquisar" aria-expanded="false" aria-controls="searchPanel" data-search-toggle>⌕</button>
          <div class="search-panel" id="searchPanel" hidden>
            <label class="search-field">
              <span>Pesquisar</span>
              <input type="search" placeholder="Buscar filme ou serie" autocomplete="off" data-search-input />
            </label>
            <div class="search-results" data-search-results>
              ${searchResultsMarkup()}
            </div>
          </div>
        </div>
        <a class="${view === "home" ? "active" : ""}" href="#" data-view="home">Inicio</a>
        <div class="nav-item">
          <button class="nav-trigger" type="button">Filmes</button>
          <div class="nav-dropdown" aria-label="Menu de filmes">
            <div class="nav-dropdown-main">
              <button type="button">Filmes por genero</button>
              <button type="button">Todos os filmes</button>
              <button type="button">Filmes por ano</button>
              <button type="button">Filmes por audio</button>
            </div>
            <div class="nav-dropdown-list">
              <button type="button">Acao</button>
              <button type="button">Aventura</button>
              <button type="button">Comedia</button>
              <button type="button">Drama</button>
              <button type="button">Ficcao cientifica</button>
              <button type="button">Terror</button>
            </div>
          </div>
        </div>
        <div class="nav-item">
          <a class="${view === "series" ? "active" : ""} nav-trigger" href="#" data-view="series">Series</a>
          <div class="nav-dropdown" aria-label="Menu de series">
            <div class="nav-dropdown-main">
              <button type="button">Series por genero</button>
              <button type="button">Todas as series</button>
              <button type="button">Series por ano</button>
              <button type="button">Series por audio</button>
            </div>
            <div class="nav-dropdown-list">
              <button type="button">Acao</button>
              <button type="button">Aventura</button>
              <button type="button">Comedia</button>
              <button type="button">Drama</button>
              <button type="button">Ficcao cientifica</button>
              <button type="button">Suspense</button>
            </div>
          </div>
        </div>
        <a href="#" data-view="home">Catalogo</a>
        <a href="#" data-view="home">Minha Lista</a>
        <a href="#" data-view="home">Canais</a>
      </nav>
      <div class="profile-actions">
        <div class="notification-wrap">
          <button class="notification" type="button" aria-label="Notificacoes" aria-expanded="false" aria-controls="notificationsPanel" data-notifications-toggle>
            <span class="bell-icon">&#128276;</span>
            <span class="notification-badge">9+</span>
          </button>
          <div class="notifications-panel" id="notificationsPanel" aria-label="Notificacoes recentes" hidden>
            <div class="notifications-header">
              <strong>Notificacoes</strong>
              <span>9 novas</span>
            </div>
            <button class="notification-item" type="button">
              <span class="notification-dot"></span>
              <span><strong>Novo episodio disponivel</strong><small>The Boys T1-E4 ja esta no catalogo.</small></span>
            </button>
            <button class="notification-item" type="button">
              <span class="notification-dot soft"></span>
              <span><strong>Continue assistindo</strong><small>Volte para o episodio 1 de The Boys.</small></span>
            </button>
            <button class="notification-item" type="button">
              <span class="notification-dot blue"></span>
              <span><strong>Catalogo atualizado</strong><small>Novos destaques foram adicionados hoje.</small></span>
            </button>
          </div>
        </div>
        <div class="profile-menu">
          <button class="avatar" aria-label="Perfil">${avatarMarkup}</button>
          <div class="profile-dropdown" role="menu">
            <button class="profile-summary" type="button" role="menuitem">
              <span class="menu-avatar">${avatarMarkup}</span>
              <span><strong>${user.name || "Usuario"}</strong><small>Alterar perfil</small></span>
            </button>
            <button type="button" role="menuitem"><span class="menu-icon">◎</span>Conta</button>
            <button type="button" role="menuitem"><span class="menu-icon">≋</span>Feed</button>
            <button type="button" role="menuitem"><span class="menu-icon">▣</span>Loja</button>
            <button class="danger" type="button" role="menuitem" data-action="logout"><span class="menu-icon">&#8618;</span>Sair da conta</button>
          </div>
        </div>
      </div>
    </header>
  `;
}

function bindHeaderActions() {
  headerCleanup?.();
  headerCleanup = null;

  document.querySelectorAll("[data-view]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigateWithFeedback(link, link.dataset.view);
    });

    link.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      navigateWithFeedback(link, link.dataset.view);
    });
  });

  document.querySelector("[data-action='logout']")?.addEventListener("click", () => {
    localStorage.removeItem(authStorageKey);
    localStorage.removeItem(selectedProfileStorageKey);
    auth = null;
    pendingPlaybackItem = null;
    setView("home");
  });

  const searchToggle = document.querySelector("[data-search-toggle]");
  const searchPanel = document.querySelector("#searchPanel");
  const searchInput = document.querySelector("[data-search-input]");
  const searchResults = document.querySelector("[data-search-results]");
  const closeSearch = () => {
    searchPanel?.setAttribute("hidden", "");
    searchToggle?.setAttribute("aria-expanded", "false");
  };
  const openSearch = () => {
    searchPanel.hidden = false;
    searchToggle.setAttribute("aria-expanded", "true");
    window.setTimeout(() => searchInput?.focus(), 0);
  };
  const bindSearchResults = () => {
    const currentResults = searchableItems().filter((item) => {
      const query = searchInput?.value.trim().toLowerCase() || "";
      const searchableText = `${item.title} ${item.meta} ${item.type}`.toLowerCase();
      return !query || searchableText.includes(query);
    });

    document.querySelectorAll("[data-search-result]").forEach((button) => {
      button.addEventListener("click", () => {
        const result = currentResults[Number(button.dataset.searchResult)];
        if (!result) {
          return;
        }
        closeSearch();
        if (result.type === "Serie") {
          selectedSeason = 1;
          navigateWithFeedback(button, "details", result.item);
          return;
        }
        navigateWithFeedback(button, "home");
      });
    });
  };

  searchToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = searchToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeSearch();
      return;
    }
    openSearch();
    bindSearchResults();
  });

  searchInput?.addEventListener("input", () => {
    searchResults.innerHTML = searchResultsMarkup(searchInput.value);
    bindSearchResults();
  });

  searchPanel?.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  bindSearchResults();

  const notificationsToggle = document.querySelector("[data-notifications-toggle]");
  const notificationsPanel = document.querySelector("#notificationsPanel");
  const closeNotifications = () => {
    notificationsPanel?.setAttribute("hidden", "");
    notificationsToggle?.setAttribute("aria-expanded", "false");
  };

  notificationsToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = notificationsToggle.getAttribute("aria-expanded") === "true";
    notificationsToggle.setAttribute("aria-expanded", String(!isOpen));
    notificationsPanel.hidden = isOpen;
  });

  notificationsPanel?.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  const handleDocumentClick = (event) => {
    if (!event.target?.closest?.(".search-wrap")) {
      closeSearch();
    }
    if (!event.target?.closest?.(".notification-wrap")) {
      closeNotifications();
    }
  };
  const handleDocumentKeydown = (event) => {
    if (event.key === "Escape") {
      closeSearch();
      closeNotifications();
    }
  };

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);
  headerCleanup = () => {
    document.removeEventListener("click", handleDocumentClick);
    document.removeEventListener("keydown", handleDocumentKeydown);
  };
}

function renderAuth() {
  root.innerHTML = `
    <main class="auth-page">
      <section class="auth-card" aria-label="Acesso CINEVS">
        <a class="auth-brand" href="#"><img src="./public/assets/logo.png" alt="CINEVS" /></a>
        <div class="auth-copy">
          <h1>${pendingPlaybackItem ? "Crie sua conta para assistir" : "Bem-vindo de volta"}</h1>
          <p>${pendingPlaybackItem ? "Entre ou crie uma conta para liberar a reproducao." : "Entre para acessar seu conteudo."}</p>
        </div>
        <div class="google-button-wrap" id="googleButton"></div>
        <div class="auth-divider"><span></span><p>Mais opcoes de login</p><span></span></div>
        <form class="auth-form" id="loginForm">
          <label class="field"><span>@</span><input name="email" type="email" placeholder="Email" autocomplete="email" /></label>
          <label class="field"><span>•</span><input name="password" type="password" placeholder="Senha" autocomplete="current-password" /></label>
          <button class="token-button">Entrar com email</button>
        </form>
        <button class="switch-auth" type="button" data-action="back-to-catalog">Voltar para o catalogo</button>
        <p class="auth-message" id="authMessage" hidden></p>
      </section>
    </main>
  `;

  setupGoogleLogin();
  document.querySelector("#loginForm").addEventListener("submit", handleLogin);
  document.querySelector("[data-action='back-to-catalog']").addEventListener("click", () => {
    pendingPlaybackItem = null;
    setView("home");
  });
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
    const nextItem = pendingPlaybackItem;
    pendingPlaybackItem = null;
    setView(nextItem ? "player" : "home", nextItem);
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
    const nextItem = pendingPlaybackItem;
    pendingPlaybackItem = null;
    setView(nextItem ? "player" : "home", nextItem);
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
  const featured = featuredSlides[featuredIndex];
  root.innerHTML = `
    <main class="app">
      ${header()}
      <section class="hero" style="--hero-image: url('${featured.background}')">
        <div class="hero-content">
          <p class="eyebrow">${featured.type}</p>
          ${
            featured.logo
              ? `<img class="title-logo hero-title-logo" src="${featured.logo}" alt="${featured.title}" />`
              : `<h1 class="hero-text-title">${featured.title}</h1>`
          }
          <div class="meta-row">
            <span class="imdb">IMDb</span><strong>${featured.rating}</strong><span class="dot"></span>
            <strong>${featured.year}</strong><span class="dot"></span>${featured.tags.map((tag) => `<span class="genre">${tag}</span>`).join("")}
          </div>
          <p class="description">${featured.description}</p>
          <button class="watch-button" type="button" data-play-featured>▶ Assistir</button>
        </div>
        <button class="hero-next" type="button" aria-label="Proximo destaque" data-next-featured>›</button>
        <div class="slider-dots" aria-label="Destaques">
          ${featuredSlides.map((_, index) => `<button class="${index === featuredIndex ? "active" : ""}" type="button" aria-label="Destaque ${index + 1}" data-featured-dot="${index}"></button>`).join("")}
        </div>
      </section>
      <section class="content-section first-section">
        <div class="section-title"><h2>Continue Assistindo</h2></div>
        <div class="watch-grid">
          <article class="continue-card" role="button" tabindex="0" data-view="details" aria-label="Abrir The Boys">
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
      ${homeRows.slice(0, 3).map(contentRow).join("")}
      ${rankedRow("Top 10 Filmes", topMovies)}
      ${rankedRow("Top 10 Series", topSeries)}
      ${homeRows.slice(3).map(contentRow).join("")}
    </main>
  `;
  bindHeaderActions();
  document.querySelector("[data-play-featured]")?.addEventListener("click", (event) => {
    if (featured.item !== theBoysDetail) {
      navigateWithFeedback(event.currentTarget, "home");
      return;
    }
    const firstEpisode = episodesBySeason[1][0];
    selectedSeason = 1;
    playEpisode(firstEpisode, event.currentTarget);
  });
  document.querySelector("[data-next-featured]")?.addEventListener("click", () => {
    featuredIndex = (featuredIndex + 1) % featuredSlides.length;
    renderHome();
  });
  document.querySelectorAll("[data-featured-dot]").forEach((button) => {
    button.addEventListener("click", () => {
      featuredIndex = Number(button.dataset.featuredDot);
      renderHome();
    });
  });
  animatePageIn();
}

function renderSeries() {
  root.innerHTML = `
    <main class="app">
      ${header()}
      <section class="series-page">
        <div class="series-shell" tabindex="-1">
          <div class="series-header">
            <p class="eyebrow">Series</p>
            <h1>Series</h1>
            <p>Escolha uma serie para ver os detalhes e assistir.</p>
          </div>
          <div class="series-grid">
            ${seriesCatalog
              .map(
                (item) => `
                  <article class="series-card" role="button" tabindex="0" data-series-title="${item.title}" aria-label="Abrir ${item.title}">
                    <img src="${item.poster || item.image}" alt="" />
                    <div class="series-card-shade"></div>
                    <div class="series-card-info">
                      <strong>${item.title}</strong>
                      <span>${item.meta}</span>
                    </div>
                  </article>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>
    </main>
  `;
  bindHeaderActions();
  document.querySelector(".series-shell")?.focus({ preventScroll: true });
  document.querySelectorAll("[data-series-title]").forEach((card) => {
    const openSeries = () => navigateWithFeedback(card, "details", theBoysDetail);
    card.addEventListener("click", openSeries);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      openSeries();
    });
  });
  animatePageIn();
}

function renderDetails() {
  const episodes = episodesBySeason[selectedSeason] || [];
  const backgroundVideoUrl = getYoutubeBackgroundUrl(theBoysDetail.backgroundVideoId);
  root.innerHTML = `
    <main class="app">
      ${header()}
      <section class="title-details-page">
        <section class="title-hero-detail" style="--detail-bg: url('${theBoysDetail.background}')">
          <div class="background-video detail-background-video" aria-hidden="true">
            <iframe src="${backgroundVideoUrl}" title="" allow="autoplay; encrypted-media; picture-in-picture"></iframe>
            <span class="background-video-shield"></span>
          </div>
          <div class="detail-copy">
            <img class="title-logo detail-title-logo" src="./public/assets/the-boys-logo.png" alt="${theBoysDetail.title}" />
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
      button.classList.add("is-selecting");
      selectedSeason = Number(button.dataset.season);
      window.setTimeout(renderDetails, 120);
    });
  });

  document.querySelector("[data-play-first]")?.addEventListener("click", (event) => {
    const firstEpisode = episodesBySeason[selectedSeason]?.[0] || episodesBySeason[1][0];
    playEpisode(firstEpisode, event.currentTarget);
  });

  document.querySelectorAll("[data-episode]").forEach((button) => {
    button.addEventListener("click", (event) => {
      playEpisode(episodes[Number(button.dataset.episode)], event.currentTarget);
    });
  });
  animatePageIn();
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

function playEpisode(episode, trigger = null) {
  currentItem = {
    ...theBoysDetail,
    ...episode,
    episode: `Temporada ${selectedSeason} · ${episode.title}`,
  };
  if (!auth?.token) {
    pendingPlaybackItem = currentItem;
    navigateWithFeedback(trigger, "auth", currentItem);
    return;
  }

  navigateWithFeedback(trigger, "player", currentItem);
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

  document.querySelector("[data-back]").addEventListener("click", (event) => {
    navigateWithFeedback(event.currentTarget, "details");
  });
  animatePageIn();
}

render();
