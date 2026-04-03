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
import AudiobookBilanSlide from "./slides/AudiobookBilanSlide"
import AudiobookFavoritesSlide from "./slides/AudiobookFavoritesSlide"
import GrimmoryStreakSlide from "./slides/GrimmoryStreakSlide"
import GrimmoryPageTurnerSlide from "./slides/GrimmoryPageTurnerSlide"
import OverseerrRequestsSlide from "./slides/OverseerrRequestsSlide"
import OverseerrMatchSlide from "./slides/OverseerrMatchSlide"
import OverseerrPopularSlide from "./slides/OverseerrPopularSlide"
import OverseerrCommunitySlide from "./slides/OverseerrCommunitySlide"
import FinaleSlide from "./slides/FinaleSlide"
import OnboardingSlide from "./slides/OnboardingSlide"
import ThisOrThatSlide from "./slides/ThisOrThatSlide"
import EstimationSlide from "./slides/EstimationSlide"
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
  grimmory: { icon: "📖", label: "LECTURE", sub: "Livres · Audiobooks · Comics", accent: "#10b981", bgCat: "#010a05", bgPod: "#010806", bgStats: "#020f08", statKey: "h", statLabel: "heures", statSuffix: "h" },
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

function buildSlides(data, theme, slideConfigs, user, year, myRecapUserId, onInteraction) {
  if (!data) return []
  const slideSettings = slideConfigs?.settings || slideConfigs || {}
  const slideOrder = slideConfigs?.order || []
  const sc = slideSettings
  const interactionCb = (slideId) => (interactionData) => onInteraction?.(slideId, interactionData)

  // Helper: push slide only if enabled (or forced for locked slides)
  const pushSlide = (slide, force = false) => {
    if (force || isSlideEnabled(sc, slide.id)) slides.push(slide)
  }

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
  pushSlide({
    id: "intro", accent: primary, bg: baseBg, fullscreen: false,
    _introProps: { accent: primary, userName, year, hasComparison: !!data.comparison },
  })

  // 1 — Onboarding (slideCount injected later)
  pushSlide({
    id: "onboarding", accent: primary, bg: baseBg,
    _onboardingProps: { accent: primary, year, hasComparison: !!data.comparison },
  })

  // Per-service: Category → Podium → Stats → Deep
  const serviceOrder = ["tautulli", "plex", "jellyfin", "romm", "audiobookshelf", "grimmory", "komga", "booklore"]
  const seen = new Set()

  for (const svc of serviceOrder) {
    const svcData = data[svc]
    if (!svcData) continue
    // Skip if we already added plex-like slides (tautulli = plex)
    const svcKey = svc === "tautulli" ? "plex" : svc
    if (seen.has(svcKey)) continue
    seen.add(svcKey)

    // Map service to theme accent key
    const ACCENT_KEY_MAP = { tautulli: "films", plex: "films", jellyfin: "films", audiobookshelf: "audio", grimmory: "booklore" }
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
      pushSlide({
        id: "cat-" + svc, accent: svcAccent, bg: cfg.bgCat || baseBg, cat: true, fullscreen: true,
        component: <CategorySlide accent={svcAccent} {...catProps("cat-" + svc, cfg)} />,
      })

      const filmsBackdrop = svcData.extra?.backdrop || (filmsTop[0]?.art) || ""
      const filmsCat = catProps("cat-" + svc, cfg)
      if (filmsTop.length >= 2) {
        pushSlide({
          id: svc + "-pod", accent: svcAccent, bg: cfg.bgPod || baseBg, pod: true, fullscreen: true,
          component: <PodiumSlide accent={svcAccent} bg={cfg.bgPod || baseBg} data={filmsTop} title={"Top " + filmsCat.label + " " + year} icon={filmsCat.icon} jokes={podJokes(svc + "-pod", jokes)} statLabel={cfg.statLabel} statKey={cfg.statKey} statSuffix={cfg.statSuffix} backdrop={filmsBackdrop} config={getSlideConfig(sc, svc + "-pod")} serviceType={svc} />,
        })
      }

      // Deep slide (habitudes) — uses combined data
      if (svcData.day_of_week?.length > 0 || svcData.time_of_day?.length > 0 || svcData.ranking?.length > 0) {
        pushSlide({
          id: svc + "-deep", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <ServiceDeepSlide accent={svcAccent} label={cfg.label} icon={cfg.icon} data={svcData} me={userName} year={year} serviceType={svc} />,
        })
      }

      // Film-specific slides (timeline, worldmap, ratings, actors, directors)
      const hasYears = filmsTop.some((t) => t.y && t.y > 1890)
      if (hasYears) {
        pushSlide({
          id: svc + "-timeline", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <FilmTimelineSlide accent={svcAccent} data={svcData} year={year} config={getSlideConfig(sc, svc + "-timeline")} serviceType={svc} />,
        })
      }

      const countryData = svcData.extra?.countries || []
      if (countryData.length > 0) {
        pushSlide({
          id: svc + "-worldmap", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <WorldMapSlide accent={svcAccent} data={svcData} year={year} config={getSlideConfig(sc, svc + "-worldmap")} serviceType={svc} />,
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
        pushSlide({
          id: svc + "-ratings", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <RatingsSlide accent={svcAccent} data={svcData} year={year} config={ratingsConfig} serviceType={svc} />,
        })
      }

      // Budget slide (if budget data available)
      const budgetData = svcData.extra?.budgets
      if (budgetData && budgetData.count > 0) {
        pushSlide({
          id: svc + "-budgets", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <BudgetSlide accent={svcAccent} data={svcData} year={year} config={getSlideConfig(sc, svc + "-budgets")} serviceType={svc} />,
        })
      }

      const actorsData = svcData.extra?.actors || []
      const actorsConfig = getSlideConfig(sc, svc + "-actors")
      if (actorsData.filter((a) => a.count >= (actorsConfig?.minAppearances || 2)).length > 0) {
        pushSlide({
          id: svc + "-actors", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <FavoriteActorsSlide accent={svcAccent} data={svcData} year={year} config={actorsConfig} serviceType={svc} />,
        })
      }

      const directorsData = svcData.extra?.directors || []
      const directorsConfig = getSlideConfig(sc, svc + "-directors")
      if (directorsData.filter((d) => d.count >= (directorsConfig?.minAppearances || 2)).length > 0) {
        pushSlide({
          id: svc + "-directors", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <FavoriteDirectorsSlide accent={svcAccent} data={svcData} year={year} config={directorsConfig} serviceType={svc} />,
        })
      }

      // Genres slide (films section)
      const topGenres = svcData.extra?.top_genres || svcData.genres || []
      if (topGenres.length >= 1) {
        pushSlide({
          id: svc + "-genres", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <GenresSlide accent={svcAccent} genres={topGenres} year={year} config={getSlideConfig(sc, svc + "-genres")} serviceType={svc} />,
        })
      }

      // Comparison slide (films)
      const filmCompare = data.comparison?.[svc]
      if (filmCompare) {
        const bilanConfig = getSlideConfig(sc, svc + "-stats-enriched")
        pushSlide({
          id: svc + "-compare", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <CompareServiceSlide accent={svcAccent} compareData={filmCompare} year={year} mediaType="films" config={getSlideConfig(sc, svc + "-compare")} bilanCategories={bilanConfig.categories} serviceType={svc} />,
        })
      }

      // Stats enriched / bilan cinema (fin de section films)
      pushSlide({
        id: svc + "-stats-enriched", accent: svcAccent, bg: cfg.bgStats || baseBg,
        component: <FilmStatsEnrichedSlide accent={svcAccent} label={cfg.label} icon={cfg.icon} data={filmsData} year={year} config={getSlideConfig(sc, svc + "-stats-enriched")} serviceType={svc} />,
      })

      // Interactive slides (films)
      pushSlide({
        id: svc + "-thisorthat", accent: svcAccent, bg: cfg.bgStats || baseBg,
        component: <ThisOrThatSlide accent={svcAccent} data={data} year={year} section="films" config={getSlideConfig(sc, svc + "-thisorthat")} onInteraction={interactionCb(svc + "-thisorthat")} />,
      })
      pushSlide({
        id: svc + "-estimation", accent: svcAccent, bg: cfg.bgStats || baseBg,
        component: <EstimationSlide accent={svcAccent} data={data} year={year} section="films" config={getSlideConfig(sc, svc + "-estimation")} onInteraction={interactionCb(svc + "-estimation")} />,
      })

      // ═══ SERIES SECTION ═══
      if (seriesTop.length >= 1) {
        const seriesAccent = accents.series || cfg.seriesAccent || "#fb923c"
        const seriesExtraData = svcData.extra?.series || {}

        // Category
        pushSlide({
          id: "cat-" + svc + "-series", accent: seriesAccent, bg: cfg.seriesBgCat || baseBg, cat: true, fullscreen: true,
          component: <CategorySlide accent={seriesAccent} {...catProps("cat-" + svc + "-series", { icon: cfg.seriesIcon, label: cfg.seriesLabel, sub: cfg.seriesSub })} />,
        })

        // Podium
        const seriesCat = catProps("cat-" + svc + "-series", { icon: cfg.seriesIcon, label: cfg.seriesLabel, sub: cfg.seriesSub })
        if (seriesTop.length >= 2) {
          const seriesBackdrop = (seriesTop[0]?.art) || ""
          const defaultSeriesJokes = ["Voyons quelles series t'ont accroche...", "Des episodes enchaines sans fin.", "Le binge-watching, un art de vivre.", "Voici ton podium series"]
          pushSlide({
            id: svc + "-series-pod", accent: seriesAccent, bg: cfg.seriesBgPod || baseBg, pod: true, fullscreen: true,
            component: <PodiumSlide accent={seriesAccent} bg={cfg.seriesBgPod || baseBg} data={seriesTop} title={"Top " + seriesCat.label + " " + year} icon={seriesCat.icon} jokes={podJokes(svc + "-series-pod", defaultSeriesJokes)} statLabel="episodes" statKey="ep" statSuffix="" backdrop={seriesBackdrop} config={getSlideConfig(sc, svc + "-series-pod")} serviceType={svc} />,
          })
        }

        // Habitudes series
        if (seriesExtraData.day_of_week?.length > 0 || seriesExtraData.time_of_day?.length > 0) {
          pushSlide({
            id: svc + "-series-deep", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <ServiceDeepSlide accent={seriesAccent} label={cfg.seriesLabel} icon={cfg.seriesIcon} data={{ ...svcData, ...seriesData, extra: { ...svcData.extra, films: seriesExtraData } }} me={userName} year={year} serviceType={svc} />,
          })
        }

        // Profil seriephile (timeline)
        const seriesHasYears = seriesTop.some((t) => t.y && t.y > 1890)
        if (seriesHasYears) {
          pushSlide({
            id: svc + "-series-timeline", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <FilmTimelineSlide accent={seriesAccent} data={{ ...svcData, top: seriesTop, extra: { ...svcData.extra, films: { top: (seriesExtraData.top || seriesTop) } } }} year={year} config={getSlideConfig(sc, svc + "-series-timeline")} mediaType="series" serviceType={svc} />,
          })
        }

        // Carte du monde series
        const seriesCountries = seriesExtraData.countries || []
        if (seriesCountries.length > 0) {
          pushSlide({
            id: svc + "-series-worldmap", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <WorldMapSlide accent={seriesAccent} data={{ extra: { countries: seriesCountries } }} year={year} config={getSlideConfig(sc, svc + "-series-worldmap")} mediaType="series" serviceType={svc} />,
          })
        }

        // Notes series
        const seriesRatings = seriesExtraData.ratings || []
        if (seriesRatings.length >= 2) {
          pushSlide({
            id: svc + "-series-ratings", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <RatingsSlide accent={seriesAccent} data={{ extra: { ratings: seriesRatings, films: { top: seriesExtraData.top || [] } }, top: seriesTop }} year={year} config={getSlideConfig(sc, svc + "-series-ratings")} mediaType="series" serviceType={svc} />,
          })
        }

        // Acteurs series
        const seriesActors = seriesExtraData.actors || svcData.extra?.series_actors || []
        const seriesActorsConfig = getSlideConfig(sc, svc + "-series-actors")
        if (seriesActors.filter((a) => a.count >= (seriesActorsConfig?.minAppearances || 2)).length > 0) {
          pushSlide({
            id: svc + "-series-actors", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <FavoriteActorsSlide accent={seriesAccent} data={{ extra: { actors: seriesActors } }} year={year} config={seriesActorsConfig} serviceType={svc} />,
          })
        }

        // Realisateurs series
        const seriesDirectors = seriesExtraData.directors || []
        const seriesDirectorsConfig = getSlideConfig(sc, svc + "-series-directors")
        if (seriesDirectors.filter((d) => d.count >= (seriesDirectorsConfig?.minAppearances || 2)).length > 0) {
          pushSlide({
            id: svc + "-series-directors", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <FavoriteDirectorsSlide accent={seriesAccent} data={{ extra: { directors: seriesDirectors } }} year={year} config={seriesDirectorsConfig} serviceType={svc} />,
          })
        }

        // Genres series
        const seriesGenres = seriesExtraData.genres || svcData.extra?.series_genres || []
        if (seriesGenres.length >= 3) {
          pushSlide({
            id: svc + "-series-genres", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <GenresSlide accent={seriesAccent} genres={seriesGenres} year={year} config={{ displayMode: "race", ...getSlideConfig(sc, svc + "-series-genres") }} serviceType={svc} />,
          })
        }

        // Comparison series
        const seriesCompare = data.comparison?.[svc]
        if (seriesCompare) {
          const seriesBilanConfig = getSlideConfig(sc, svc + "-series-stats-enriched")
          pushSlide({
            id: svc + "-series-compare", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <CompareServiceSlide accent={seriesAccent} compareData={seriesCompare} year={year} mediaType="series" config={getSlideConfig(sc, svc + "-series-compare")} bilanCategories={seriesBilanConfig.categories} serviceType={svc} />,
          })
        }

        // Bilan series (fin de section)
        pushSlide({
          id: svc + "-series-stats-enriched", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
          component: <FilmStatsEnrichedSlide accent={seriesAccent} label={cfg.seriesLabel} icon={cfg.seriesIcon} data={seriesData} year={year} config={getSlideConfig(sc, svc + "-series-stats-enriched")} mediaType="series" serviceType={svc} />,
        })

        // Interactive slides (series)
        pushSlide({
          id: svc + "-series-thisorthat", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
          component: <ThisOrThatSlide accent={seriesAccent} data={data} year={year} section="series" config={getSlideConfig(sc, svc + "-series-thisorthat")} onInteraction={interactionCb(svc + "-series-thisorthat")} />,
        })
        pushSlide({
          id: svc + "-series-estimation", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
          component: <EstimationSlide accent={seriesAccent} data={data} year={year} section="series" config={getSlideConfig(sc, svc + "-series-estimation")} onInteraction={interactionCb(svc + "-series-estimation")} />,
        })

      }
    } else {
      // ── Standard service (romm, audiobookshelf, komga, booklore) ──
      const top = svcData.top || []

      pushSlide({
        id: "cat-" + svc, accent: svcAccent, bg: cfg.bgCat || baseBg, cat: true, fullscreen: true,
        component: <CategorySlide accent={svcAccent} {...catProps("cat-" + svc, cfg)} />,
      })

      const stdCat = catProps("cat-" + svc, cfg)
      const backdropUrl = (top[0]?.art) || ""
      if (top.length >= 2) {
        pushSlide({
          id: svc + "-pod", accent: svcAccent, bg: cfg.bgPod || baseBg, pod: true, fullscreen: true,
          component: <PodiumSlide accent={svcAccent} bg={cfg.bgPod || baseBg} data={top} title={"Top " + stdCat.label + " " + year} icon={stdCat.icon} jokes={podJokes(svc + "-pod", jokes)} statLabel={cfg.statLabel} statKey={cfg.statKey} statSuffix={cfg.statSuffix} backdrop={backdropUrl} config={getSlideConfig(sc, svc + "-pod")} serviceType={svc} />,
        })
      }

      pushSlide({
        id: svc + "-stats", accent: svcAccent, bg: cfg.bgStats || baseBg,
        component: <ServiceStatsSlide accent={svcAccent} label={cfg.label} icon={cfg.icon} data={svcData} year={year} serviceType={svc} />,
      })

      if (svcData.day_of_week?.length > 0 || svcData.time_of_day?.length > 0 || svcData.ranking?.length > 0) {
        pushSlide({
          id: svc + "-deep", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <ServiceDeepSlide accent={svcAccent} label={cfg.label} icon={cfg.icon} data={svcData} me={userName} year={year} serviceType={svc} />,
        })
      }
    }

    // Genres slide for standard services (non-hasSeries)
    if (!cfg.hasSeries) {
      const topGenres = svcData.extra?.top_genres || svcData.genres || []
      if (topGenres.length >= 1) {
        pushSlide({
          id: svc + "-genres", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <GenresSlide accent={svcAccent} genres={topGenres} year={year} config={getSlideConfig(sc, svc + "-genres")} serviceType={svc} />,
        })
      }
    }

    // Audiobookshelf-specific slides
    if (svc === "audiobookshelf") {
      if (isSlideEnabled(sc, svc + "-bilan")) {
        pushSlide({
          id: svc + "-bilan", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <AudiobookBilanSlide accent={svcAccent} data={svcData} year={year} config={getSlideConfig(sc, svc + "-bilan")} serviceType={svc} />,
        })
      }
      if ((svcData.extra?.top_authors?.length > 0 || svcData.extra?.top_narrators?.length > 0) && isSlideEnabled(sc, svc + "-favorites")) {
        pushSlide({
          id: svc + "-favorites", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <AudiobookFavoritesSlide accent={svcAccent} data={svcData} year={year} serviceType={svc} />,
        })
      }
    }

    // Grimmory-specific slides (reading + listening)
    if (svc === "grimmory") {
      pushSlide({
        id: svc + "-bilan", accent: svcAccent, bg: cfg.bgStats || baseBg,
        component: <AudiobookBilanSlide accent={svcAccent} data={svcData} year={year} config={getSlideConfig(sc, svc + "-bilan")} serviceType={svc} />,
      })
      if (svcData.extra?.top_authors?.length > 0) {
        pushSlide({
          id: svc + "-favorites", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <AudiobookFavoritesSlide accent={svcAccent} data={svcData} year={year} serviceType={svc} />,
        })
      }
      if (svcData.extra?.streak?.current > 0 || svcData.extra?.streak?.longest > 0) {
        pushSlide({
          id: svc + "-streak", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <GrimmoryStreakSlide accent={svcAccent} data={svcData} year={year} />,
        })
      }
      if (svcData.extra?.page_turners?.length > 0) {
        pushSlide({
          id: svc + "-page-turners", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <GrimmoryPageTurnerSlide accent={svcAccent} data={svcData} year={year} />,
        })
      }
    }

    // Comparison slide for all services (including standard)
    if (!cfg.hasSeries) {
      const svcCompare = data.comparison?.[svc]
      if (svcCompare) {
        pushSlide({
          id: svc + "-compare", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <CompareServiceSlide accent={svcAccent} compareData={svcCompare} year={year} config={getSlideConfig(sc, svc + "-compare")} serviceType={svc} />,
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
    pushSlide({
      id: "cat-community", accent: communityAccent, bg: baseBg, cat: true, fullscreen: true,
      component: <CategorySlide accent={communityAccent} icon="👥" label="COMMUNAUTE" sub="Comparaison entre utilisateurs" />,
    })

    // Films community slides
    const hasFilmsData = allUsersData.some((u) => (u.data.extra?.films?.total || u.data.total_items || 0) > 0)
    if (hasFilmsData) {
      pushSlide({
        id: "community-top-films", accent: communityAccent, bg: baseBg, fullscreen: true,
        component: <CommunityTopSlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      pushSlide({
        id: "community-mostviewed-films", accent: communityAccent, bg: baseBg,
        component: <CommunityMostViewedSlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      pushSlide({
        id: "community-activity-films", accent: communityAccent, bg: baseBg,
        component: <CommunityActivitySlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      pushSlide({
        id: "community-rankings-films", accent: communityAccent, bg: baseBg,
        component: <CommunityRankingsSlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      pushSlide({
        id: "community-genres-films", accent: communityAccent, bg: baseBg,
        component: <CommunityGenresSlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      // Comparison films year vs year
      const filmCompareData = data.comparison?.tautulli || data.comparison?.plex || data.comparison?.jellyfin
      if (filmCompareData) {
        pushSlide({
          id: "community-compare-films", accent: communityAccent, bg: baseBg,
          component: <CommunityCompareSlide accent={communityAccent} compareData={filmCompareData} year={year} mediaType="films" />,
        })
      }
    }

    // Series community slides
    const hasSeriesData = allUsersData.some((u) => (u.data.extra?.series?.episodes || 0) > 0)
    if (hasSeriesData) {
      pushSlide({
        id: "community-top-series", accent: accents.series || "#fb923c", bg: baseBg, fullscreen: true,
        component: <CommunityTopSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      pushSlide({
        id: "community-mostviewed-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityMostViewedSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      pushSlide({
        id: "community-activity-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityActivitySlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      pushSlide({
        id: "community-rankings-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityRankingsSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      pushSlide({
        id: "community-genres-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityGenresSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      // Comparison series year vs year
      const seriesCompareData = data.comparison?.tautulli || data.comparison?.plex || data.comparison?.jellyfin
      if (seriesCompareData) {
        pushSlide({
          id: "community-compare-series", accent: accents.series || "#fb923c", bg: baseBg,
          component: <CommunityCompareSlide accent={accents.series || "#fb923c"} compareData={seriesCompareData} year={year} mediaType="series" />,
        })
      }
    }
  }

  // Interactive slide (community)
  if (allUsersData.length >= 2) {
    pushSlide({
      id: "community-thisorthat", accent: communityAccent, bg: baseBg,
      component: <ThisOrThatSlide accent={communityAccent} data={data} year={year} section="community" config={getSlideConfig(sc, "community-thisorthat")} onInteraction={interactionCb("community-thisorthat")} />,
    })
  }

  // Compare
  const compareAccent = accents.compare || "#60a5fa"
  if (data.comparison) {
    pushSlide({
      id: "compare", accent: compareAccent, bg: baseBg,
      component: <CompareSlide accent={compareAccent} comparison={data.comparison} year={year} />,
    })
  }

  // Overseerr section — only shown if data.overseerr exists
  const overseerrAccent = accents.overseerr || "#818cf8"
  if (data.overseerr && data.overseerr.total > 0) {
    // Category slide (section separator)
    if (isSlideEnabled(sc, "cat-overseerr")) {
      pushSlide({
        id: "cat-overseerr", accent: overseerrAccent, bg: baseBg, cat: true, fullscreen: true,
        component: <CategorySlide accent={overseerrAccent} {...catProps("cat-overseerr", { icon: "📋", label: "DEMANDES", sub: "Overseerr · Requetes media" })} />,
      })
    }
    if (isSlideEnabled(sc, "overseerr-requests")) {
      pushSlide({
        id: "overseerr-requests", accent: overseerrAccent, bg: baseBg,
        component: <OverseerrRequestsSlide accent={overseerrAccent} data={data} year={year} config={getSlideConfig(sc, "overseerr-requests")} />,
      })
    }
    if (isSlideEnabled(sc, "overseerr-match")) {
      pushSlide({
        id: "overseerr-match", accent: overseerrAccent, bg: baseBg,
        component: <OverseerrMatchSlide accent={overseerrAccent} data={data} year={year} config={getSlideConfig(sc, "overseerr-match")} />,
      })
    }
    if (isSlideEnabled(sc, "overseerr-popular")) {
      pushSlide({
        id: "overseerr-popular", accent: overseerrAccent, bg: baseBg,
        component: <OverseerrPopularSlide accent={overseerrAccent} data={data} year={year} />,
      })
    }
    if (data.overseerr?.community?.total > 0 && isSlideEnabled(sc, "overseerr-community")) {
      pushSlide({
        id: "overseerr-community", accent: overseerrAccent, bg: baseBg,
        component: <OverseerrCommunitySlide accent={overseerrAccent} data={data} year={year} userName={userName} />,
      })
    }

    // Interactive slide (demandes estimation)
    if (data.overseerr?.total > 0) {
      pushSlide({
        id: "overseerr-estimation", accent: overseerrAccent, bg: baseBg,
        component: <EstimationSlide accent={overseerrAccent} data={data} year={year} section="demandes" config={getSlideConfig(sc, "overseerr-estimation")} onInteraction={interactionCb("overseerr-estimation")} />,
      })
    }
  }

  // Server ranking — cumulative all-time
  const rankingAccent = accents.ranking || "#f87171"
  if (data.server_ranking) {
    pushSlide({
      id: "classement-serveur", accent: rankingAccent, bg: baseBg,
      component: <ServerRankingSlide accent={rankingAccent} data={data} year={year} userName={userName} />,
    })
  }

  // Finale — activeServices will be injected after slide filtering
  pushSlide({
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
  const SVC_NAMES = ["tautulli", "plex", "jellyfin", "romm", "audiobookshelf", "grimmory", "komga", "booklore"]
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
  const SERVICE_CFG = { tautulli: { icon: "🎬", label: "Films & Series", sub: "Cinema · Series TV" }, plex: { icon: "🎬", label: "Films & Series", sub: "Cinema · Series TV" }, jellyfin: { icon: "📺", label: "Jellyfin", sub: "Films · Series" }, romm: { icon: "🎮", label: "Jeux Video", sub: "Switch · PC" }, audiobookshelf: { icon: "🎧", label: "Livres Audio", sub: "Podcasts" }, grimmory: { icon: "📖", label: "Lecture", sub: "Livres · Audiobooks" }, komga: { icon: "📚", label: "Manga", sub: "BD · Comics" }, booklore: { icon: "📖", label: "Livres", sub: "Romans · Essais" } }
  const svcList = detectedServices.map((s) => ({ key: s, ...(SERVICE_CFG[s] || { icon: "📦", label: s, sub: "" }) }))
  for (const s of enabledSlides) {
    if (s.id === "onboarding" && s._onboardingProps) {
      const p = s._onboardingProps
      // Sections will be injected after reordering (see _injectOnboardingSections)
      s.component = <OnboardingSlide {...p} slideCount={enabledSlides.length} sections={[]} />
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

    _injectOnboardingSections(ordered)
    return ordered
  }

  _injectOnboardingSections(enabledSlides)
  return enabledSlides
}

const SECTION_INFO = {
  films: { icon: "🎬", label: "Recap Films", desc: "Podium, stats, genres, notes..." },
  series: { icon: "📺", label: "Recap Series", desc: "Top series, habitudes, acteurs..." },
  audiobookshelf: { icon: "🎧", label: "Livres Audio", desc: "Ecoute, auteurs, narrateurs..." },
  grimmory: { icon: "📖", label: "Lecture", desc: "Livres, streak, page-turners..." },
  romm: { icon: "🎮", label: "Jeux Video", desc: "Top jeux, plateformes, genres..." },
  komga: { icon: "📚", label: "Manga", desc: "Volumes lus, genres, auteurs..." },
  booklore: { icon: "📖", label: "Livres", desc: "Lectures, genres, auteurs..." },
  overseerr: { icon: "📋", label: "Demandes", desc: "Bilan, match, popularite..." },
  community: { icon: "👥", label: "Communaute", desc: "Classements, tendances..." },
}

function _injectOnboardingSections(slides) {
  const onboarding = slides.find(s => s.id === "onboarding")
  if (!onboarding?.component) return

  const sectionsList = []
  const seen = new Set()
  for (const sl of slides) {
    let sec = null
    if (sl.id.startsWith("cat-tautulli") && !sl.id.includes("series")) sec = "films"
    else if (sl.id.startsWith("cat-plex") && !sl.id.includes("series")) sec = "films"
    else if (sl.id.startsWith("cat-jellyfin")) sec = "films"
    else if (sl.id.includes("-series") && sl.id.startsWith("cat-")) sec = "series"
    else if (sl.id.startsWith("cat-audiobookshelf")) sec = "audiobookshelf"
    else if (sl.id.startsWith("cat-grimmory")) sec = "grimmory"
    else if (sl.id.startsWith("cat-overseerr")) sec = "overseerr"
    else if (sl.id === "cat-community") sec = "community"
    else if (sl.id.startsWith("cat-romm")) sec = "romm"
    else if (sl.id.startsWith("cat-komga")) sec = "komga"
    else if (sl.id.startsWith("cat-booklore")) sec = "booklore"
    if (sec && !seen.has(sec) && SECTION_INFO[sec]) {
      seen.add(sec)
      sectionsList.push(SECTION_INFO[sec])
    }
  }

  // Update component props in-place
  onboarding.component = { ...onboarding.component, props: { ...onboarding.component.props, sections: sectionsList } }
}

export default buildSlides
