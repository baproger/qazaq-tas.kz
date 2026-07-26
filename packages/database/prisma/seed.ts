/**
 * Начальные данные QAZAQ TAS ERP.
 * Запуск: npm run db:seed
 *
 * Создаёт по одному пользователю на каждую роль, чтобы сразу проверить доступы.
 * Пароль берётся из переменной SEED_PASSWORD, иначе используется значение по умолчанию.
 * ПОСЛЕ ПЕРВОГО ВХОДА В ПРОДАКШЕНЕ ПАРОЛИ ОБЯЗАТЕЛЬНО СМЕНИТЬ.
 */
import { hash } from 'bcryptjs';
import { PrismaClient, UserRole } from '../generated/prisma';
import { seedSite } from './seed-site';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = process.env.SEED_PASSWORD ?? 'QazaqTas2026!';

const users: Array<{ email: string; fullName: string; position: string; role: UserRole }> = [
  {
    email: 'director@qazaq-tas.kz',
    fullName: 'Директор',
    position: 'Директор компании',
    role: UserRole.DIRECTOR,
  },
  {
    email: 'admin@qazaq-tas.kz',
    fullName: 'Администратор системы',
    position: 'Системный администратор',
    role: UserRole.ADMIN,
  },
  {
    email: 'sales@qazaq-tas.kz',
    fullName: 'Менеджер продаж',
    position: 'Менеджер отдела продаж',
    role: UserRole.SALES_MANAGER,
  },
  {
    email: 'production@qazaq-tas.kz',
    fullName: 'Начальник производства',
    position: 'Начальник цеха',
    role: UserRole.PRODUCTION,
  },
  {
    email: 'warehouse@qazaq-tas.kz',
    fullName: 'Заведующий складом',
    position: 'Кладовщик',
    role: UserRole.WAREHOUSE,
  },
  {
    email: 'accountant@qazaq-tas.kz',
    fullName: 'Бухгалтер',
    position: 'Главный бухгалтер',
    role: UserRole.ACCOUNTANT,
  },
];

async function main(): Promise<void> {
  console.log('Загрузка начальных данных QAZAQ TAS ERP...');

  const passwordHash = await hash(DEFAULT_PASSWORD, 12);

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { fullName: user.fullName, position: user.position, role: user.role },
      create: { ...user, passwordHash },
    });
    console.log(`  пользователь: ${user.email} (${user.role})`);
  }

  await seedSite(prisma);

  console.log(`\nГотово. Пароль для всех учётных записей: ${DEFAULT_PASSWORD}`);
  console.log('В продакшене смените пароли сразу после первого входа.');
}

main()
  .catch((error: unknown) => {
    console.error('Ошибка загрузки начальных данных:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
