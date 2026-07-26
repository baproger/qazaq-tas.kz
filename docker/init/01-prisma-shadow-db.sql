-- Prisma Migrate создаёт временную «теневую» базу, чтобы проверить миграцию
-- перед применением. Пользователю приложения нужны права на такие базы.
-- Скрипт выполняется автоматически при первом создании контейнера MariaDB.
GRANT ALL PRIVILEGES ON `prisma_migrate_shadow_db%`.* TO 'qazaqtas'@'%';
FLUSH PRIVILEGES;
