#!/usr/bin/env bash
# Envia fotos e planos de governo (packages/vc-api/storage) para o volume do Fly.
# O `fly ssh sftp` é muito lento/instável a partir do WSL; em vez disso, este script serve o pacote
# por um túnel HTTPS temporário (cloudflared) e a própria máquina do Fly baixa e extrai.
# O túnel serve só /storage.tgz (dados públicos do TSE) e é encerrado ao final.
# Uso: scripts/deploy/upload-storage.sh [app]   (padrão: votocola)
set -euo pipefail
APP="${1:-votocola}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CLOUDFLARED="$ROOT/node_modules/cloudflared/bin/cloudflared"
PORT=8099
WORK="$(mktemp -d)"
cleanup() { kill "${SERVER_PID:-}" "${TUNNEL_PID:-}" 2>/dev/null || true; rm -rf "$WORK"; }
trap cleanup EXIT

[ -x "$CLOUDFLARED" ] || { echo "cloudflared não encontrado: rode a API em dev uma vez (baixa o binário)"; exit 1; }

echo "1/4 Empacotando..."
tar -czf "$WORK/storage.tgz" -C "$ROOT/packages/vc-api/storage" fotos planos
ls -lh "$WORK/storage.tgz" | awk '{print "    ", $5}'

echo "2/4 Servindo pelo túnel temporário..."
node -e '
  const { createReadStream, statSync } = require("node:fs");
  const file = process.argv[1];
  require("node:http").createServer((req, res) => {
    if (req.url !== "/storage.tgz") return res.writeHead(404).end();
    res.writeHead(200, { "content-length": statSync(file).size });
    createReadStream(file).pipe(res);
  }).listen(Number(process.argv[2]), "127.0.0.1");
' "$WORK/storage.tgz" "$PORT" &
SERVER_PID=$!
"$CLOUDFLARED" tunnel --no-autoupdate --url "http://localhost:$PORT" > "$WORK/tunnel.log" 2>&1 &
TUNNEL_PID=$!
for _ in $(seq 1 60); do
  URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$WORK/tunnel.log" | head -1 || true)
  [ -n "$URL" ] && break
  sleep 1
done
[ -n "${URL:-}" ] || { echo "túnel não subiu"; exit 1; }
sleep 8

echo "3/4 Baixando e extraindo no Fly ($APP)..."
fly ssh console --app "$APP" -q -C "sh -c 'cd /app/packages/vc-api/storage && rm -f storage.tgz /tmp/storage.status && (nohup sh -c \"wget -q -O storage.tgz $URL/storage.tgz && tar -xzf storage.tgz && rm storage.tgz && echo OK > /tmp/storage.status || echo FALHOU > /tmp/storage.status\" > /tmp/storage.log 2>&1 &)'"
for _ in $(seq 1 120); do
  STATUS=$(fly ssh console --app "$APP" -q -C "cat /tmp/storage.status" 2>/dev/null | tr -d '\r' || true)
  [ -n "$STATUS" ] && break
  sleep 10
done
[ "${STATUS:-}" = "OK" ] || { echo "falhou (status: ${STATUS:-sem resposta}); veja /tmp/storage.log na máquina"; exit 1; }

echo "4/4 Conferindo..."
fly ssh console --app "$APP" -q -C "sh -c 'cd /app/packages/vc-api/storage && echo fotos: \$(ls fotos | wc -l) planos: \$(ls planos | wc -l)'"
