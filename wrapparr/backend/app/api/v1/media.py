import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import Response

from app.core.config import settings
from app.core.security import get_current_user

router = APIRouter(prefix="/media", tags=["media"])

TMDB_BASE = "https://image.tmdb.org/t/p"
OL_BASE = "https://covers.openlibrary.org/b"
CACHE_TTL = 7 * 24 * 3600  # 7 days


@router.get("/poster")
async def get_poster(
    request: Request,
    type: str = Query(..., description="tmdb ou openlibrary"),
    id: str = Query(..., description="ID ou ISBN"),
    size: str = Query("w300", description="w300 ou w780"),
    _user=Depends(get_current_user),
):
    cache_key = f"poster:{type}:{id}:{size}"
    redis = request.app.state.redis

    # Check cache
    cached = await redis.get(cache_key)
    if cached:
        return Response(content=cached.encode("latin-1"), media_type="image/jpeg")

    # Fetch from source
    if type == "tmdb":
        url = f"{TMDB_BASE}/{size}/{id}"
    elif type == "openlibrary":
        url = f"{OL_BASE}/isbn/{id}-L.jpg"
    else:
        raise HTTPException(status_code=400, detail="Type inconnu. Utilisez 'tmdb' ou 'openlibrary'")

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            raise HTTPException(status_code=404, detail="Affiche introuvable")

        # Cache the image data
        image_data = resp.content
        await redis.setex(cache_key, CACHE_TTL, image_data.decode("latin-1"))

        return Response(content=image_data, media_type=resp.headers.get("content-type", "image/jpeg"))
