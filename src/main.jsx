import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  Bell,
  Captions,
  ChevronRight,
  Crown,
  Film,
  Flag,
  Headphones,
  Heart,
  LogOut,
  MessageCircle,
  Radio,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Maximize,
  Pause,
  Play,
  Plus,
  RotateCcw,
  RotateCw,
  Search,
  Settings,
  Share2,
  ShoppingBag,
  SkipForward,
  ThumbsUp,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import "./styles.css";

const authStorageKey = "cinevs:auth";
const profilesStorageKey = "cinevs:profiles";
const selectedProfileStorageKey = "cinevs:selected-profile";
const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "179853125831-5nnp0kn44t6c2cq5k2f6cp2c1frkeaog.apps.googleusercontent.com";

function loadGoogleIdentityScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.querySelector("script[data-google-identity]");

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

const heroMovie = {
  title: "O DIABO VESTE PRADA 2",
  year: "2026",
  rating: "3.8",
  genres: ["Comedia", "Drama"],
  description:
    "Miranda Priestly navega por sua carreira em meio ao declinio das publicacoes tradicionais de revistas. Ela se confronta com Emily Charlton, sua ex-assistente, agora uma executiva poderosa.",
  image:
    "https://image.tmdb.org/t/p/original/6YwkGolwdOMNpbTOmLjoehlVWs5.jpg",
  episode: "Filme completo",
  progress: 8,
};

const continueWatching = [
  {
    title: "The Boys",
    episode: "Temporada 1 · Episódio 1 — O Nome do Jogo",
    progress: 42,
    image: "/assets/the-boys-banner.png",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    synopsis:
      "Na trama, conhecemos um mundo em que super-heróis são as maiores celebridades do planeta, e rotineiramente abusam dos seus poderes ao invés de usá-los para o bem.",
  },
  {
    title: "Fallout",
    episode: "Ep. 4 - O Futuro",
    progress: 68,
    image:
      "https://image.tmdb.org/t/p/w780/AnsSKR9LuK0T9bAOcPVA3PUvyWj.jpg",
  },
  {
    title: "Halo",
    episode: "Ep. 2 - Reach",
    progress: 24,
    image:
      "https://image.tmdb.org/t/p/w780/d4P3cIAbGRXUkyD6p3T99X9Gr8X.jpg",
  },
];

const catalog = [
  {
    title: "Duna: Parte Dois",
    meta: "2024 | Ficcao cientifica",
    image:
      "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
  },
  {
    title: "Godzilla Minus One",
    meta: "2023 | Acao",
    image:
      "https://image.tmdb.org/t/p/w500/hkxxMIGaiCTmrEArK7J56JTKUlB.jpg",
  },
  {
    title: "Divertida Mente 2",
    meta: "2024 | Animacao",
    image:
      "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
  },
  {
    title: "Planeta dos Macacos",
    meta: "2024 | Aventura",
    image:
      "https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
  },
];

const theBoysDetail = {
  ...continueWatching[0],
  year: "2019",
  rating: "4.9",
  seasons: 5,
  age: "18",
  genres: ["Action & Adventure", "Sci-Fi & Fantasy"],
  background: "/assets/the-boys-banner.png",
  synopsis:
    "Na trama, conhecemos um mundo em que super-heróis são as maiores celebridades do planeta, e rotineiramente abusam dos seus poderes ao invés de os usarem para o bem.",
};

const theBoysEpisodes = [
  ["1. O Nome do Jogo", "Quando um Super mata o amor de sua vida, o vendedor Hughie encara um mundo novo.", "1h 2min"],
  ["2. Cherry", "Os Caras pegam um super-herói, Luz-Estrela se vinga e Capitão Pátria fica atento.", "59min"],
  ["3. Na Fissura", "É a corrida do século. Trem-Bala disputa o título enquanto segredos aparecem.", "55min"],
  ["4. A Fêmea da Espécie", "Em um episódio especial, os Caras seguem uma pista perigosa.", "56min"],
  ["5. Bom Para a Alma", "Os Caras vão para a feira Eu Acredito atrás de respostas.", "1h 0min"],
  ["6. Os Inocentes", "Os Super na América mostram sua face pública enquanto tudo desanda.", "1h 0min"],
  ["7. Sociedade da Autopreservação", "Nunca confie em um Super fracassado. Os Caras aprendem a lição.", "56min"],
  ["8. Achou!", "Final de temporada com segredos revelados e conflitos abertos.", "1h 5min"],
].map(([title, description, duration], index) => ({
  title,
  description,
  duration,
  image: index === 0 ? "/assets/the-boys-banner.png" : continueWatching[index % continueWatching.length].image,
}));

const relatedTitles = [
  ...catalog,
  {
    title: "Tartarugas Ninja",
    meta: "Ação | Aventura",
    image: "https://image.tmdb.org/t/p/w500/azL2ThbJMIkts3ZMt3j1YgBUeDB.jpg",
  },
  {
    title: "Garotos Detetives Mortos",
    meta: "Fantasia | Mistério",
    image: "https://image.tmdb.org/t/p/w500/9zcbqSxdsRMZWHYtyCd1nXPr2xq.jpg",
  },
  {
    title: "Scooby-Doo!",
    meta: "Animação | Comédia",
    image: "https://image.tmdb.org/t/p/w500/mTAiBJGg8mqEfnYHHbi37ZoRSZm.jpg",
  },
];

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

function App() {
  const [view, setView] = useState("home");
  const [playerItem, setPlayerItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [profileDraft, setProfileDraft] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState(() =>
    window.localStorage.getItem(selectedProfileStorageKey),
  );
  const [profiles, setProfiles] = useState(() => {
    const savedProfiles = window.localStorage.getItem(profilesStorageKey);
    return savedProfiles ? JSON.parse(savedProfiles) : [];
  });
  const [auth, setAuth] = useState(() => {
    const savedAuth = window.localStorage.getItem(authStorageKey);
    return savedAuth ? JSON.parse(savedAuth) : null;
  });
  const [authReady, setAuthReady] = useState(false);
  const [lastWatched, setLastWatched] = useState(null);

  useEffect(() => {
    async function validateSession() {
      if (!auth?.token) {
        setAuthReady(true);
        return;
      }

      try {
        const data = await apiRequest("/api/auth/me", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setAuth((currentAuth) => ({ ...currentAuth, user: data.user }));
        setView("profiles");
      } catch {
        window.localStorage.removeItem(authStorageKey);
        setAuth(null);
      } finally {
        setAuthReady(true);
      }
    }

    validateSession();
  }, []);

  useEffect(() => {
    const storedItem = window.localStorage.getItem("cinevs:last-watched");

    if (storedItem) {
      setLastWatched(JSON.parse(storedItem));
      return;
    }

    setLastWatched(continueWatching[0]);
  }, []);

  const watchingShelf = useMemo(() => {
    if (!lastWatched) {
      return continueWatching;
    }

    const remainingItems = continueWatching.filter(
      (item) => item.title !== lastWatched.title,
    );

    return [lastWatched, ...remainingItems];
  }, [lastWatched]);

  function handleAuthenticated(nextAuth, options = {}) {
    window.localStorage.setItem(authStorageKey, JSON.stringify(nextAuth));
    setAuth(nextAuth);

    if (options.needsProfile || !profiles.length) {
      setView("profiles");
    }
  }

  function handleLogout() {
    window.localStorage.removeItem(authStorageKey);
    window.localStorage.removeItem(selectedProfileStorageKey);
    setAuth(null);
    setView("home");
  }

  function saveProfiles(nextProfiles) {
    window.localStorage.setItem(profilesStorageKey, JSON.stringify(nextProfiles));
    setProfiles(nextProfiles);
  }

  function handleCreateProfile(profile) {
    const nextProfiles = [...profiles, profile];
    saveProfiles(nextProfiles);
    window.localStorage.setItem(selectedProfileStorageKey, profile.id);
    setSelectedProfileId(profile.id);
    setView("home");
  }

  function handleSelectProfile(profile) {
    window.localStorage.setItem(selectedProfileStorageKey, profile.id);
    setSelectedProfileId(profile.id);
    setView("home");
  }

  function handleWatch(item) {
    const nextItem = {
      ...item,
      progress: item.progress ?? 8,
      episode: item.episode ?? "Filme iniciado recentemente",
    };

    window.localStorage.setItem("cinevs:last-watched", JSON.stringify(nextItem));
    setLastWatched(nextItem);
    setPlayerItem(nextItem);
    setView("player");
  }

  function openDetails(item) {
    setDetailItem(item.title === "The Boys" ? theBoysDetail : item);
    setView("details");
  }

  if (!authReady) {
    return (
      <main className="auth-page">
        <Loader2 className="spin" size={32} />
      </main>
    );
  }

  if (!auth?.token) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <main className="app">
      {["home", "account", "details"].includes(view) && (
        <Header
          user={auth.user}
          view={view}
          onNavigate={setView}
          onLogout={handleLogout}
        />
      )}

      {view === "profiles" ? (
        <ProfileGate
          profiles={profiles}
          onAddProfile={() => setView("create-profile")}
          onSelectProfile={handleSelectProfile}
        />
      ) : view === "create-profile" ? (
        <CreateProfileScreen
          draft={profileDraft}
          onBack={() => setView("profiles")}
          onChooseAvatar={(draft) => {
            setProfileDraft(draft);
            setView("choose-avatar");
          }}
          onSave={(profile) => {
            setProfileDraft(null);
            handleCreateProfile(profile);
          }}
        />
      ) : view === "choose-avatar" ? (
        <ChooseAvatarScreen
          selectedAvatar={profileDraft?.avatar}
          onBack={() => setView("create-profile")}
          onSelect={(avatar) => {
            setProfileDraft((currentDraft) => ({ ...currentDraft, avatar }));
            setView("create-profile");
          }}
        />
      ) : view === "player" ? (
        <PlayerScreen
          item={playerItem || lastWatched || continueWatching[0]}
          onBack={() => setView(detailItem ? "details" : "home")}
        />
      ) : view === "details" ? (
        <TitleDetailsScreen
          item={detailItem || theBoysDetail}
          onBack={() => setView("home")}
          onWatch={handleWatch}
        />
      ) : view === "account" ? (
        <AccountScreen user={auth.user} profiles={profiles} selectedProfileId={selectedProfileId} />
      ) : (
        <>
          <section className="hero" style={{ "--hero-image": `url(${heroMovie.image})` }}>

        <button className="hero-next" aria-label="Proximo destaque">
          <ChevronRight size={28} />
        </button>

        <div className="hero-content">
          <p className="eyebrow">Estreia exclusiva</p>
          <h1>{heroMovie.title}</h1>

          <div className="meta-row" aria-label="Informacoes do filme">
            <span className="imdb">IMDb</span>
            <strong>{heroMovie.rating}</strong>
            <span className="dot" />
            <strong>{heroMovie.year}</strong>
            <span className="dot" />
            {heroMovie.genres.map((genre) => (
              <span className="genre" key={genre}>
                {genre}
              </span>
            ))}
          </div>

          <p className="description">{heroMovie.description}</p>

          <button className="watch-button" onClick={() => openDetails(heroMovie)}>
            <Play fill="currentColor" size={22} />
            Assistir
          </button>
        </div>

        <div className="slider-dots" aria-label="Slides do destaque">
          <span className="active" />
          <span />
          <span />
        </div>
      </section>

      <section className="content-section first-section">
        <div className="section-title">
          <h2>Continue Assistindo</h2>
          <button aria-label="Ver todos">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="watch-grid">
          {watchingShelf.map((item, index) => (
            <article className="continue-card" key={item.title} onClick={() => openDetails(item)}>
              <img src={item.image} alt="" />
              <div className="card-shade" />
              <div className="continue-info">
                {index === 0 && <span className="last-label">Ultima serie</span>}
                <h3>{item.title}</h3>
                <p>{item.episode}</p>
                <div className="progress-track">
                  <span style={{ width: `${item.progress}%` }} />
                </div>
              </div>
              <button
                className="card-play"
                aria-label={`Continuar ${item.title}`}
                onClick={(event) => {
                  event.stopPropagation();
                  openDetails(item);
                }}
              >
                <Play fill="currentColor" size={16} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-title">
          <h2>Catalogo em Alta</h2>
          <button aria-label="Ver todos">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="poster-grid">
          {catalog.map((item) => (
            <article className="poster-card" key={item.title} onClick={() => openDetails(item)}>
              <img src={item.image} alt="" />
              <div className="poster-info">
                <h3>{item.title}</h3>
                <p>{item.meta}</p>
              </div>
              <button
                className="card-play"
                aria-label={`Assistir ${item.title}`}
                onClick={(event) => {
                  event.stopPropagation();
                  openDetails(item);
                }}
              >
                <Play fill="currentColor" size={16} />
              </button>
            </article>
          ))}
        </div>
      </section>
        </>
      )}
    </main>
  );
}

function TitleDetailsScreen({ item, onBack, onWatch }) {
  const isTheBoys = item.title === "The Boys";
  const detail = isTheBoys
    ? theBoysDetail
    : {
        ...item,
        age: "14",
        rating: "4.5",
        year: item.meta?.split("|")[0]?.trim() || "2026",
        seasons: 1,
        genres: ["Drama", "Aventura"],
        background: item.image,
        synopsis:
          item.description ||
          "Uma seleção em destaque do catálogo CINEVS, pronta para entrar na sua lista e continuar assistindo.",
      };
  const [season, setSeason] = useState(1);
  const [liked, setLiked] = useState(false);
  const [favorite, setFavorite] = useState(false);

  return (
    <section className="title-details-page">
      <section className="title-hero-detail" style={{ "--detail-bg": `url(${detail.background || detail.image})` }}>
        <button className="detail-back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="detail-copy">
          <h1>{detail.title}</h1>

          <div className="detail-meta">
            <span className="age-badge">{detail.age}</span>
            <span className="imdb">IMDb</span>
            <strong>{detail.rating}</strong>
            <span className="dot" />
            <strong>{detail.year}</strong>
            <span className="dot" />
            <strong>{detail.seasons} temporadas</strong>
          </div>

          <p>{detail.synopsis}</p>

          <div className="detail-genres">
            {detail.genres.map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>

          <div className="detail-actions">
            <button className="primary-detail-button" onClick={() => onWatch(detail)}>
              <Play fill="currentColor" size={22} />
              Assistir T1-E1
            </button>
            <button className="secondary-detail-button">
              <Play size={19} />
              Trailer
            </button>
            <button
              className={favorite ? "square-action active" : "square-action"}
              aria-label="Adicionar aos favoritos"
              onClick={() => setFavorite((value) => !value)}
            >
              <Heart size={21} />
            </button>
            <button
              className={liked ? "square-action active" : "square-action"}
              aria-label="Curtir"
              onClick={() => setLiked((value) => !value)}
            >
              <ThumbsUp size={21} />
            </button>
            <button className="square-action" aria-label="Compartilhar">
              <Share2 size={21} />
            </button>
            <button className="square-action" aria-label="Comentários">
              <MessageCircle size={21} />
            </button>
          </div>
        </div>
      </section>

      <section className="episodes-section">
        <div className="season-pills">
          {[1, 2, 3, 4, 5].map((number) => (
            <button
              className={season === number ? "active" : ""}
              key={number}
              onClick={() => setSeason(number)}
            >
              Temporada {number}
            </button>
          ))}
        </div>

        <div className="episodes-row">
          {theBoysEpisodes.map((episode, index) => (
            <article className="episode-card" key={episode.title}>
              <button onClick={() => onWatch({ ...theBoysDetail, episode: episode.title })}>
                <img src={episode.image} alt="" />
                <span>{episode.duration}</span>
              </button>
              <h3>{episode.title}</h3>
              <p>{episode.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="related-section">
        <h2>Relacionados</h2>
        <div className="related-row">
          {relatedTitles.map((related) => (
            <article className="related-card" key={related.title}>
              <img src={related.image} alt="" />
              <h3>{related.title}</h3>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function ProfileGate({ profiles, onAddProfile, onSelectProfile }) {
  return (
    <main className="profiles-page">
      <section className="profiles-center">
        <h1>Quem está assistindo?</h1>

        <div className="profile-picks">
          {profiles.map((profile) => (
            <button
              className="profile-pick"
              key={profile.id}
              type="button"
              onClick={() => onSelectProfile(profile)}
            >
              <span>{profile.avatar?.label || profile.name.slice(0, 1).toUpperCase()}</span>
              <strong>{profile.name}</strong>
            </button>
          ))}

          <button className="profile-pick add-profile-pick" type="button" onClick={onAddProfile}>
            <span>
              <Plus size={46} />
            </span>
            <strong>Adicionar</strong>
          </button>
        </div>

        <button className="manage-profiles-button">Gerenciar Perfis</button>
      </section>
    </main>
  );
}

function CreateProfileScreen({ draft, onBack, onChooseAvatar, onSave }) {
  const [form, setForm] = useState(() => ({
    name: draft?.name || "",
    username: draft?.username || "",
    pin: draft?.pin || "",
    kids: draft?.kids || false,
    adult: draft?.adult || false,
    avatar: draft?.avatar || { id: "blank-1", label: "P" },
  }));

  function updateField(event) {
    const { name, value } = event.target;
    const nextValue = name === "pin" ? value.replace(/\D/g, "").slice(0, 4) : value;

    setForm((currentForm) => ({ ...currentForm, [name]: nextValue }));
  }

  function toggleField(name) {
    setForm((currentForm) => ({ ...currentForm, [name]: !currentForm[name] }));
  }

  function submitProfile(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    onSave({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      username: form.username.trim(),
      pin: form.pin,
      kids: form.kids,
      adult: form.adult,
      avatar: form.avatar,
    });
  }

  return (
    <main className="profile-form-page">
      <ProfileSubHeader title="Criar Perfil" onBack={onBack} />

      <form className="profile-form" onSubmit={submitProfile}>
        <button
          className="profile-avatar-picker"
          type="button"
          onClick={() => onChooseAvatar(form)}
        >
          <span>{form.avatar?.label || form.name.slice(0, 1).toUpperCase() || "P"}</span>
          <small>Toque para escolher um avatar</small>
        </button>

        <input
          name="name"
          value={form.name}
          onChange={updateField}
          placeholder="Nome do perfil"
          autoComplete="off"
        />
        <input
          name="username"
          value={form.username}
          onChange={updateField}
          placeholder="Nome de usuário (ex: joao_123)"
          autoComplete="off"
        />
        <input
          name="pin"
          value={form.pin}
          onChange={updateField}
          placeholder="PIN de segurança (4 dígitos, opcional)"
          inputMode="numeric"
          autoComplete="off"
        />

        <ToggleRow
          title="Perfil Infantil"
          description="Restringe conteúdo apenas para crianças"
          checked={form.kids}
          onChange={() => toggleField("kids")}
        />
        <ToggleRow
          title="Conteúdo Adulto"
          description="Permite acesso a conteúdo +18"
          checked={form.adult}
          onChange={() => toggleField("adult")}
        />

        <button className="save-profile-button">Salvar</button>
      </form>
    </main>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <button className="toggle-row" type="button" onClick={onChange}>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <span className={`switch ${checked ? "checked" : ""}`}>
        <span />
      </span>
    </button>
  );
}

function ChooseAvatarScreen({ selectedAvatar, onBack, onSelect }) {
  const groups = ["Marvel", "Disney", "Vilões Disney", "X-Men"];
  const avatars = Array.from({ length: 12 }, (_, index) => ({
    id: `blank-${index + 1}`,
    label: "",
  }));

  return (
    <main className="avatar-page">
      <ProfileSubHeader title="Escolher Avatar" onBack={onBack} />

      <div className="avatar-groups">
        {groups.map((group, groupIndex) => (
          <section className="avatar-group" key={group}>
            <h2>{group}</h2>
            <div className="avatar-row">
              {avatars.map((avatar, index) => {
                const item = {
                  ...avatar,
                  id: `${groupIndex}-${avatar.id}`,
                  label: String.fromCharCode(65 + ((groupIndex * 12 + index) % 26)),
                };

                return (
                  <button
                    className={selectedAvatar?.id === item.id ? "selected" : ""}
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item)}
                    aria-label={`Avatar ${index + 1}`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function ProfileSubHeader({ title, onBack }) {
  return (
    <header className="profile-subheader">
      <button type="button" onClick={onBack}>
        <ArrowLeft size={22} />
        Voltar
      </button>
      <h1>{title}</h1>
    </header>
  );
}

function PlayerScreen({ item, onBack }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [quality, setQuality] = useState("1080p");
  const [speed, setSpeed] = useState("1x");
  const [audio, setAudio] = useState("Portugues");
  const [subtitles, setSubtitles] = useState("Desligadas");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.playbackRate = Number(speed.replace("x", ""));
    }
  }, [volume, speed]);

  async function togglePlay() {
    const video = videoRef.current;

    if (!video) {
      setIsPlaying((current) => !current);
      return;
    }

    if (video.paused) {
      await video.play().catch(() => undefined);
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  function seekBy(seconds) {
    const video = videoRef.current;

    if (!video) {
      setCurrentTime((time) => Math.max(0, time + seconds));
      return;
    }

    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
  }

  function updateProgress(event) {
    const nextPercent = Number(event.target.value);
    const nextTime = ((duration || 0) * nextPercent) / 100;

    if (videoRef.current) {
      videoRef.current.currentTime = nextTime;
    }

    setCurrentTime(nextTime);
  }

  function toggleFullscreen() {
    const element = document.querySelector(".player-page");

    if (!document.fullscreenElement) {
      element?.requestFullscreen?.();
      return;
    }

    document.exitFullscreen?.();
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60).toString().padStart(2, "0");

    return `${minutes}:${rest}`;
  }

  return (
    <section className="player-page">
      <video
        ref={videoRef}
        className="player-video"
        poster={item.image}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source
          src={item.video || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
          type="video/mp4"
        />
      </video>

      <div className="player-vignette" />

      <header className="player-topbar">
        <div className="player-title-row">
          <button className="player-round-button" onClick={onBack} aria-label="Voltar">
            <ArrowLeft size={24} />
          </button>
          <div>
            <strong>{item.title}</strong>
            <p>{item.episode || "Temporada 1 · Episodio 1 — O Nome do Jogo"}</p>
          </div>
        </div>

        <div className="player-actions">
          <button className="player-round-button" aria-label="Episodios">
            <Film size={21} />
          </button>
          <button className="player-round-button" aria-label="Audio">
            <Headphones size={21} />
          </button>
          <button className="player-round-button" aria-label="Legendas">
            <Captions size={21} />
          </button>
          <div className="settings-wrap">
            <button
              className="player-round-button"
              aria-label="Configuracoes"
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <Settings size={21} />
            </button>
            {settingsOpen && (
              <div className="settings-panel">
                <SettingGroup
                  title="Qualidade"
                  value={quality}
                  options={["Auto", "4K", "1080p", "720p", "480p"]}
                  onChange={setQuality}
                />
                <SettingGroup
                  title="Velocidade"
                  value={speed}
                  options={["0.75x", "1x", "1.25x", "1.5x"]}
                  onChange={setSpeed}
                />
                <SettingGroup
                  title="Audio"
                  value={audio}
                  options={["Portugues", "Ingles", "Espanhol"]}
                  onChange={setAudio}
                />
                <SettingGroup
                  title="Legendas"
                  value={subtitles}
                  options={["Desligadas", "Portugues", "Ingles"]}
                  onChange={setSubtitles}
                />
              </div>
            )}
          </div>
          <button className="player-round-button" aria-label="Reportar">
            <Flag size={21} />
          </button>
        </div>
      </header>

      <aside className="player-info">
        <h1>{item.title}</h1>
        <p className="player-episode">{item.episode || "Temporada 1 · Episodio 1 — O Nome do Jogo"}</p>
        <p>{item.synopsis || "Continue assistindo de onde parou, altere qualidade, audio, legenda, velocidade e volume sem sair do player."}</p>
      </aside>

      <button
        className={`buffer-loader ${isPlaying ? "hidden" : ""}`}
        aria-label="Reproduzir"
        onClick={togglePlay}
      />

      <footer className="player-controls">
        <div className="timeline-row">
          <span>{formatTime(currentTime)}</span>
          <input
            aria-label="Progresso"
            className="timeline"
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={updateProgress}
            style={{ "--progress": `${progress}%` }}
          />
          <span>{formatTime(duration)}</span>
        </div>

        <div className="control-row">
          <div className="control-cluster">
            <button className="player-round-button" aria-label="Reiniciar" onClick={() => seekBy(-currentTime)}>
              <RotateCcw size={22} />
            </button>
            <button
              className="player-round-button volume-button"
              aria-label="Volume"
              onClick={() => setVolume((current) => (current > 0 ? 0 : 70))}
            >
              {volume > 0 ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>
            <input
              className="volume-slider"
              aria-label="Volume"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              style={{ "--volume": `${volume}%` }}
            />
          </div>

          <div className="control-cluster center-controls">
            <button className="player-round-button" aria-label="Voltar 10 segundos" onClick={() => seekBy(-10)}>
              <RotateCcw size={22} />
              <small>10</small>
            </button>
            <button className="player-play-button" aria-label="Reproduzir" onClick={togglePlay}>
              {isPlaying ? <Pause fill="currentColor" size={27} /> : <Play fill="currentColor" size={27} />}
            </button>
            <button className="player-round-button" aria-label="Avancar 10 segundos" onClick={() => seekBy(10)}>
              <RotateCw size={22} />
              <small>10</small>
            </button>
          </div>

          <div className="control-cluster right-controls">
            <button className="next-button">
              Proximo
              <SkipForward size={18} />
            </button>
            <button className="player-round-button" aria-label="Tela cheia" onClick={toggleFullscreen}>
              <Maximize size={22} />
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}

function SettingGroup({ title, value, options, onChange }) {
  return (
    <div className="setting-group">
      <p>{title}</p>
      <div>
        {options.map((option) => (
          <button
            className={option === value ? "selected" : ""}
            key={option}
            type="button"
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const googleButtonRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({ loading: false, message: "" });

  const isRegister = mode === "register";

  useEffect(() => {
    let mounted = true;

    async function setupGoogleLogin() {
      try {
        await loadGoogleIdentityScript();

        if (!mounted || !googleButtonRef.current) {
          return;
        }

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
        });
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "filled_blue",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: googleButtonRef.current.offsetWidth || 320,
        });
      } catch {
        if (mounted) {
          setStatus({
            loading: false,
            message: "Nao foi possivel carregar o login do Google.",
          });
        }
      }
    }

    setupGoogleLogin();

    return () => {
      mounted = false;
    };
  }, []);

  function updateForm(event) {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, message: "" });

    try {
      const data = await apiRequest(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(form),
      });

      onAuthenticated(data, { needsProfile: isRegister });
    } catch (error) {
      setStatus({ loading: false, message: error.message });
    }
  }

  async function handleGoogleCredential(response) {
    setStatus({ loading: true, message: "" });

    try {
      const data = await apiRequest("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential: response.credential }),
      });

      onAuthenticated(data, { needsProfile: true });
    } catch (error) {
      setStatus({ loading: false, message: error.message });
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-label="Acesso CINEVS">
        <a className="auth-brand" href="#" aria-label="CINEVS">
          <img src="/assets/logo.png" alt="CINEVS" />
        </a>

        <div className="auth-copy">
          <h1>{isRegister ? "Crie sua conta" : "Bem-vindo de volta"}</h1>
          <p>
            {isRegister
              ? "Cadastre-se para salvar seu progresso."
              : "Entre para acessar seu conteudo."}
          </p>
        </div>

        <div className="google-button-wrap" ref={googleButtonRef} />

        <div className="auth-divider">
          <span />
          <p>Mais opcoes de login</p>
          <span />
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="field">
              <User size={18} />
              <input
                name="name"
                value={form.name}
                onChange={updateForm}
                placeholder="Nome"
                autoComplete="name"
              />
            </label>
          )}

          <label className="field">
            <Mail size={18} />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateForm}
              placeholder="Email"
              autoComplete="email"
            />
          </label>

          <label className="field">
            <Lock size={18} />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateForm}
              placeholder="Senha"
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </label>

          <button className="token-button" disabled={status.loading}>
            {status.loading ? <Loader2 className="spin" size={18} /> : <KeyRound size={18} />}
            {isRegister ? "Criar conta" : "Entrar com email"}
          </button>
        </form>

        {status.message && <p className="auth-message">{status.message}</p>}

        <button
          className="switch-auth"
          type="button"
          onClick={() => {
            setMode(isRegister ? "login" : "register");
            setStatus({ loading: false, message: "" });
          }}
        >
          {isRegister ? "Ja tenho uma conta" : "Criar nova conta"}
        </button>

        <p className="terms">
          Ao entrar, voce concorda com nossos Termos de Uso e Politica de
          Privacidade.
        </p>
      </section>
    </main>
  );
}

function AccountScreen({ user, profiles = [], selectedProfileId }) {
  const initial = user?.name?.slice(0, 1).toUpperCase() || "U";
  const displayName = user?.name || "Usuario";
  const email = user?.email || "email@cinevs.com";
  const lastAccess = new Date().toLocaleDateString("pt-BR");

  return (
    <section className="account-page">
      <div className="account-shell">
        <section className="account-hero-card">
          <div className="account-main">
            <div className="account-initial">{initial}</div>
            <div>
              <div className="account-name-row">
                <h1>{displayName}</h1>
                <span>Conta ativa</span>
              </div>
              <p>{email}</p>
              <small>1 perfil · Ultimo acesso {lastAccess}</small>
            </div>
          </div>

          <div className="account-stats">
            <div>
              <span>Conteudo adulto</span>
              <strong>Bloqueado</strong>
            </div>
            <div>
              <span>Conteudo extra</span>
              <strong>Inativo</strong>
            </div>
            <div>
              <span>Plataforma</span>
              <strong>Nao informado</strong>
            </div>
            <div>
              <span>Ultimo acesso</span>
              <strong>{lastAccess}</strong>
            </div>
          </div>
        </section>

        <div className="account-grid">
          <section className="account-panel profiles-panel">
            <div className="panel-header">
              <h2>Perfis</h2>
              <button>
                Gerenciar perfis
                <ChevronRight size={18} />
              </button>
            </div>

            {(profiles.length ? profiles : [{ id: "default", name: displayName, username: email.split("@")[0], avatar: { label: initial } }]).map((profile) => (
              <article className="profile-row-card" key={profile.id}>
                <span className="profile-photo">
                  {profile.avatar?.image ? <img src={profile.avatar.image} alt="" /> : profile.avatar?.label || profile.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <h3>{profile.name}</h3>
                  <p>@{profile.username || email.split("@")[0]} · Padrao</p>
                </div>
                {profile.id === selectedProfileId && <span className="use-badge">Em uso</span>}
              </article>
            ))}
          </section>

          <section className="account-panel subscription-panel">
            <h2>Assinatura</h2>
            <div className="subscription-empty">
              <strong>Nenhuma assinatura ativa.</strong>
              <p>Ative um plano para liberar mais telas, perfis e beneficios premium.</p>
              <button>
                <Crown size={17} />
                Assinar agora
              </button>
            </div>
          </section>
        </div>

        <section className="account-panel shared-panel">
          <div className="panel-header">
            <h2>Acesso Compartilhado</h2>
            <button>
              Gerenciar token
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="shared-content">
            <div>
              <strong>
                Gere um token para login compartilhado e remova dispositivos conectados sem sair da conta principal.
              </strong>
              <p>O gerenciamento completo fica disponivel apenas para o dispositivo principal.</p>
            </div>
            <button className="management-button">
              Abrir gerenciamento
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

function Header({ user, view, onNavigate, onLogout }) {
  return (
    <header className="topbar">
      <a
        className="brand"
        href="#"
        aria-label="CINEVS inicio"
        onClick={(event) => {
          event.preventDefault();
          onNavigate("home");
        }}
      >
        <img src="/assets/logo.png" alt="CINEVS" />
      </a>

      <nav className="nav-pills" aria-label="Navegacao principal">
        <button className="icon-search" aria-label="Pesquisar">
          <Search size={22} />
        </button>
        <a
          className={view === "home" ? "active" : ""}
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("home");
          }}
        >
          Inicio
        </a>
        <a href="#">Catalogo</a>
        <a href="#">Minha Lista</a>
        <a href="#">Canais</a>
      </nav>

      <div className="profile-actions">
        <button className="notification" aria-label="Notificacoes">
          <Bell size={20} />
          <span>9+</span>
        </button>
        <div className="profile-menu">
          <button className="avatar" aria-label={`Perfil de ${user?.name || "usuario"}`}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" />
            ) : (
              <span>{user?.name?.slice(0, 1).toUpperCase() || "U"}</span>
            )}
          </button>

          <div className="profile-dropdown" role="menu" aria-label="Menu do perfil">
            <button className="profile-summary" type="button" role="menuitem">
              <span className="menu-avatar">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" />
                ) : (
                  user?.name?.slice(0, 1).toUpperCase() || "U"
                )}
              </span>
              <span>
                <strong>{user?.name || "Usuario"}</strong>
                <small>Alterar perfil</small>
              </span>
            </button>

            <button type="button" role="menuitem" onClick={() => onNavigate("account")}>
              <User size={22} />
              Conta
            </button>
            <button type="button" role="menuitem">
              <Radio size={22} />
              Feed
            </button>
            <button type="button" role="menuitem">
              <ShoppingBag size={22} />
              Loja
            </button>
            <button className="danger" type="button" role="menuitem" onClick={onLogout}>
              <LogOut size={22} />
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

createRoot(document.getElementById("root")).render(<App />);
