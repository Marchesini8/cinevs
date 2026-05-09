import { driveMoviesPart1 } from "./public/data/drive-movies-part1.js";

const authStorageKey = "cinevs:auth";
const selectedProfileStorageKey = "cinevs:selected-profile";
const moviePlaceholderImage = "./public/assets/movie-placeholder.svg";
const googleClientId =
  window.GOOGLE_CLIENT_ID ||
  import.meta.env?.VITE_GOOGLE_CLIENT_ID ||
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
let authMode = "login";

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
    "Na trama, conhecemos um mundo em que super-heróis são as maiores celebridades do planeta, e rotineiramente abusam dos seus poderes em vez de usá-los para o bem.",
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
      description: "Os Caras pegam um super-herói, Luz-Estrela se vinga e Capitão Pátria fica atento.",
      duration: "59min",
      video: driveVideos.ep2,
      image: episodeImages[1],
    },
    {
      title: "3. Na Fissura",
      description: "É a corrida do século. Trem-Bala disputa o título enquanto segredos aparecem.",
      duration: "55min",
      video: driveVideos.ep3,
      image: episodeImages[2],
    },
    {
      title: "4. A Femea da Especie",
      description: "Em um episódio especial, os Caras seguem uma pista perigosa.",
      duration: "56min",
      video: driveVideos.ep4,
      image: episodeImages[3],
    },
    {
      title: "5. Bom Para a Alma",
      description: "Espaço reservado para adicionar o link do episódio.",
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
    meta: "2024 | Ficção científica",
    image: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
  },
  {
    title: "Godzilla Minus One",
    meta: "2023 | Ação",
    image: "https://image.tmdb.org/t/p/w500/hkxxMIGaiCTmrEArK7J56JTKUlB.jpg",
  },
  {
    title: "Divertida Mente 2",
    meta: "2024 | Animação",
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
    tags: ["Ficção científica"],
    description: "Paul Atreides se une a Chani e aos Fremen em uma jornada de vingança, destino e sobrevivência em Arrakis.",
    background: "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    item: catalog[0],
  },
  {
    type: "Filme em destaque",
    title: "Godzilla Minus One",
    rating: "4.7",
    year: "2023",
    tags: ["Ação"],
    description: "Um Japão devastado encara uma nova ameaça colossal em meio ao trauma e a reconstrução do pós-guerra.",
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
    meta: "2026 | Animação",
    image: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
  },
  {
    title: "Avatar: Fogo e Cinzas",
    meta: "2025 | Aventura",
    image: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
  },
  {
    title: "Homem-Aranha: De Volta ao Lar",
    meta: "2017 | Ação",
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
    meta: "2021 | Animação",
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
  { title: "Cidades Assombradas", meta: "Documentário", image: "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg" },
  { title: "Rastro do Ouro", meta: "Animação", image: "https://image.tmdb.org/t/p/w500/yOm993lsJyPmBodlYjgpPwBjXP9.jpg" },
  { title: "Doc", meta: "Drama", image: "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg" },
  { title: "Terra a Deriva", meta: "Ficção científica", image: "https://image.tmdb.org/t/p/w500/u2DXsU95QXxbpT0mFWj1L0zhr3F.jpg" },
  { title: "Jovens Mães", meta: "Reality", image: "https://image.tmdb.org/t/p/w500/8w7ow9ErjEQYF0Y2yzXt6bR56Xc.jpg" },
  { title: "No Rastro do Perigo", meta: "Ação", image: "https://image.tmdb.org/t/p/w500/bQS43HSLZzMjZkcHJz4fGc7fNdz.jpg" },
  { title: "A Fortuna de Escobar", meta: "Ação", image: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg" },
  { title: "Jester", meta: "Terror", image: "https://image.tmdb.org/t/p/w500/lQYx4YspH4xu2Hm3H27xOOgQyZ7.jpg" },
  { title: "Socorro!", meta: "Terror", image: "https://image.tmdb.org/t/p/w500/4jeFXQYytChdZYE9JYO7Un87IlW.jpg" },
];

const driveCatalog = driveMoviesPart1.map((movie) => ({
  ...movie,
  title: movie.title,
  meta: "Drive | Filme",
  image: movie.image || moviePlaceholderImage,
  poster: movie.image || moviePlaceholderImage,
  backdrop: movie.backdrop || movie.image || moviePlaceholderImage,
  source: "Google Drive",
}));

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
    title: "Filmes do Google Drive",
    items: driveCatalog,
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
      { title: "Vingança no Palácio", meta: "Drama", image: "https://image.tmdb.org/t/p/w500/uUiIGztTrfDhPdAFJpr6m4UBMAd.jpg" },
      { title: "Uma Esposa Nunca Perdoa", meta: "Suspense", image: "https://image.tmdb.org/t/p/w500/e1mjopzAS2KNsvpbpahQ1a6SkSn.jpg" },
      { title: "Seu Coração Secreto", meta: "Romance", image: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg" },
      { title: "Saudades Depois do Adeus", meta: "Drama", image: "https://image.tmdb.org/t/p/w500/5ik4ATKmNtmJU6AYD0bLm56BCVM.jpg" },
    ],
  },
  {
    title: "Desenhos",
    items: [
      { title: "Os Oblongs", meta: "Desenho", image: "https://image.tmdb.org/t/p/w500/1qVjgG5BLv0OP2gAhP8MJDN5VPW.jpg" },
      { title: "Luluzinha", meta: "Desenho", image: "https://image.tmdb.org/t/p/w500/7QSM3AsgWXctWBm7OFov9dGdZgt.jpg" },
      { title: "Teletubbies", meta: "Infantil", image: "https://image.tmdb.org/t/p/w500/wBYeA0y4kYW8HKSUDAW8gYQ5Yw.jpg" },
      { title: "RoboCop: A Série Animada", meta: "Ação", image: "https://image.tmdb.org/t/p/w500/w46Vw536HwNnEzOa7J24YH9DPRS.jpg" },
      { title: "Esquadrão de Heróis", meta: "Heróis", image: "https://image.tmdb.org/t/p/w500/aG2VgPHJ9JDwWJ3O9A3W4iL5KRq.jpg" },
      { title: "Barbie: It Takes Two", meta: "Infantil", image: "https://image.tmdb.org/t/p/w500/z3y3ChnyYwY1ZSe0o5WsC8jQ3K9.jpg" },
    ],
  },
];

const topMovies = [extraPosters[0], extraPosters[1], extraPosters[2], extraPosters[3], extraPosters[4], extraPosters[8], catalog[0], catalog[1], catalog[2], extraPosters[9]];
const topSeries = [seriesCatalog[0], extraPosters[9], extraPosters[6], extraPosters[7], extraPosters[5], extraPosters[8], extraPosters[4], recentlyAdded[5], recentlyAdded[6], recentlyAdded[9]];

function movieCatalogItems() {
  return [...catalog, ...extraPosters, ...recentlyAdded, ...driveCatalog];
}

function allDisplayItems() {
  return [...seriesCatalog, ...movieCatalogItems(), ...homeRows.flatMap((row) => row.items)];
}

function findDisplayItem(title) {
  return allDisplayItems().find((item) => item.title === title) || null;
}

function isSeriesItem(item) {
  return item?.title === theBoysDetail.title || Boolean(item?.seasons);
}

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
    ...movieCatalogItems().map((item) => ({
      type: "Filme",
      title: item.title,
      meta: item.meta,
      image: item.image || moviePlaceholderImage,
      view: "details",
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
    return `<div class="search-empty"><strong>Nada encontrado</strong><span>Tente buscar outro filme ou série.</span></div>`;
  }

  return results
    .map(
      (item, index) => `
        <button class="search-result" type="button" data-search-result="${index}">
          <img src="${item.image}" alt="" onerror="this.onerror=null;this.src='${moviePlaceholderImage}';" />
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
    <article class="media-card" role="button" tabindex="0" data-media-title="${item.title}" aria-label="Abrir ${item.title}">
      <img src="${item.poster || item.image || moviePlaceholderImage}" alt="" onerror="this.onerror=null;this.src='${moviePlaceholderImage}';" />
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
    <article class="ranked-card" role="button" tabindex="0" data-media-title="${item.title}" aria-label="${index + 1}. ${item.title}">
      <span class="rank-number">${index + 1}</span>
      <img src="${item.poster || item.image || moviePlaceholderImage}" alt="" onerror="this.onerror=null;this.src='${moviePlaceholderImage}';" />
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

function getGoogleDriveFileId(url) {
  const fileId = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)?.[1];
  return fileId || "";
}

function getGoogleDriveVideoUrl(url) {
  const fileId = getGoogleDriveFileId(url);
  return fileId ? `/api/drive-video/${encodeURIComponent(fileId)}` : "";
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

function icon(name) {
  const icons = {
    user: `<svg class="menu-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>`,
    profiles: `<svg class="menu-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    settings: `<svg class="menu-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.5 19.3a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.7 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.5 4.7a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.2.37.52.69.9.9.33.18.7.28 1.08.3H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></svg>`,
    logout: `<svg class="menu-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>`,
    mail: `<svg class="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="m22 6-10 7L2 6"/></svg>`,
    lock: `<svg class="field-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    badge: `<svg class="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>`,
  };

  return icons[name] || "";
}

function normalizeAuthMode(mode) {
  authMode = mode === "register" ? "register" : "login";
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
    renderAuthPage();
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

  if (view === "account") {
    renderAccount();
    return;
  }

  if (view === "player") {
    renderPlayer(currentItem || episodesBySeason[1][0]);
    return;
  }

  renderHome();
}

function header() {
  const user = auth?.user || { name: "Usuário" };
  const userInitial = user.name?.slice(0, 1).toUpperCase() || "U";
  const avatarMarkup = user.avatarUrl
    ? `<img src="${user.avatarUrl}" alt="" />`
    : `<span>${userInitial}</span>`;
  return `
    <header class="topbar">
      <a class="brand" href="#" data-view="home" aria-label="CINEVS início">
        <img src="./public/assets/logo.png" alt="CINEVS" />
      </a>
      <nav class="nav-pills" aria-label="Navegação principal">
        <div class="search-wrap">
          <button class="icon-search" type="button" aria-label="Pesquisar" aria-expanded="false" aria-controls="searchPanel" data-search-toggle>⌕</button>
          <div class="search-panel" id="searchPanel" hidden>
            <label class="search-field">
              <span>Pesquisar</span>
              <input type="search" placeholder="Buscar filme ou série" autocomplete="off" data-search-input />
            </label>
            <div class="search-results" data-search-results>
              ${searchResultsMarkup()}
            </div>
          </div>
        </div>
        <a class="${view === "home" ? "active" : ""}" href="#" data-view="home">Início</a>
        <div class="nav-item">
          <button class="nav-trigger" type="button">Filmes</button>
          <div class="nav-dropdown" aria-label="Menu de filmes">
            <div class="nav-dropdown-main">
              <button type="button">Filmes por gênero</button>
              <button type="button">Todos os filmes</button>
              <button type="button">Filmes por ano</button>
              <button type="button">Filmes por áudio</button>
            </div>
            <div class="nav-dropdown-list">
              <button type="button">Ação</button>
              <button type="button">Aventura</button>
              <button type="button">Comédia</button>
              <button type="button">Drama</button>
              <button type="button">Ficção científica</button>
              <button type="button">Terror</button>
            </div>
          </div>
        </div>
        <div class="nav-item">
          <a class="${view === "series" ? "active" : ""} nav-trigger" href="#" data-view="series">Séries</a>
          <div class="nav-dropdown" aria-label="Menu de séries">
            <div class="nav-dropdown-main">
              <button type="button">Séries por gênero</button>
              <button type="button">Todas as séries</button>
              <button type="button">Séries por ano</button>
              <button type="button">Séries por áudio</button>
            </div>
            <div class="nav-dropdown-list">
              <button type="button">Ação</button>
              <button type="button">Aventura</button>
              <button type="button">Comédia</button>
              <button type="button">Drama</button>
              <button type="button">Ficção científica</button>
              <button type="button">Suspense</button>
            </div>
          </div>
        </div>
        <a href="#" data-view="home">Catálogo</a>
        <a href="#" data-view="home">Minha Lista</a>
        <a href="#" data-view="home">Canais</a>
      </nav>
      <div class="profile-actions">
        <div class="notification-wrap">
          <button class="notification" type="button" aria-label="Notificações" aria-expanded="false" aria-controls="notificationsPanel" data-notifications-toggle>
            <img class="bell-icon" src="./public/assets/notification-bell.png" alt="" />
            <span class="notification-badge">9+</span>
          </button>
          <div class="notifications-panel" id="notificationsPanel" aria-label="Notificações recentes" hidden>
            <div class="notifications-header">
              <strong>Notificações</strong>
              <span>9 novas</span>
            </div>
            <button class="notification-item" type="button">
              <span class="notification-dot"></span>
              <span><strong>Novo episódio disponível</strong><small>The Boys T1-E4 já está no catálogo.</small></span>
            </button>
            <button class="notification-item" type="button">
              <span class="notification-dot soft"></span>
              <span><strong>Continue assistindo</strong><small>Volte para o episódio 1 de The Boys.</small></span>
            </button>
            <button class="notification-item" type="button">
              <span class="notification-dot blue"></span>
              <span><strong>Catálogo atualizado</strong><small>Novos destaques foram adicionados hoje.</small></span>
            </button>
          </div>
        </div>
        <div class="profile-menu">
          <button class="avatar" aria-label="Perfil">${avatarMarkup}</button>
          <div class="profile-dropdown" role="menu">
            <button class="profile-summary" type="button" role="menuitem">
              <span class="menu-avatar">${avatarMarkup}</span>
              <span><strong>${user.name || "Usuário"}</strong><small>Alterar perfil</small></span>
            </button>
            <button type="button" role="menuitem" data-view="account">${icon("user")}Conta</button>
            <button type="button" role="menuitem">${icon("profiles")}Perfis</button>
            <button type="button" role="menuitem">${icon("settings")}Configurações</button>
            <button class="danger" type="button" role="menuitem" data-action="logout">${icon("logout")}Sair da conta</button>
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
        navigateWithFeedback(button, "details", result.item);
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

  const profileMenu = document.querySelector(".profile-menu");
  const profileButton = profileMenu?.querySelector(".avatar");
  const closeProfileMenu = () => {
    profileMenu?.classList.remove("is-open");
    profileButton?.setAttribute("aria-expanded", "false");
  };

  profileButton?.setAttribute("aria-expanded", "false");
  profileButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = profileMenu.classList.toggle("is-open");
    profileButton.setAttribute("aria-expanded", String(isOpen));
  });

  const handleDocumentClick = (event) => {
    if (!event.target?.closest?.(".search-wrap")) {
      closeSearch();
    }
    if (!event.target?.closest?.(".notification-wrap")) {
      closeNotifications();
    }
    if (!event.target?.closest?.(".profile-menu")) {
      closeProfileMenu();
    }
  };
  const handleDocumentKeydown = (event) => {
    if (event.key === "Escape") {
      closeSearch();
      closeNotifications();
      closeProfileMenu();
    }
  };

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);
  headerCleanup = () => {
    document.removeEventListener("click", handleDocumentClick);
    document.removeEventListener("keydown", handleDocumentKeydown);
  };
}

function renderAccount() {
  const user = auth?.user || { name: "Usuário", email: "usuario@cinevs.com" };
  const userInitial = user.name?.slice(0, 1).toUpperCase() || "U";
  const avatarMarkup = user.avatarUrl
    ? `<img src="${user.avatarUrl}" alt="" />`
    : `<span>${userInitial}</span>`;
  const lastAccess = new Date().toLocaleDateString("pt-BR");

  root.innerHTML = `
    <main class="app">
      ${header()}
      <section class="account-page">
        <div class="account-shell">
          <section class="account-hero-card">
            <div class="account-main">
              <div class="account-initial">${avatarMarkup}</div>
              <div>
                <div class="account-name-row">
                  <h1>${user.name || "Usuário"}</h1>
                  <span>Conta ativa</span>
                </div>
                <p>${user.email || "usuario@cinevs.com"}</p>
                <small>1 perfil · Último acesso ${lastAccess}</small>
              </div>
            </div>
            <div class="account-stats">
              <div><span>Conteúdo adulto</span><strong>Bloqueado</strong></div>
              <div><span>Conteúdo extra</span><strong>Inativo</strong></div>
              <div><span>Plataforma</span><strong>Não informado</strong></div>
              <div><span>Último acesso</span><strong>${lastAccess}</strong></div>
            </div>
          </section>

          <div class="account-grid">
            <section class="account-panel profiles-panel">
              <div class="panel-header">
                <h2>Perfis</h2>
                <button type="button">Gerenciar perfis <span>›</span></button>
              </div>
              <article class="profile-row-card">
                <span class="profile-photo">${avatarMarkup}</span>
                <div>
                  <h3>${user.name || "Usuário"}</h3>
                  <p>@${(user.name || "usuário").toLowerCase().replace(/\s+/g, "")} · Padrão</p>
                </div>
                <span class="use-badge">Em uso</span>
              </article>
            </section>

            <section class="account-panel subscription-panel">
              <h2>Assinatura</h2>
              <div class="subscription-empty">
                <strong>Nenhuma assinatura ativa.</strong>
                <p>Ative um plano para liberar mais telas, perfis e benefícios premium.</p>
                <button type="button">Assinar agora</button>
              </div>
            </section>
          </div>

          <section class="account-panel shared-panel">
            <div class="panel-header">
              <h2>Acesso Compartilhado</h2>
              <button type="button">Gerenciar token <span>›</span></button>
            </div>
            <div class="shared-content">
              <div>
                <strong>Gere um token para login compartilhado e remova dispositivos conectados sem sair da conta principal.</strong>
                <p>O gerenciamento completo fica disponível apenas para o dispositivo principal.</p>
              </div>
              <button class="management-button" type="button">Abrir gerenciamento <span>›</span></button>
            </div>
          </section>
        </div>
      </section>
    </main>
  `;
  bindHeaderActions();
  animatePageIn();
}

function renderAuth() {
  root.innerHTML = `
    <main class="auth-page">
      <section class="auth-card" aria-label="Acesso CINEVS">
        <a class="auth-brand" href="#"><img src="./public/assets/logo.png" alt="CINEVS" /></a>
        <div class="auth-copy">
          <h1>${pendingPlaybackItem ? "Crie sua conta para assistir" : "Bem-vindo de volta"}</h1>
          <p>${pendingPlaybackItem ? "Entre ou crie uma conta para liberar a reprodução." : "Entre para acessar seu conteúdo."}</p>
        </div>
        <div class="google-button-wrap" id="googleButton"></div>
        <div class="auth-divider"><span></span><p>Mais opções de login</p><span></span></div>
        <form class="auth-form" id="loginForm">
          <label class="field"><span>@</span><input name="email" type="email" placeholder="Email" autocomplete="email" /></label>
          <label class="field"><span>•</span><input name="password" type="password" placeholder="Senha" autocomplete="current-password" /></label>
          <button class="token-button">Entrar com email</button>
        </form>
        <button class="switch-auth" type="button" data-action="back-to-catalog">Voltar para o catálogo</button>
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

function renderAuthPage() {
  const isRegister = authMode === "register";
  const title = isRegister
    ? "Criar conta"
    : pendingPlaybackItem
      ? "Entre para assistir"
      : "Bem-vindo de volta";
  const subtitle = isRegister
    ? "Crie sua conta para salvar seu perfil e continuar assistindo."
    : pendingPlaybackItem
      ? "Entre ou crie uma conta para liberar a reprodução."
      : "Entre para acessar seu conteúdo.";

  root.innerHTML = `
    <main class="auth-page">
      <section class="auth-card" aria-label="Acesso CINEVS">
        <a class="auth-brand" href="#"><img src="./public/assets/logo.png" alt="CINEVS" /></a>
        <div class="auth-copy">
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </div>
        <div class="google-button-wrap" id="googleButton"></div>
        <div class="auth-divider"><span></span><p>${isRegister ? "Ou cadastre com email" : "Mais opções de login"}</p><span></span></div>
        <form class="auth-form" id="authForm">
          ${
            isRegister
              ? `<label class="field">${icon("badge")}<input name="name" type="text" placeholder="Nome completo" autocomplete="name" required /></label>`
              : ""
          }
          <label class="field">${icon("mail")}<input name="email" type="email" placeholder="Email" autocomplete="email" required /></label>
          <label class="field">${icon("lock")}<input name="password" type="password" placeholder="Senha" autocomplete="${isRegister ? "new-password" : "current-password"}" required /></label>
          <button class="token-button">${isRegister ? "Criar conta" : "Entrar com email"}</button>
        </form>
        <div class="auth-actions">
          <button class="switch-auth primary-switch" type="button" data-action="toggle-auth">${isRegister ? "Já tenho uma conta" : "Criar conta"}</button>
          <button class="switch-auth" type="button" data-action="back-to-catalog">Voltar para o catálogo</button>
        </div>
        <p class="auth-message" id="authMessage" hidden></p>
      </section>
    </main>
  `;

  setupGoogleLoginFromConfig();
  document.querySelector("#authForm").addEventListener("submit", isRegister ? handleRegister : handleLogin);
  document.querySelector("[data-action='toggle-auth']").addEventListener("click", () => {
    normalizeAuthMode(isRegister ? "login" : "register");
    renderAuthPage();
  });
  document.querySelector("[data-action='back-to-catalog']").addEventListener("click", () => {
    pendingPlaybackItem = null;
    normalizeAuthMode("login");
    setView("home");
  });
}

function setupGoogleLoginFromConfig() {
  if (!googleClientId) {
    const googleButton = document.querySelector("#googleButton");
    if (googleButton) {
      googleButton.innerHTML = `<button class="google-button disabled" type="button" disabled><span></span><span><strong>Google indisponível</strong><small>Configure GOOGLE_CLIENT_ID</small></span></button>`;
    }
    return;
  }

  const renderButton = () => {
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

  if (window.google?.accounts?.id) {
    renderButton();
    return;
  }

  const existingScript = document.querySelector("script[data-google-identity]");
  if (existingScript) {
    existingScript.addEventListener("load", renderButton, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.dataset.googleIdentity = "true";
  script.onload = renderButton;
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

async function handleRegister(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);

  try {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    auth = data;
    localStorage.setItem(authStorageKey, JSON.stringify(data));
    const nextItem = pendingPlaybackItem;
    pendingPlaybackItem = null;
    normalizeAuthMode("login");
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
        <button class="hero-next" type="button" aria-label="Próximo destaque" data-next-featured>›</button>
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
              <span class="last-label">Última série</span>
              <h3>The Boys</h3>
              <p>Temporada 1 · Episódio 1</p>
              <div class="progress-track"><span style="width: 42%"></span></div>
            </div>
          </article>
        </div>
      </section>
      ${homeRows.slice(0, 3).map(contentRow).join("")}
      ${rankedRow("Top 10 Filmes", topMovies)}
      ${rankedRow("Top 10 Séries", topSeries)}
      ${homeRows.slice(3).map(contentRow).join("")}
    </main>
  `;
  bindHeaderActions();
  document.querySelector("[data-play-featured]")?.addEventListener("click", (event) => {
    if (featured.item !== theBoysDetail) {
      navigateWithFeedback(event.currentTarget, "details", featured.item);
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
  bindMediaCards();
  animatePageIn();
}

function bindMediaCards() {
  document.querySelectorAll("[data-media-title]").forEach((card) => {
    const openItem = () => {
      const item = findDisplayItem(card.dataset.mediaTitle);
      if (!item) {
        return;
      }
      if (isSeriesItem(item)) {
        selectedSeason = 1;
      }
      navigateWithFeedback(card, "details", item);
    };
    card.addEventListener("click", openItem);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      openItem();
    });
  });
}

function renderSeries() {
  root.innerHTML = `
    <main class="app">
      ${header()}
      <section class="series-page">
        <div class="series-shell" tabindex="-1">
          <div class="series-header">
            <p class="eyebrow">Séries</p>
            <h1>Séries</h1>
            <p>Escolha uma série para ver os detalhes e assistir.</p>
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
  if (currentItem && !isSeriesItem(currentItem)) {
    renderMovieDetails(currentItem);
    return;
  }

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
              : `<div class="episodes-empty"><strong>Temporada ${selectedSeason} pronta para receber episódios</strong><p>Os episódios desta temporada aparecerão aqui assim que forem adicionados.</p></div>`
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

function movieMetaParts(item) {
  const [year = "2026", genre = "Filme"] = (item.meta || "").split("|").map((part) => part.trim());
  return { year, genre };
}

function movieBackdrop(item) {
  const backdrops = {
    "Duna: Parte Dois": "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    "Godzilla Minus One": "https://image.tmdb.org/t/p/w1280/fY3lD0jM5AoHJMunjGWqJ0hRteI.jpg",
    Michael: "https://image.tmdb.org/t/p/w1280/4a3oHj0wHxV5Uw95Ww7NnT4v8DU.jpg",
  };
  return item.backdrop || backdrops[item.title] || item.image || moviePlaceholderImage;
}

function movieRating(item) {
  const ratings = {
    "Duna: Parte Dois": "4.8",
    "Godzilla Minus One": "4.7",
    "Divertida Mente 2": "4.6",
    Michael: "4.9",
    "Super Mario Galaxy: O Filme": "4.5",
    "Avatar: Fogo e Cinzas": "4.6",
    "Homem-Aranha: De Volta ao Lar": "4.4",
    Panico: "4.2",
    Origem: "4.7",
  };
  return item.rating || ratings[item.title] || "4.5";
}

function movieDescription(item) {
  const descriptions = {
    "Duna: Parte Dois": "Paul Atreides se une a Chani e aos Fremen em uma jornada de vingança, destino e sobrevivência em Arrakis.",
    "Godzilla Minus One": "Um Japão devastado encara uma nova ameaça colossal em meio ao trauma e a reconstrução do pós-guerra.",
    "Divertida Mente 2": "Riley entra na adolescência e novas emoções chegam para transformar tudo dentro da sua mente.",
    Michael: "A história da vida de Michael Jackson além da música, traçando sua jornada desde a descoberta de seu talento extraordinário.",
    "Super Mario Galaxy: O Filme": "Depois de salvar o Reino dos Cogumelos, Mario e seus amigos encaram uma missão intergaláctica contra um novo vilão ameaçador.",
    Origem: "Moradores presos em uma cidade misteriosa procuram respostas enquanto tentam sobreviver aos perigos que surgem ao anoitecer.",
  };
  if (item.source === "Google Drive") {
    return "Filme hospedado no Google Drive e adicionado ao catálogo CineVS. Poster e detalhes completos podem ser atualizados depois.";
  }
  return item.description || descriptions[item.title] || "Uma seleção especial do catálogo CineVS para assistir agora, com aventura, emoção e muito entretenimento.";
}

function movieGenres(item) {
  const { genre } = movieMetaParts(item);
  const extras = {
    "Super Mario Galaxy: O Filme": ["Aventura", "Comédia", "Animação", "Fantasia", "Família"],
    "Duna: Parte Dois": ["Ficção científica", "Aventura", "Drama"],
    "Godzilla Minus One": ["Ação", "Drama", "Ficção científica"],
    Michael: ["Drama", "Música"],
  };
  return extras[item.title] || [genre, "Aventura", "Drama"].filter(Boolean).slice(0, 4);
}

function relatedMoviesFor(item) {
  const pool = movieCatalogItems().filter((movie) => movie.title !== item.title && !isSeriesItem(movie));
  return pool.slice(0, 8);
}

function renderMovieDetails(item) {
  const { year } = movieMetaParts(item);
  const genres = movieGenres(item);
  const related = relatedMoviesFor(item);
  root.innerHTML = `
    <main class="app">
      ${header()}
      <section class="movie-details-page">
        <section class="movie-hero-detail" style="--movie-bg: url('${movieBackdrop(item)}')">
          <div class="movie-detail-copy">
            <h1>${item.title}</h1>
            <div class="movie-meta">
              <span class="movie-age-badge">L</span><span class="dot"></span><span class="imdb">IMDb</span>
              <strong>${movieRating(item)}</strong><span class="dot"></span>
              <strong>${year}</strong><span class="dot"></span>
              <strong>1h 35min</strong>
            </div>
            <p>${movieDescription(item)}</p>
            <div class="detail-genres">${genres.map((genre) => `<span>${genre}</span>`).join("")}</div>
            <div class="detail-actions movie-detail-actions">
              <button class="primary-detail-button movie-watch-button" type="button" data-play-movie>&#9658; Assistir</button>
              <button class="secondary-detail-button" type="button">&#9655; Trailer</button>
              <button class="square-action" type="button" aria-label="Adicionar">+</button>
              <button class="square-action" type="button" aria-label="Curtir">&#128077;</button>
              <button class="square-action" type="button" aria-label="Compartilhar">&#8984;</button>
              <button class="square-action" type="button" aria-label="Comentar">&#9675;</button>
            </div>
          </div>
        </section>
        <section class="movie-related-section">
          <h2>Relacionados</h2>
          <div class="movie-related-row">
            ${related.map(movieRelatedCard).join("")}
          </div>
        </section>
      </section>
    </main>
  `;
  bindHeaderActions();
  bindMediaCards();
  document.querySelector("[data-play-movie]")?.addEventListener("click", (event) => {
    playMovie(item, event.currentTarget);
  });
  animatePageIn();
}

function movieRelatedCard(item) {
  return `
    <article class="movie-related-card" role="button" tabindex="0" data-media-title="${item.title}" aria-label="Abrir ${item.title}">
      <img src="${movieBackdrop(item)}" alt="" onerror="this.onerror=null;this.src='${moviePlaceholderImage}';" />
      <strong>${item.title}</strong>
    </article>
  `;
}

function playMovie(item, trigger = null) {
  currentItem = {
    ...item,
    title: item.title,
    episode: "Filme",
    video: item.video || sampleVideoUrl,
  };
  if (!auth?.token) {
    pendingPlaybackItem = currentItem;
    navigateWithFeedback(trigger, "auth", currentItem);
    return;
  }

  navigateWithFeedback(trigger, "player", currentItem);
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
  const driveVideoUrl = getGoogleDriveVideoUrl(item.video || "");
  const videoUrl = driveVideoUrl || item.video || sampleVideoUrl;
  root.innerHTML = `
    <section class="${driveVideoUrl ? "player-page drive-player-page" : "player-page"}">
      <video class="player-video ${driveVideoUrl ? "player-drive-video" : ""}" src="${videoUrl}" poster="${item.image}" controls autoplay playsinline preload="metadata"></video>
      <div class="player-vignette"></div>
      <div class="player-error" data-player-error hidden>
        Nao foi possivel iniciar este video. Confira se o arquivo do Google Drive esta publico e tente novamente.
      </div>
      <header class="player-topbar">
        <div class="player-title-row">
          <button class="player-round-button" type="button" data-back aria-label="Voltar">‹</button>
          <div><strong>${item.title}</strong><p>${item.episode}</p></div>
        </div>
      </header>
    </section>
  `;

  document.querySelector("[data-back]").addEventListener("click", (event) => {
    navigateWithFeedback(event.currentTarget, "details", currentItem);
  });
  const video = document.querySelector(".player-video");
  const errorMessage = document.querySelector("[data-player-error]");
  video?.addEventListener("error", () => {
    if (errorMessage) {
      errorMessage.hidden = false;
    }
  });
  animatePageIn();
}

render();
