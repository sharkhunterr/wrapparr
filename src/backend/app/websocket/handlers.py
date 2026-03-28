import logging

from fastapi import WebSocket, WebSocketDisconnect
from jose import JWTError

from app.core.security import decode_token

logger = logging.getLogger("wrapparr.ws")

# Active WebSocket connections per user
_connections: dict[str, list[WebSocket]] = {}


async def ws_recap_progress(websocket: WebSocket):
    """WebSocket endpoint for real-time recap generation progress."""
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Token manquant")
        return

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001, reason="Token invalide")
            return
    except JWTError:
        await websocket.close(code=4001, reason="Token invalide ou expiré")
        return

    await websocket.accept()

    if user_id not in _connections:
        _connections[user_id] = []
    _connections[user_id].append(websocket)

    try:
        while True:
            # Keep connection alive, client sends pings
            await websocket.receive_text()
    except WebSocketDisconnect:
        _connections[user_id].remove(websocket)
        if not _connections[user_id]:
            del _connections[user_id]


async def broadcast_progress(user_id: str, recap_id: str, status: str, progress: int, message: str):
    """Broadcast progress update to all WebSocket connections for a user."""
    connections = _connections.get(user_id, [])
    payload = {
        "type": "progress",
        "recap_id": recap_id,
        "status": status,
        "progress": progress,
        "progress_msg": message,
    }
    for ws in connections[:]:
        try:
            await ws.send_json(payload)
        except Exception:
            connections.remove(ws)


async def ws_admin_logs(websocket: WebSocket):
    """WebSocket endpoint for admin real-time logs."""
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Token manquant")
        return

    try:
        payload = decode_token(token)
        if payload.get("role") != "admin":
            await websocket.close(code=4003, reason="Accès admin requis")
            return
    except JWTError:
        await websocket.close(code=4001, reason="Token invalide")
        return

    await websocket.accept()

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
