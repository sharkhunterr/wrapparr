import logging
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.config import settings
from app.core.database import Base, async_session, engine
from app.core.security import hash_password

from app.core.log_store import log_store, setup_logging
setup_logging()
logger = logging.getLogger("wrapparr")

BUILTIN_THEMES = [
    {   # Or chaud / couleurs cinema classique — chaque couleur bien distincte
        "name": "Cinematic", "slug": "cinematic",
        "config": {
            "palette": {"primary": "#E5A00D", "background": "#05050e",
                        "accents": {"films": "#E5A00D", "series": "#e05c9a", "romm": "#34d399", "audio": "#f97316", "komga": "#a78bfa", "booklore": "#38bdf8", "compare": "#60a5fa", "ranking": "#f87171"}},
            "card_style": "glass", "transition": "slide-up", "particles": True, "orbs": True,
            "grain": True, "spotlights": True, "finale_effect": "fireworks",
            "fonts": {"heading": "Syne", "body": "Outfit", "mono": "DM Mono"},
        },
    },
    {   # Neon vif — couleurs saturees tres contrastees
        "name": "Neon Arcade", "slug": "neon-arcade",
        "config": {
            "palette": {"primary": "#ff00ff", "background": "#0a001a",
                        "accents": {"films": "#ff00ff", "series": "#00ffff", "romm": "#39ff14", "audio": "#ff6600", "komga": "#ffee00", "booklore": "#6666ff", "compare": "#00ff99", "ranking": "#ff3366"}},
            "card_style": "glass", "transition": "slide-up", "particles": True, "orbs": True,
            "grain": True, "spotlights": True, "finale_effect": "fireworks",
            "fonts": {"heading": "Syne", "body": "Outfit", "mono": "DM Mono"},
        },
    },
    {   # Tons chauds feutres — elegance sobre
        "name": "Editorial", "slug": "editorial",
        "config": {
            "palette": {"primary": "#c8a97e", "background": "#0f0f0f",
                        "accents": {"films": "#c8a97e", "series": "#e07b6c", "romm": "#7eb89f", "audio": "#d4a03e", "komga": "#9b8ec4", "booklore": "#6ba3c2", "compare": "#87ceeb", "ranking": "#cd7b6f"}},
            "card_style": "glass", "transition": "slide-up", "particles": False, "orbs": True,
            "grain": True, "spotlights": False, "finale_effect": "confetti",
            "fonts": {"heading": "Syne", "body": "Outfit", "mono": "DM Mono"},
        },
    },
    {   # Violet/bleu cosmique — spectre froid
        "name": "Galaxy", "slug": "galaxy",
        "config": {
            "palette": {"primary": "#7c3aed", "background": "#030014",
                        "accents": {"films": "#7c3aed", "series": "#06b6d4", "romm": "#22d3ee", "audio": "#f472b6", "komga": "#a855f7", "booklore": "#34d399", "compare": "#38bdf8", "ranking": "#fb7185"}},
            "card_style": "glass", "transition": "slide-up", "particles": True, "orbs": True,
            "grain": True, "spotlights": True, "finale_effect": "fireworks",
            "fonts": {"heading": "Syne", "body": "Outfit", "mono": "DM Mono"},
        },
    },
    {   # Rouge/feu — spectre chaud avec contraste
        "name": "Ember", "slug": "ember",
        "config": {
            "palette": {"primary": "#ef4444", "background": "#0c0000",
                        "accents": {"films": "#ef4444", "series": "#f97316", "romm": "#eab308", "audio": "#f472b6", "komga": "#a855f7", "booklore": "#38bdf8", "compare": "#4ade80", "ranking": "#fbbf24"}},
            "card_style": "glass", "transition": "slide-up", "particles": True, "orbs": True,
            "grain": True, "spotlights": True, "finale_effect": "fireworks",
            "fonts": {"heading": "Syne", "body": "Outfit", "mono": "DM Mono"},
        },
    },
    {   # Bleu ocean — tons aqua avec touches chaudes
        "name": "Ocean", "slug": "ocean",
        "config": {
            "palette": {"primary": "#0ea5e9", "background": "#020c1b",
                        "accents": {"films": "#0ea5e9", "series": "#f472b6", "romm": "#2dd4bf", "audio": "#fbbf24", "komga": "#818cf8", "booklore": "#4ade80", "compare": "#a5f3fc", "ranking": "#f0abfc"}},
            "card_style": "glass", "transition": "slide-up", "particles": True, "orbs": True,
            "grain": True, "spotlights": True, "finale_effect": "fireworks",
            "fonts": {"heading": "Syne", "body": "Outfit", "mono": "DM Mono"},
        },
    },
    {   # Rose/magenta — romantique avec contraste violet/cyan
        "name": "Midnight Rose", "slug": "midnight-rose",
        "config": {
            "palette": {"primary": "#e11d48", "background": "#0c0010",
                        "accents": {"films": "#e11d48", "series": "#06b6d4", "romm": "#a855f7", "audio": "#f97316", "komga": "#f472b6", "booklore": "#4ade80", "compare": "#38bdf8", "ranking": "#fbbf24"}},
            "card_style": "glass", "transition": "slide-up", "particles": True, "orbs": True,
            "grain": True, "spotlights": True, "finale_effect": "confetti",
            "fonts": {"heading": "Syne", "body": "Outfit", "mono": "DM Mono"},
        },
    },
    {   # Vert nature — tons verts avec accents chauds
        "name": "Forest", "slug": "forest",
        "config": {
            "palette": {"primary": "#22c55e", "background": "#020e04",
                        "accents": {"films": "#22c55e", "series": "#f97316", "romm": "#eab308", "audio": "#06b6d4", "komga": "#a855f7", "booklore": "#f472b6", "compare": "#38bdf8", "ranking": "#ef4444"}},
            "card_style": "glass", "transition": "slide-up", "particles": True, "orbs": True,
            "grain": True, "spotlights": True, "finale_effect": "fireworks",
            "fonts": {"heading": "Syne", "body": "Outfit", "mono": "DM Mono"},
        },
    },
    {   # Neon Retro — violet/magenta synthwave
        "name": "Synthwave", "slug": "synthwave",
        "config": {
            "palette": {"primary": "#ff00dc", "background": "#0a0020",
                        "accents": {"films": "#ff00dc", "series": "#00ffff", "romm": "#b4ff39", "audio": "#ff6600", "komga": "#aa55ff", "booklore": "#00ff99", "compare": "#ff55aa", "ranking": "#ffee00"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # Cinema Classic — sepia chaud
        "name": "Pellicule", "slug": "pellicule",
        "config": {
            "palette": {"primary": "#d4a040", "background": "#1a0f05",
                        "accents": {"films": "#d4a040", "series": "#c07040", "romm": "#8a9060", "audio": "#b08050", "komga": "#907060", "booklore": "#a09070", "compare": "#c0a060", "ranking": "#b07050"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # Weyland-Yutani — interface Nostromo (jaune, vert, bleu, rouge)
        "name": "Phosphore", "slug": "phosphore",
        "config": {
            "palette": {"primary": "#ccaa00", "background": "#000800",
                        "accents": {"films": "#ccaa00", "series": "#44aadd", "romm": "#33cc55", "audio": "#33cc55", "komga": "#44aadd", "booklore": "#33cc55", "compare": "#cc3333", "ranking": "#cc3333"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # Pirate — or et ambre
        "name": "Tresor", "slug": "tresor",
        "config": {
            "palette": {"primary": "#d4a030", "background": "#1a0e04",
                        "accents": {"films": "#d4a030", "series": "#c07830", "romm": "#aa8830", "audio": "#b09030", "komga": "#907840", "booklore": "#a08838", "compare": "#c4a848", "ranking": "#b87830"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # Arcade — jaune/couleurs saturees retro
        "name": "Arcade", "slug": "arcade",
        "config": {
            "palette": {"primary": "#ffff00", "background": "#000020",
                        "accents": {"films": "#ffff00", "series": "#ff0066", "romm": "#00ff00", "audio": "#ff8800", "komga": "#00ccff", "booklore": "#ff00ff", "compare": "#00ff88", "ranking": "#ff4444"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # Matrix — vert digital
        "name": "Digital", "slug": "digital",
        "config": {
            "palette": {"primary": "#00dd00", "background": "#000500",
                        "accents": {"films": "#00dd00", "series": "#00bb00", "romm": "#00ff44", "audio": "#44dd00", "komga": "#00cc22", "booklore": "#22ee00", "compare": "#00ff00", "ranking": "#44ff22"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # Upside Down — rouge sombre
        "name": "Hawkins", "slug": "hawkins",
        "config": {
            "palette": {"primary": "#ff3030", "background": "#0a0000",
                        "accents": {"films": "#ff3030", "series": "#ff8800", "romm": "#ffcc00", "audio": "#ff5050", "komga": "#cc2020", "booklore": "#ff6644", "compare": "#ff4466", "ranking": "#ffaa22"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # Star Wars — bleu spatial
        "name": "Republique", "slug": "republique",
        "config": {
            "palette": {"primary": "#4488ff", "background": "#000510",
                        "accents": {"films": "#4488ff", "series": "#ff4444", "romm": "#44ddaa", "audio": "#ffcc44", "komga": "#aa88ff", "booklore": "#44ddff", "compare": "#88bbff", "ranking": "#ff8844"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # Sin City — noir, rouge, jaune, vert
        "name": "Basin City", "slug": "basin-city",
        "config": {
            "palette": {"primary": "#ff0033", "background": "#000000",
                        "accents": {"films": "#ff0033", "series": "#cccc00", "romm": "#33cc44", "audio": "#ff0033", "komga": "#cccc00", "booklore": "#33cc44", "compare": "#33cc44", "ranking": "#ff0033"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # Cinema Muet — sepia desature
        "name": "Muet", "slug": "muet",
        "config": {
            "palette": {"primary": "#c8b898", "background": "#0a0a0a",
                        "accents": {"films": "#c8b898", "series": "#b0a080", "romm": "#a09878", "audio": "#b8a888", "komga": "#a89880", "booklore": "#b0a078", "compare": "#c0b090", "ranking": "#b8a078"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # Abysse — bleu profond bioluminescent
        "name": "Abyssal", "slug": "abyssal",
        "config": {
            "palette": {"primary": "#00aaff", "background": "#000818",
                        "accents": {"films": "#00aaff", "series": "#00ffcc", "romm": "#4488ff", "audio": "#00ddaa", "komga": "#6688ff", "booklore": "#00ccff", "compare": "#44bbff", "ranking": "#00ff88"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # VHS — tons chauds retro
        "name": "Videoclub", "slug": "videoclub",
        "config": {
            "palette": {"primary": "#ff8844", "background": "#0a0808",
                        "accents": {"films": "#ff8844", "series": "#dd66aa", "romm": "#66cc44", "audio": "#ffcc22", "komga": "#cc88ff", "booklore": "#44bbdd", "compare": "#ff6644", "ranking": "#ffaa22"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # Comic — couleurs pop saturees
        "name": "Pop Art", "slug": "pop-art",
        "config": {
            "palette": {"primary": "#ff3366", "background": "#1a1a2e",
                        "accents": {"films": "#ff3366", "series": "#33ccff", "romm": "#33ff66", "audio": "#ffcc00", "komga": "#cc66ff", "booklore": "#ff6633", "compare": "#66ffcc", "ranking": "#ff0066"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # Chalkboard — couleurs craie pastels
        "name": "Craie", "slug": "craie",
        "config": {
            "palette": {"primary": "#e8e8c8", "background": "#1a2a1a",
                        "accents": {"films": "#e8e8c8", "series": "#ffbb88", "romm": "#88ddaa", "audio": "#ffdd88", "komga": "#bbaadd", "booklore": "#88ccdd", "compare": "#ddcc88", "ranking": "#ff9988"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
    {   # Noel — or chaud et rouge
        "name": "Feerie", "slug": "feerie",
        "config": {
            "palette": {"primary": "#ffcc44", "background": "#0a0a18",
                        "accents": {"films": "#ffcc44", "series": "#ff4444", "romm": "#44dd88", "audio": "#ff8844", "komga": "#cc88ff", "booklore": "#44bbff", "compare": "#ffaa44", "ranking": "#ff3333"}},
            "card_style": "glass", "transition": "slide-up",
        },
    },
]

DEFAULT_CONFIG = {
    "allow_registration": True,
    "allow_user_themes": True,
    "allow_user_comparison": True,
    "comparison_default_on": False,
    "visual_theme": "glass-dark",
    "recap_schedule": "0 2 1 1 *",
    "max_history_years": 5,
    "public_share_expiry_days": 30,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    if settings.redis_url:
        app.state.redis = aioredis.from_url(settings.redis_url, decode_responses=True)
    else:
        app.state.redis = None

    from app.models.share import GlobalConfig
    from app.models.theme import ThemePack
    from app.models.user import User

    async with async_session() as db:
        # First admin — only if explicitly configured via env (skip if using setup wizard)
        import os
        if os.environ.get("FIRST_ADMIN_PASSWORD") and settings.first_admin_password != "changeme":
            result = await db.execute(select(User).where(User.email == settings.first_admin_email))
            if not result.scalar_one_or_none():
                admin = User(
                    email=settings.first_admin_email,
                    hashed_password=hash_password(settings.first_admin_password),
                    display_name="Admin",
                    role="admin",
                )
                db.add(admin)
                logger.info("Premier compte admin créé: %s", settings.first_admin_email)

        # Builtin themes — create or update config
        for t in BUILTIN_THEMES:
            result = await db.execute(select(ThemePack).where(ThemePack.slug == t["slug"]))
            existing = result.scalar_one_or_none()
            if existing:
                existing.config = t["config"]
            else:
                db.add(ThemePack(name=t["name"], slug=t["slug"], is_builtin=True, config=t["config"]))

        # Default global config
        for key, value in DEFAULT_CONFIG.items():
            result = await db.execute(select(GlobalConfig).where(GlobalConfig.key == key))
            if not result.scalar_one_or_none():
                db.add(GlobalConfig(key=key, value=value))

        await db.commit()

    yield

    if app.state.redis:
        await app.state.redis.close()
    await engine.dispose()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers
from app.api.v1 import admin as admin_router
from app.api.v1 import auth as auth_router
from app.api.v1 import setup as setup_router
from app.api.v1 import media as media_router
from app.api.v1 import phrases as phrases_router
from app.api.v1 import recaps as recaps_router
from app.api.v1 import services as services_router
from app.api.v1 import share as share_router
from app.api.v1 import slides as slides_router
from app.api.v1 import themes as themes_router
from app.websocket.handlers import ws_admin_logs, ws_recap_progress

app.include_router(setup_router.router, prefix="/api/v1")
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(services_router.router, prefix="/api/v1")
app.include_router(recaps_router.router, prefix="/api/v1")
app.include_router(media_router.router, prefix="/api/v1")
app.include_router(slides_router.router, prefix="/api/v1")
app.include_router(phrases_router.router, prefix="/api/v1")
app.include_router(themes_router.router, prefix="/api/v1")
app.include_router(share_router.router, prefix="/api/v1")
app.include_router(admin_router.router, prefix="/api/v1")

app.add_api_websocket_route("/ws/recap-progress", ws_recap_progress)
app.add_api_websocket_route("/ws/admin-logs", ws_admin_logs)


# ── Health endpoint (no auth) ──
@app.get("/api/v1/health")
async def health():
    import os
    from app.version import __version__
    return {
        "status": "ok",
        "version": __version__,
        "commit": os.environ.get("COMMIT_SHA", "dev"),
        "build_date": os.environ.get("BUILD_DATE", ""),
    }


# ── Logs endpoint (admin only) ──
from fastapi import Query

@app.get("/api/v1/admin/logs")
async def get_logs(limit: int = Query(100, le=500), level: str = Query(None)):
    # No auth check here for debugging — in prod, add require_admin
    return log_store.get_logs(limit=limit, level=level)
