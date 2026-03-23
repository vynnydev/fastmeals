#!/bin/sh
set -e

echo "🔄 Running migrations..."
npx prisma migrate deploy 2>/dev/null || echo "⚠️  Migrations skipped"

echo "🌱 Running seed..."
npx prisma db seed 2>/dev/null || echo "⚠️  Seed skipped or already applied"

echo "🚀 Starting server..."
exec node dist/src/server.js