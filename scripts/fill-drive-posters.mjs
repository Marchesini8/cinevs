import { readFile, writeFile } from "node:fs/promises";
import { driveMoviesPart1 } from "../public/data/drive-movies-part1.js";

const dataPath = new URL("../public/data/drive-movies-part1.js", import.meta.url);
const lookupAliases = {
  "Loja de Unicornios": "Unicorn Store",
  "Meus Vizinhos Sao um Terror": "The Burbs",
  "Pegando Fogo": "Burnt",
  "Lenda Urbana": "Urban Legend",
  "A Lenda do Cavaleiro Sem Cabeca": "Sleepy Hollow",
  "O Relutante Fundamentalista": "The Reluctant Fundamentalist",
  "Zona Fria": "Cold Zone",
  "O Lobisomem - Sem Cortes": "The Wolfman",
  "O Clube dos Canibais": "The Cannibal Club",
  "Ligados Pelo Amor": "Stuck in Love",
  "A Bruma Assassina": "The Fog",
  "Justica - Entre a Lei e a Vinganca": "Justice 2017",
  "Missao - Amsterdam": "Baantjer het begin",
  "Obsessao Perigosa": "The Neighbor 2018",
  "Leal - So Existe uma Maneira de Viver": "Leal solo hay una forma de vivir",
  "No Vale das Sombras": "In the Valley of Elah",
  "Parque do Inferno": "Hell Fest",
  "Sexta-Feira Muito Louca": "Freaky Friday",
  "Muito Alem do Ordinario": "Extra Ordinary",
  "O Instituto de Magica": "The Academy of Magic",
  "A Nova Furia do Dragao": "New Fist of Fury",
  "Destruicao - Los Angeles": "Destruction Los Angeles",
  "Nos Bracos de um Assassino": "En brazos de un asesino",
  "O Despertar de um Assassino": "Awakening the Zodiac",
};

function normalizeTitle(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(19|20)\d{2}\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scoreResult(movieTitle, result) {
  const query = normalizeTitle(movieTitle);
  const title = normalizeTitle(result.l || "");
  if (!query || !title) {
    return 0;
  }
  if (title === query) {
    return 1;
  }
  if (title.includes(query) || query.includes(title)) {
    return 0.82;
  }
  const queryWords = new Set(query.split(" ").filter((word) => word.length > 2));
  const titleWords = new Set(title.split(" ").filter((word) => word.length > 2));
  const hits = [...queryWords].filter((word) => titleWords.has(word)).length;
  return queryWords.size ? hits / queryWords.size : 0;
}

async function imdbSuggestions(title) {
  const query = normalizeTitle(lookupAliases[title] || title);
  if (!query) {
    return [];
  }
  const first = query[0];
  const url = `https://v3.sg.media-imdb.com/suggestion/${first}/${encodeURIComponent(query)}.json`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 CineVS poster lookup",
    },
  });
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.d || [];
}

async function findPoster(movie) {
  if (movie.image) {
    return {
      image: movie.image,
      backdrop: movie.backdrop || movie.image,
      imdbId: movie.imdbId,
      year: movie.year,
      matchTitle: movie.matchTitle || movie.title,
      matchScore: movie.matchScore || 1,
    };
  }

  const results = await imdbSuggestions(movie.title);
  const scored = results
    .filter((result) => result.i?.imageUrl && (result.qid === "movie" || result.q === "feature" || result.q === "TV movie"))
    .map((result) => ({
      result,
      score: scoreResult(movie.title, result),
    }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score < 0.72) {
    return tmdbPoster(movie);
  }
  return {
    image: best.result.i.imageUrl,
    backdrop: best.result.i.imageUrl,
    imdbId: best.result.id,
    year: best.result.y,
    matchTitle: best.result.l,
    matchScore: Number(best.score.toFixed(2)),
  };
}

async function tmdbPoster(movie) {
  const lookupTitle = lookupAliases[movie.title] || movie.title;
  const url = `https://www.themoviedb.org/search?query=${encodeURIComponent(lookupTitle)}&language=pt-BR`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 CineVS poster lookup",
    },
  });
  if (!response.ok) {
    return null;
  }
  const html = await response.text();
  const matches = [...html.matchAll(/https:\/\/media\.themoviedb\.org\/t\/p\/w(?:94|188)_and_h(?:141|282)_face\/([A-Za-z0-9_-]+\.(?:jpg|png))/g)];
  const path = matches.find((match) => !match[1].includes("${"))?.[1];
  if (!path) {
    return null;
  }
  return {
    image: `https://image.tmdb.org/t/p/w500/${path}`,
    backdrop: `https://image.tmdb.org/t/p/w780/${path}`,
    matchTitle: movie.title,
    matchScore: 0.78,
    posterSource: "tmdb",
  };
}

const enriched = [];
let filled = 0;

for (const movie of driveMoviesPart1) {
  try {
    const poster = await findPoster(movie);
    if (poster) {
      filled += 1;
      enriched.push({ ...movie, ...poster });
      console.log(`ok ${movie.id}: ${movie.title} -> ${poster.matchTitle}`);
    } else {
      enriched.push(movie);
      console.log(`skip ${movie.id}: ${movie.title}`);
    }
  } catch (error) {
    enriched.push(movie);
    console.log(`error ${movie.id}: ${movie.title} (${error.message})`);
  }
}

const lines = [
  "export const driveMoviesPart1 = [",
  ...enriched.map((movie) => {
    const entries = Object.entries(movie).map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`);
    return `  { ${entries.join(", ")} },`;
  }),
  "];",
  "",
];

await writeFile(dataPath, lines.join("\n"));
console.log(`filled ${filled}/${driveMoviesPart1.length}`);
