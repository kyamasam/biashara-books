#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/biashara-books-backend"
APP_DIR="$SCRIPT_DIR/biashara-books-app"
ENV_FILE="$APP_DIR/.env"
NGROK_PORT=8080

# ── helpers ────────────────────────────────────────────────────────────────────

update_env() {
    local key=$1 value=$2
    if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
        sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
        echo "${key}=${value}" >> "$ENV_FILE"
    fi
}

wait_for_ngrok_url() {
    echo "[ngrok] Waiting for tunnel to be ready..."
    local attempts=0 url=""
    while [[ $attempts -lt 20 && -z "$url" ]]; do
        url=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null \
            | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for t in data.get('tunnels', []):
        if t.get('proto') == 'https':
            print(t['public_url'])
            break
except Exception:
    pass
" 2>/dev/null || true)
        [[ -z "$url" ]] && { sleep 2; ((attempts++)); }
    done
    echo "$url"
}

open_terminal() {
    local title=$1 cmd=$2
    osascript \
        -e "tell application \"Terminal\"" \
        -e "  activate" \
        -e "  set newTab to do script \"printf '\\\\033]0;${title}\\\\007'; ${cmd}\"" \
        -e "end tell" \
        > /dev/null 2>&1
}

# ── ngrok-only mode (called by VS Code task) ──────────────────────────────────

if [[ "${1:-}" == "--ngrok-only" ]]; then
    echo "[ngrok] Starting tunnel on port $NGROK_PORT..."
    ngrok http "$NGROK_PORT" &
    NGROK_PID=$!

    URL=$(wait_for_ngrok_url)

    if [[ -n "$URL" ]]; then
        echo "[ngrok] Tunnel URL: $URL"
        update_env "EXPO_PUBLIC_API_URL" "${URL}/"
        echo "[ngrok] Updated ${ENV_FILE}"
        echo "[ngrok] EXPO_PUBLIC_API_URL=${URL}/"
    else
        echo "[ngrok] ERROR: Could not get tunnel URL after 40 seconds."
        echo "[ngrok] Update EXPO_PUBLIC_API_URL in .env manually."
    fi

    # Keep alive so the VS Code terminal stays open
    wait "$NGROK_PID"
    exit 0
fi

# ── full mode: open separate macOS Terminal windows ───────────────────────────

echo "Starting Biashara Books dev environment..."

open_terminal "Backend" "cd '${BACKEND_DIR}' && ./mvnw spring-boot:run"
open_terminal "Expo App" "cd '${APP_DIR}' && nvm use 22 && npx expo start"

echo "[ngrok] Starting tunnel on port $NGROK_PORT..."
ngrok http "$NGROK_PORT" > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

URL=$(wait_for_ngrok_url)

if [[ -n "$URL" ]]; then
    update_env "EXPO_PUBLIC_API_URL" "${URL}/"
    echo ""
    echo "────────────────────────────────────────────"
    echo "  EXPO_PUBLIC_API_URL=${URL}/"
    echo "  Updated: ${ENV_FILE}"
    echo "────────────────────────────────────────────"
    # Hand off — keep ngrok running in this terminal
    open_terminal "Ngrok" "tail -f /tmp/ngrok.log"
    wait "$NGROK_PID"
else
    echo "ERROR: Could not get ngrok URL. Update .env manually."
    wait "$NGROK_PID"
fi
