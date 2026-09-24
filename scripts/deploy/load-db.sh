#!/usr/bin/env bash
# Copia o banco local (já com os dados do TSE importados) para o Postgres de produção.
# Uso: DATABASE_URL='postgresql://...' scripts/deploy/load-db.sh
# Usa as ferramentas do Postgres via Docker (não precisa instalar o cliente). APAGA as tabelas do
# destino antes de restaurar (--clean): use só na carga inicial ou para republicar a base inteira.
set -euo pipefail
: "${DATABASE_URL:?defina DATABASE_URL com a URL do Postgres de produção}"

cd "$(dirname "$0")/../.."
DUMP="$(mktemp -t votocola-XXXX.dump)"
trap 'rm -f "$DUMP"' EXIT

echo "1/2 Exportando o banco local..."
docker compose exec -T db pg_dump -U "${DB_USER:-votocerto}" -d "${DB_NAME:-votocerto}" \
  --format=custom --no-owner --no-privileges > "$DUMP"
ls -lh "$DUMP" | awk '{print "    dump:", $5}'

echo "2/2 Restaurando em produção..."
docker run --rm -i --network host postgres:17-alpine \
  pg_restore --no-owner --no-privileges --clean --if-exists --exit-on-error -d "$DATABASE_URL" < "$DUMP"

echo "Conferindo:"
docker run --rm --network host postgres:17-alpine psql "$DATABASE_URL" -tAc \
  "SELECT 'candidatos: ' || count(*) FROM candidates UNION ALL
   SELECT 'migrations: ' || count(*) FROM migrations"
