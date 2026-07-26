#!/usr/bin/env bash
# ---------------------------------------------------------------
# Развёртывание QAZAQ TAS ERP на продакшене (Plesk / Hoster.kz).
#
# Вызывается Plesk после получения кода из GitHub (ветка main)
# либо вручную: bash scripts/deploy.sh
#
# Требования на сервере: Node.js 20+, доступ к MariaDB, файл .env
# ---------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Проверка файла окружения"
if [ ! -f .env ]; then
  echo "ОШИБКА: файл .env не найден. Создайте его на основе .env.example." >&2
  exit 1
fi

echo "==> Установка зависимостей"
# devDependencies нужны для сборки Next.js и NestJS, поэтому без --omit=dev.
npm ci

echo "==> Генерация Prisma-клиента"
npm run db:generate

echo "==> Применение миграций базы данных"
npm run db:deploy

echo "==> Сборка приложений"
npm run build

echo "==> Перезапуск процессов"
# Plesk перезапускает Node.js-приложение при появлении файла tmp/restart.txt
mkdir -p tmp && touch tmp/restart.txt

echo "==> Развёртывание завершено"
