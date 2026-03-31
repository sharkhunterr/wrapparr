import CategorySlide from "./slides/CategorySlide"
import PodiumSlide from "./slides/PodiumSlide"
import ServiceStatsSlide from "./slides/ServiceStatsSlide"
import ServiceDeepSlide from "./slides/ServiceDeepSlide"
import FilmTimelineSlide from "./slides/FilmTimelineSlide"
import WorldMapSlide from "./slides/WorldMapSlide"
import RatingsSlide from "./slides/RatingsSlide"
import BudgetSlide from "./slides/BudgetSlide"
import FilmStatsEnrichedSlide from "./slides/FilmStatsEnrichedSlide"
import FavoriteActorsSlide from "./slides/FavoriteActorsSlide"
import FavoriteDirectorsSlide from "./slides/FavoriteDirectorsSlide"
import GenresSlide from "./slides/GenresSlide"
import CompareSlide from "./slides/CompareSlide"
import CompareServiceSlide from "./slides/CompareServiceSlide"
import ServerRankingSlide from "./slides/ServerRankingSlide"
import OverseerrRequestsSlide from "./slides/OverseerrRequestsSlide"
import OverseerrMatchSlide from "./slides/OverseerrMatchSlide"
import OverseerrCommunitySlide from "./slides/OverseerrCommunitySlide"
import FinaleSlide from "./slides/FinaleSlide"
import OnboardingSlide from "./slides/OnboardingSlide"
import { CommunityActivitySlide, CommunityTopSlide, CommunityMostViewedSlide, CommunityRankingsSlide, CommunityGenresSlide, CommunityCompareSlide } from "./slides/community"

const JOKES = {
  tautulli: [
    "Voyons combien de films et series cette annee...",
    "Les popcorns etaient au rendez-vous.",
    "Il a ri, pleure, et probablement mange des chips.",
    "Voici le podium officiel",
  ],
  jellyfin: [
    "Jellyfin a tourne a plein regime cette annee...",
    "Des heures de streaming en continu.",
    "Le serveur n'a pas chome.",
    "Le verdict tombe",
  ],
  romm: [
    "Les manettes ont chauffees cette annee...",
    "Des sessions epiques en perspective.",
    "Les voisins ont entendu les victoires.",
    "Voici le top du gamepad",
  ],
  audiobookshelf: [
    "Des heures d'ecoute cette annee...",
    "Principalement en mode concentration.",
    "Le cerveau a voyage dans des univers differents.",
    "Le palmares s'affiche",
  ],
  komga: [
    "Des volumes de manga lus cette annee.",
    "Plusieurs volumes par mois. Respect.",
    "Au moins 4 arcs qui font pleurer.",
    "Le podium des cases s'illumine",
  ],
  booklore: [
    "Des livres devores cette annee...",
    "La bibliotheque s'agrandit.",
    "Des histoires qui marquent.",
    "Le palmares litteraire",
  ],
}

// Service config for slide generation (matches prototype SLIDES_DEF colors)
const SERVICE_SLIDE_CONFIG = {
  tautulli: { icon: "🎬", label: "FILMS", sub: "Cinema · Documentaires", accent: "#E5A00D", bgCat: "#0c0600", bgPod: "#070400", bgStats: "#100900", statKey: "plays", statLabel: "vues", statSuffix: "", hasSeries: true, seriesIcon: "📺", seriesLabel: "SERIES", seriesSub: "Series TV · Sagas", seriesAccent: "#fb923c", seriesBgCat: "#0a0200", seriesBgPod: "#080200", seriesBgStats: "#120600" },
  plex: { icon: "🎬", label: "FILMS", sub: "Cinema · Documentaires", accent: "#E5A00D", bgCat: "#0c0600", bgPod: "#070400", bgStats: "#100900", statKey: "plays", statLabel: "vues", statSuffix: "", hasSeries: true, seriesIcon: "📺", seriesLabel: "SERIES", seriesSub: "Series TV · Sagas", seriesAccent: "#fb923c", seriesBgCat: "#0a0200", seriesBgPod: "#080200", seriesBgStats: "#120600" },
  jellyfin: { icon: "📺", label: "JELLYFIN", sub: "Films · Series", accent: "#00a4dc", bgCat: "#000a14", bgPod: "#000812", bgStats: "#000d18", statKey: "plays", statLabel: "vues", statSuffix: "" },
  romm: { icon: "🎮", label: "JEUX VIDEO", sub: "Switch · PC · Retrogaming", accent: "#34d399", bgCat: "#010a05", bgPod: "#010806", bgStats: "#020f08", statKey: "g", statLabel: "plateforme", statSuffix: "" },
  audiobookshelf: { icon: "🎧", label: "LIVRES AUDIO", sub: "Sci-Fi · Thriller · Post-Apo", accent: "#fb923c", bgCat: "#0a0300", bgPod: "#080300", bgStats: "#110500", statKey: "h", statLabel: "heures", statSuffix: "h" },
  komga: { icon: "📚", label: "MANGA", sub: "Shonen · Seinen · Dark Fantasy", accent: "#c084fc", bgCat: "#060012", bgPod: "#050010", bgStats: "#0a0018", statKey: "vols", statLabel: "volumes", statSuffix: "" },
  booklore: { icon: "📖", label: "LIVRES", sub: "Romans · Essais · BD", accent: "#a78bfa", bgCat: "#050010", bgPod: "#040008", bgStats: "#060012", statKey: "pages", statLabel: "pages", statSuffix: "" },
}

function getSlideConfig(slideSettings, slideId) {
  if (!slideSettings || typeof slideSettings !== "object") return {}
  const cfg = slideSettings[slideId] || {}
  const { enabled, ...rest } = cfg
  return rest
}

function isSlideEnabled(slideSettings, slideId) {
  if (!slideSettings || typeof slideSettings !== "object") return true
  const cfg = slideSettings[slideId]
  if (!cfg) return true
  return cfg.enabled !== false
}

function getAccentOverride(slideSettings, slideId) {
  if (!slideSettings || typeof slideSettings !== "object") return ""
  return slideSettings[slideId]?.accentOverride || ""
}

function buildSlides(data, theme, slideConfigs, user, year, myRecapUserId) {
  if (!data) return []
  const slideSettings = slideConfigs?.settings || slideConfigs || {}
  const slideOrder = slideConfigs?.order || []
  const sc = slideSettings

  // Helpers for reading slide config overrides
  const resolveAccent = (slideId, defaultAccent) => getAccentOverride(sc, slideId) || defaultAccent
  const catProps = (slideId, defaults) => {
    const cfg = getSlideConfig(sc, slideId)
    return {
      icon: cfg.customIcon || defaults.icon,
      label: cfg.customLabel || defaults.label,
      sub: cfg.customSub || defaults.sub,
    }
  }
  const podJokes = (slideId, defaultJokes) => {
    const cfg = getSlideConfig(sc, slideId)
    // jokes stored as commentary format [{trigger, phrases}] → flatten to string array
    const custom = cfg.jokes
    if (Array.isArray(custom) && custom.length > 0) {
      if (typeof custom[0] === "string") return custom
      return custom.flatMap((g) => g.phrases || []).filter(Boolean)
    }
    return defaultJokes
  }
  const palette = theme?.palette || {}
  const primary = palette.primary || "#E5A00D"
  const baseBg = palette.background || "#05050e"
  const accents = palette.accents || {}
  const userName = user?.display_name || ""
  const globalStats = data.global || {}

  const slides = []

  // 0 — Intro
  slides.push({
    id: "intro", accent: primary, bg: baseBg, fullscreen: false,
    _introProps: { accent: primary, userName, year, hasComparison: !!data.comparison },
  })

  // 1 — Onboarding (slideCount injected later)
  slides.push({
    id: "onboarding", accent: primary, bg: baseBg,
    _onboardingProps: { accent: primary, year, hasComparison: !!data.comparison },
  })

  // Per-service: Category → Podium → Stats → Deep
  const serviceOrder = ["tautulli", "plex", "jellyfin", "romm", "audiobookshelf", "komga", "booklore"]
  const seen = new Set()

  for (const svc of serviceOrder) {
    const svcData = data[svc]
    if (!svcData) continue
    // Skip if we already added plex-like slides (tautulli = plex)
    const svcKey = svc === "tautulli" ? "plex" : svc
    if (seen.has(svcKey)) continue
    seen.add(svcKey)

    // Map service to theme accent key
    const ACCENT_KEY_MAP = { tautulli: "films", plex: "films", jellyfin: "films", audiobookshelf: "audio" }
    const accentKey = ACCENT_KEY_MAP[svc] || svc

    const cfg = SERVICE_SLIDE_CONFIG[svc] || {}
    const svcAccent = accents[accentKey] || cfg.accent || primary
    const jokes = JOKES[svc] || []

    // ── For services with separate films+series (tautulli, plex): split into 2 sections ──
    if (cfg.hasSeries) {
      const filmsExtra = svcData.extra?.films || {}
      const seriesExtra = svcData.extra?.series || {}
      const filmsTop = (filmsExtra.top || []).slice(0, 4)
      const seriesTop = (seriesExtra.top || []).slice(0, 4)

      // Build a films-only data overlay for slides that read data.total_items etc.
      const filmsGenres = filmsExtra.genres || svcData.extra?.top_genres || svcData.genres || []
      const seriesGenres = seriesExtra.genres || svcData.extra?.series_genres || []
      const filmsData = { ...svcData, top: filmsTop, genres: filmsGenres, total_items: filmsExtra.total || 0, total_hours: filmsExtra.hours || 0 }
      const seriesData = { ...svcData, top: seriesTop, genres: seriesGenres, total_items: seriesExtra.episodes || 0, total_hours: seriesExtra.hours || 0,
        extra: { ...svcData.extra, films: seriesExtra, actors: seriesExtra.actors || [], directors: seriesExtra.directors || [], ratings: seriesExtra.ratings || [], countries: seriesExtra.countries || [], peak_stats: seriesExtra.peak_stats || {} },
      }

      // ═══ FILMS SECTION ═══
      slides.push({
        id: "cat-" + svc, accent: svcAccent, bg: cfg.bgCat || baseBg, cat: true, fullscreen: true,
        component: <CategorySlide accent={svcAccent} {...catProps("cat-" + svc, cfg)} />,
      })

      const filmsBackdrop = svcData.extra?.backdrop || (filmsTop[0]?.art) || ""
      const filmsCat = catProps("cat-" + svc, cfg)
      if (filmsTop.length >= 2) {
        slides.push({
          id: svc + "-pod", accent: svcAccent, bg: cfg.bgPod || baseBg, pod: true, fullscreen: true,
          component: <PodiumSlide accent={svcAccent} bg={cfg.bgPod || baseBg} data={filmsTop} title={"Top " + filmsCat.label + " " + year} icon={filmsCat.icon} jokes={podJokes(svc + "-pod", jokes)} statLabel={cfg.statLabel} statKey={cfg.statKey} statSuffix={cfg.statSuffix} backdrop={filmsBackdrop} config={getSlideConfig(sc, svc + "-pod")} />,
        })
      }

      // Deep slide (habitudes) — uses combined data
      if (svcData.day_of_week?.length > 0 || svcData.time_of_day?.length > 0 || svcData.ranking?.length > 0) {
        slides.push({
          id: svc + "-deep", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <ServiceDeepSlide accent={svcAccent} label={cfg.label} icon={cfg.icon} data={svcData} me={userName} year={year} />,
        })
      }

      // Film-specific slides (timeline, worldmap, ratings, actors, directors)
      const hasYears = filmsTop.some((t) => t.y && t.y > 1890)
      if (hasYears) {
        slides.push({
          id: svc + "-timeline", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <FilmTimelineSlide accent={svcAccent} data={svcData} year={year} config={getSlideConfig(sc, svc + "-timeline")} />,
        })
      }

      const countryData = svcData.extra?.countries || []
      if (countryData.length > 0) {
        slides.push({
          id: svc + "-worldmap", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <WorldMapSlide accent={svcAccent} data={svcData} year={year} config={getSlideConfig(sc, svc + "-worldmap")} />,
        })
      }

      const ratingsData = svcData.extra?.ratings || []
      if (ratingsData.length >= 2) {
        const ratingsBrackets = getSlideConfig(sc, svc + "-ratings")?.brackets
        const ratingsConfig = { ...getSlideConfig(sc, svc + "-ratings") }
        if (ratingsBrackets) {
          ratingsConfig.brackets = ratingsBrackets.map((b) => ({
            min: b.min, max: b.max, label: b.name, emoji: b.emoji,
          }))
        }
        slides.push({
          id: svc + "-ratings", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <RatingsSlide accent={svcAccent} data={svcData} year={year} config={ratingsConfig} />,
        })
      }

      // Budget slide (if budget data available)
      const budgetData = svcData.extra?.budgets
      if (budgetData && budgetData.count > 0) {
        slides.push({
          id: svc + "-budgets", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <BudgetSlide accent={svcAccent} data={svcData} year={year} config={getSlideConfig(sc, svc + "-budgets")} />,
        })
      }

      const actorsData = svcData.extra?.actors || []
      const actorsConfig = getSlideConfig(sc, svc + "-actors")
      if (actorsData.filter((a) => a.count >= (actorsConfig?.minAppearances || 2)).length > 0) {
        slides.push({
          id: svc + "-actors", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <FavoriteActorsSlide accent={svcAccent} data={svcData} year={year} config={actorsConfig} />,
        })
      }

      const directorsData = svcData.extra?.directors || []
      const directorsConfig = getSlideConfig(sc, svc + "-directors")
      if (directorsData.filter((d) => d.count >= (directorsConfig?.minAppearances || 2)).length > 0) {
        slides.push({
          id: svc + "-directors", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <FavoriteDirectorsSlide accent={svcAccent} data={svcData} year={year} config={directorsConfig} />,
        })
      }

      // Genres slide (films section)
      const topGenres = svcData.extra?.top_genres || svcData.genres || []
      if (topGenres.length >= 3) {
        slides.push({
          id: svc + "-genres", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <GenresSlide accent={svcAccent} genres={topGenres} year={year} config={getSlideConfig(sc, svc + "-genres")} />,
        })
      }

      // Comparison slide (films)
      const filmCompare = data.comparison?.[svc]
      if (filmCompare) {
        const bilanConfig = getSlideConfig(sc, svc + "-stats-enriched")
        slides.push({
          id: svc + "-compare", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <CompareServiceSlide accent={svcAccent} compareData={filmCompare} year={year} mediaType="films" config={getSlideConfig(sc, svc + "-compare")} bilanCategories={bilanConfig.categories} />,
        })
      }

      // Stats enriched / bilan cinema (fin de section films)
      slides.push({
        id: svc + "-stats-enriched", accent: svcAccent, bg: cfg.bgStats || baseBg,
        component: <FilmStatsEnrichedSlide accent={svcAccent} label={cfg.label} icon={cfg.icon} data={filmsData} year={year} config={getSlideConfig(sc, svc + "-stats-enriched")} />,
      })

      // ═══ SERIES SECTION ═══
      if (seriesTop.length >= 1) {
        const seriesAccent = accents.series || cfg.seriesAccent || "#fb923c"
        const seriesExtraData = svcData.extra?.series || {}

        // Category
        slides.push({
          id: "cat-" + svc + "-series", accent: seriesAccent, bg: cfg.seriesBgCat || baseBg, cat: true, fullscreen: true,
          component: <CategorySlide accent={seriesAccent} {...catProps("cat-" + svc + "-series", { icon: cfg.seriesIcon, label: cfg.seriesLabel, sub: cfg.seriesSub })} />,
        })

        // Podium
        const seriesCat = catProps("cat-" + svc + "-series", { icon: cfg.seriesIcon, label: cfg.seriesLabel, sub: cfg.seriesSub })
        if (seriesTop.length >= 2) {
          const seriesBackdrop = (seriesTop[0]?.art) || ""
          const defaultSeriesJokes = ["Voyons quelles series t'ont accroche...", "Des episodes enchaines sans fin.", "Le binge-watching, un art de vivre.", "Voici ton podium series"]
          slides.push({
            id: svc + "-series-pod", accent: seriesAccent, bg: cfg.seriesBgPod || baseBg, pod: true, fullscreen: true,
            component: <PodiumSlide accent={seriesAccent} bg={cfg.seriesBgPod || baseBg} data={seriesTop} title={"Top " + seriesCat.label + " " + year} icon={seriesCat.icon} jokes={podJokes(svc + "-series-pod", defaultSeriesJokes)} statLabel="episodes" statKey="ep" statSuffix="" backdrop={seriesBackdrop} config={getSlideConfig(sc, svc + "-series-pod")} />,
          })
        }

        // Habitudes series
        if (seriesExtraData.day_of_week?.length > 0 || seriesExtraData.time_of_day?.length > 0) {
          slides.push({
            id: svc + "-series-deep", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <ServiceDeepSlide accent={seriesAccent} label={cfg.seriesLabel} icon={cfg.seriesIcon} data={{ ...svcData, ...seriesData, extra: { ...svcData.extra, films: seriesExtraData } }} me={userName} year={year} />,
          })
        }

        // Profil seriephile (timeline)
        const seriesHasYears = seriesTop.some((t) => t.y && t.y > 1890)
        if (seriesHasYears) {
          slides.push({
            id: svc + "-series-timeline", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <FilmTimelineSlide accent={seriesAccent} data={{ ...svcData, top: seriesTop, extra: { ...svcData.extra, films: { top: (seriesExtraData.top || seriesTop) } } }} year={year} config={getSlideConfig(sc, svc + "-series-timeline")} mediaType="series" />,
          })
        }

        // Carte du monde series
        const seriesCountries = seriesExtraData.countries || []
        if (seriesCountries.length > 0) {
          slides.push({
            id: svc + "-series-worldmap", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <WorldMapSlide accent={seriesAccent} data={{ extra: { countries: seriesCountries } }} year={year} config={getSlideConfig(sc, svc + "-series-worldmap")} mediaType="series" />,
          })
        }

        // Notes series
        const seriesRatings = seriesExtraData.ratings || []
        if (seriesRatings.length >= 2) {
          slides.push({
            id: svc + "-series-ratings", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <RatingsSlide accent={seriesAccent} data={{ extra: { ratings: seriesRatings, films: { top: seriesExtraData.top || [] } }, top: seriesTop }} year={year} config={getSlideConfig(sc, svc + "-series-ratings")} mediaType="series" />,
          })
        }

        // Acteurs series
        const seriesActors = seriesExtraData.actors || svcData.extra?.series_actors || []
        const seriesActorsConfig = getSlideConfig(sc, svc + "-series-actors")
        if (seriesActors.filter((a) => a.count >= (seriesActorsConfig?.minAppearances || 2)).length > 0) {
          slides.push({
            id: svc + "-series-actors", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <FavoriteActorsSlide accent={seriesAccent} data={{ extra: { actors: seriesActors } }} year={year} config={seriesActorsConfig} />,
          })
        }

        // Realisateurs series
        const seriesDirectors = seriesExtraData.directors || []
        const seriesDirectorsConfig = getSlideConfig(sc, svc + "-series-directors")
        if (seriesDirectors.filter((d) => d.count >= (seriesDirectorsConfig?.minAppearances || 2)).length > 0) {
          slides.push({
            id: svc + "-series-directors", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <FavoriteDirectorsSlide accent={seriesAccent} data={{ extra: { directors: seriesDirectors } }} year={year} config={seriesDirectorsConfig} />,
          })
        }

        // Genres series
        const seriesGenres = seriesExtraData.genres || svcData.extra?.series_genres || []
        if (seriesGenres.length >= 3) {
          slides.push({
            id: svc + "-series-genres", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <GenresSlide accent={seriesAccent} genres={seriesGenres} year={year} config={{ displayMode: "race", ...getSlideConfig(sc, svc + "-series-genres") }} />,
          })
        }

        // Comparison series
        const seriesCompare = data.comparison?.[svc]
        if (seriesCompare) {
          const seriesBilanConfig = getSlideConfig(sc, svc + "-series-stats-enriched")
          slides.push({
            id: svc + "-series-compare", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <CompareServiceSlide accent={seriesAccent} compareData={seriesCompare} year={year} mediaType="series" config={getSlideConfig(sc, svc + "-series-compare")} bilanCategories={seriesBilanConfig.categories} />,
          })
        }

        // Bilan series (fin de section)
        slides.push({
          id: svc + "-series-stats-enriched", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
          component: <FilmStatsEnrichedSlide accent={seriesAccent} label={cfg.seriesLabel} icon={cfg.seriesIcon} data={seriesData} year={year} config={getSlideConfig(sc, svc + "-series-stats-enriched")} mediaType="series" />,
        })

      }
    } else {
      // ── Standard service (romm, audiobookshelf, komga, booklore) ──
      const top = svcData.top || []

      slides.push({
        id: "cat-" + svc, accent: svcAccent, bg: cfg.bgCat || baseBg, cat: true, fullscreen: true,
        component: <CategorySlide accent={svcAccent} {...catProps("cat-" + svc, cfg)} />,
      })

      const stdCat = catProps("cat-" + svc, cfg)
      const backdropUrl = (top[0]?.art) || ""
      if (top.length >= 2) {
        slides.push({
          id: svc + "-pod", accent: svcAccent, bg: cfg.bgPod || baseBg, pod: true, fullscreen: true,
          component: <PodiumSlide accent={svcAccent} bg={cfg.bgPod || baseBg} data={top} title={"Top " + stdCat.label + " " + year} icon={stdCat.icon} jokes={podJokes(svc + "-pod", jokes)} statLabel={cfg.statLabel} statKey={cfg.statKey} statSuffix={cfg.statSuffix} backdrop={backdropUrl} config={getSlideConfig(sc, svc + "-pod")} />,
        })
      }

      slides.push({
        id: svc + "-stats", accent: svcAccent, bg: cfg.bgStats || baseBg,
        component: <ServiceStatsSlide accent={svcAccent} label={cfg.label} icon={cfg.icon} data={svcData} year={year} />,
      })

      if (svcData.day_of_week?.length > 0 || svcData.time_of_day?.length > 0 || svcData.ranking?.length > 0) {
        slides.push({
          id: svc + "-deep", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <ServiceDeepSlide accent={svcAccent} label={cfg.label} icon={cfg.icon} data={svcData} me={userName} year={year} />,
        })
      }
    }

    // Genres slide for standard services (non-hasSeries)
    if (!cfg.hasSeries) {
      const topGenres = svcData.extra?.top_genres || svcData.genres || []
      if (topGenres.length >= 3) {
        slides.push({
          id: svc + "-genres", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <GenresSlide accent={svcAccent} genres={topGenres} year={year} config={getSlideConfig(sc, svc + "-genres")} />,
        })
      }
    }

    // Comparison slide for all services (including standard)
    if (!cfg.hasSeries) {
      const svcCompare = data.comparison?.[svc]
      if (svcCompare) {
        slides.push({
          id: svc + "-compare", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <CompareServiceSlide accent={svcAccent} compareData={svcCompare} year={year} config={getSlideConfig(sc, svc + "-compare")} />,
        })
      }
    }
  }

  // ═══ COMMUNITY SECTION — Comparaison multi-utilisateurs ═══
  const communityAccent = accents.compare || "#60a5fa"

  // Match current user in data.users — all matching done here, no external state needed
  const _uid = user?.id ? String(user.id) : ""
  const _name = userName.toLowerCase().trim()
  const _email = (user?.email || "").toLowerCase().trim()
  // Also use myRecapUserId which was found during data loading
  const _recapUid = myRecapUserId || ""

  let foundMyUid = null
  if (data.users) {
    for (const [uid, udata] of Object.entries(data.users)) {
      const n = (udata.name || "").toLowerCase().trim()
      const e = (udata.email || "").toLowerCase().trim()
      const match = uid === _uid || uid === _recapUid
        || (_name && n === _name)
        || (_email && e && e === _email)
      if (match) { foundMyUid = uid; break }
    }
    if (!foundMyUid) {
      console.warn("[Community] Utilisateur non trouve dans le recap. Verifiez le mapping admin.", { uid: _uid, name: _name, email: _email, recapUsers: Object.keys(data.users) })
    }
  }

  const allUsersData = data.users ? Object.entries(data.users).map(([uid, udata]) => {
    const svcData = udata.tautulli || udata.plex || udata.jellyfin || {}
    return { name: udata.name || uid, uid, isMe: uid === foundMyUid, data: svcData }
  }).filter((u) => u.data && (u.data.total_items > 0 || u.data.total_hours > 0 || u.data.extra)) : []
  if (allUsersData.length > 0) {
    console.log("[Community] allUsersData:", allUsersData.map((u) => ({
      name: u.name, hasExtra: !!u.data.extra, totalItems: u.data.total_items,
      hasFilmsTop: u.data.extra?.films?.top?.length, hasSeriesTop: u.data.extra?.series?.top?.length,
      genres: u.data.genres?.length, monthly: u.data.monthly?.length,
    })))
  }
  const myNameInData = allUsersData.find((u) => u.isMe)?.name || userName

  if (allUsersData.length >= 2) {
    // Category slide for community section
    slides.push({
      id: "cat-community", accent: communityAccent, bg: baseBg, cat: true, fullscreen: true,
      component: <CategorySlide accent={communityAccent} icon="👥" label="COMMUNAUTE" sub="Comparaison entre utilisateurs" />,
    })

    // Films community slides
    const hasFilmsData = allUsersData.some((u) => (u.data.extra?.films?.total || u.data.total_items || 0) > 0)
    if (hasFilmsData) {
      slides.push({
        id: "community-top-films", accent: communityAccent, bg: baseBg, fullscreen: true,
        component: <CommunityTopSlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      slides.push({
        id: "community-mostviewed-films", accent: communityAccent, bg: baseBg,
        component: <CommunityMostViewedSlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      slides.push({
        id: "community-activity-films", accent: communityAccent, bg: baseBg,
        component: <CommunityActivitySlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      slides.push({
        id: "community-rankings-films", accent: communityAccent, bg: baseBg,
        component: <CommunityRankingsSlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      slides.push({
        id: "community-genres-films", accent: communityAccent, bg: baseBg,
        component: <CommunityGenresSlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      // Comparison films year vs year
      const filmCompareData = data.comparison?.tautulli || data.comparison?.plex || data.comparison?.jellyfin
      if (filmCompareData) {
        slides.push({
          id: "community-compare-films", accent: communityAccent, bg: baseBg,
          component: <CommunityCompareSlide accent={communityAccent} compareData={filmCompareData} year={year} mediaType="films" />,
        })
      }
    }

    // Series community slides
    const hasSeriesData = allUsersData.some((u) => (u.data.extra?.series?.episodes || 0) > 0)
    if (hasSeriesData) {
      slides.push({
        id: "community-top-series", accent: accents.series || "#fb923c", bg: baseBg, fullscreen: true,
        component: <CommunityTopSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      slides.push({
        id: "community-mostviewed-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityMostViewedSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      slides.push({
        id: "community-activity-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityActivitySlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      slides.push({
        id: "community-rankings-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityRankingsSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      slides.push({
        id: "community-genres-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityGenresSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      // Comparison series year vs year
      const seriesCompareData = data.comparison?.tautulli || data.comparison?.plex || data.comparison?.jellyfin
      if (seriesCompareData) {
        slides.push({
          id: "community-compare-series", accent: accents.series || "#fb923c", bg: baseBg,
          component: <CommunityCompareSlide accent={accents.series || "#fb923c"} compareData={seriesCompareData} year={year} mediaType="series" />,
        })
      }
    }
  }

  // Compare
  const compareAccent = accents.compare || "#60a5fa"
  if (data.comparison) {
    slides.push({
      id: "compare", accent: compareAccent, bg: baseBg,
      component: <CompareSlide accent={compareAccent} comparison={data.comparison} year={year} />,
    })
  }

  // Overseerr slides — only shown if data.overseerr exists
  const overseerrAccent = accents.compare || "#6366f1"
  if (data.overseerr && data.overseerr.total > 0 && isSlideEnabled(sc, "overseerr-requests")) {
    slides.push({
      id: "overseerr-requests", accent: overseerrAccent, bg: baseBg,
      component: <OverseerrRequestsSlide accent={overseerrAccent} data={data} year={year} />,
    })
  }
  if (data.overseerr && (data.overseerr.matched?.length > 0 || data.overseerr.not_watched?.length > 0) && isSlideEnabled(sc, "overseerr-match")) {
    slides.push({
      id: "overseerr-match", accent: overseerrAccent, bg: baseBg,
      component: <OverseerrMatchSlide accent={overseerrAccent} data={data} year={year} />,
    })
  }
  if (data.overseerr?.community?.total > 0 && isSlideEnabled(sc, "overseerr-community")) {
    slides.push({
      id: "overseerr-community", accent: overseerrAccent, bg: baseBg,
      component: <OverseerrCommunitySlide accent={overseerrAccent} data={data} year={year} userName={userName} />,
    })
  }

  // Server ranking — cumulative all-time
  const rankingAccent = accents.ranking || "#f87171"
  if (data.server_ranking) {
    slides.push({
      id: "classement-serveur", accent: rankingAccent, bg: baseBg,
      component: <ServerRankingSlide accent={rankingAccent} data={data} year={year} userName={userName} />,
    })
  }

  // Finale — activeServices will be injected after slide filtering
  slides.push({
    id: "finale", accent: primary, bg: baseBg, fullscreen: true,
    _finaleProps: { accent: primary, userName, year, globalStats, recapData: data },
  })

  // ── Apply accent overrides from slide settings ──
  for (const s of slides) {
    const override = getAccentOverride(sc, s.id)
    if (override) {
      s.accent = override
      // Re-create component with overridden accent
      if (s.component && s.component.props) {
        const { accent: _oldAccent, ...restProps } = s.component.props
        s.component = { ...s.component, props: { ...s.component.props, accent: override } }
      }
    }
  }

  // ── Apply saved order + enabled filter ──
  const LOCKED = new Set(["intro", "finale"])

  // Filter out disabled slides (but keep locked: intro, finale)
  const enabledSlides = slides.filter((s) => LOCKED.has(s.id) || isSlideEnabled(sc, s.id))

  // Detect active services from enabled slide IDs (e.g. "tautulli-pod" -> "tautulli")
  const SVC_NAMES = ["tautulli", "plex", "jellyfin", "romm", "audiobookshelf", "komga", "booklore"]
  const detectedServices = [...new Set(enabledSlides.map((s) => SVC_NAMES.find((svc) => s.id.startsWith(svc))).filter(Boolean))]

  // Inject FinaleSlide component with activeServices
  for (const s of enabledSlides) {
    if (s.id === "finale" && s._finaleProps) {
      const p = s._finaleProps
      s.component = <FinaleSlide {...p} activeServices={detectedServices} onRestart={null} />
      delete s._finaleProps
    }
  }

  // Inject OnboardingSlide with dynamic data
  const SERVICE_CFG = { tautulli: { icon: "🎬", label: "Films & Series", sub: "Cinema · Series TV" }, plex: { icon: "🎬", label: "Films & Series", sub: "Cinema · Series TV" }, jellyfin: { icon: "📺", label: "Jellyfin", sub: "Films · Series" }, romm: { icon: "🎮", label: "Jeux Video", sub: "Switch · PC" }, audiobookshelf: { icon: "🎧", label: "Livres Audio", sub: "Podcasts" }, komga: { icon: "📚", label: "Manga", sub: "BD · Comics" }, booklore: { icon: "📖", label: "Livres", sub: "Romans · Essais" } }
  const svcList = detectedServices.map((s) => ({ key: s, ...(SERVICE_CFG[s] || { icon: "📦", label: s, sub: "" }) }))
  for (const s of enabledSlides) {
    if (s.id === "onboarding" && s._onboardingProps) {
      const p = s._onboardingProps
      const hasFilms = enabledSlides.some(sl => sl.id.includes("-pod") && !sl.id.includes("series"))
      const hasSeries = enabledSlides.some(sl => sl.id.includes("-series-pod"))
      const hasCommunity = enabledSlides.some(sl => sl.id.startsWith("community-"))
      s.component = <OnboardingSlide {...p} slideCount={enabledSlides.length} hasFilms={hasFilms} hasSeries={hasSeries} hasCommunity={hasCommunity} />
      delete s._onboardingProps
    }
  }

  // Apply saved order if available
  if (slideOrder && slideOrder.length > 0) {
    const slideMap = new Map(enabledSlides.map((s) => [s.id, s]))
    const ordered = []

    // Intro always first, onboarding always second
    if (slideMap.has("intro")) {
      ordered.push(slideMap.get("intro"))
      slideMap.delete("intro")
    }
    if (slideMap.has("onboarding")) {
      ordered.push(slideMap.get("onboarding"))
      slideMap.delete("onboarding")
    }

    // Follow saved order for the rest
    for (const id of slideOrder) {
      if (id === "intro" || id === "onboarding" || id === "finale") continue
      if (slideMap.has(id)) {
        ordered.push(slideMap.get(id))
        slideMap.delete(id)
      }
    }

    // Add any remaining slides not in the saved order (new slides)
    for (const s of enabledSlides) {
      if (slideMap.has(s.id) && s.id !== "finale") {
        ordered.push(s)
      }
    }

    // Finale always last
    if (slideMap.has("finale") || enabledSlides.find((s) => s.id === "finale")) {
      const finale = enabledSlides.find((s) => s.id === "finale")
      if (finale) ordered.push(finale)
    }

    return ordered
  }

  return enabledSlides
}

export default buildSlides
