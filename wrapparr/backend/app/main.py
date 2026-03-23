import logging
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.config import settings
from app.core.database import Base, async_session, engine
from app.core.security import hash_password

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
]

DEFAULT_CONFIG = {
    "allow_registration": True,
    "allow_user_themes": True,
    "allow_user_comparison": True,
    "recap_schedule": "0 2 1 1 *",
    "max_history_years": 5,
    "public_share_expiry_days": 30,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    app.state.redis = aioredis.from_url(settings.redis_url, decode_responses=True)

    from app.models.share import GlobalConfig
    from app.models.theme import ThemePack
    from app.models.user import User

    async with async_session() as db:
        # First admin
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
from app.api.v1 import media as media_router
from app.api.v1 import phrases as phrases_router
from app.api.v1 import recaps as recaps_router
from app.api.v1 import services as services_router
from app.api.v1 import share as share_router
from app.api.v1 import slides as slides_router
from app.api.v1 import themes as themes_router
from app.websocket.handlers import ws_admin_logs, ws_recap_progress

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
