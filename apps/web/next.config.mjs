import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Next читает .env только из своей папки, а у нас он общий и лежит в корне
// монорепо. Подхватываем его вручную, иначе сайт не увидит, например,
// REVALIDATE_SECRET и будет отклонять сброс кеша от API.
const rootEnv = path.join(__dirname, '../../.env');
if (fs.existsSync(rootEnv)) {
  for (const line of fs.readFileSync(rootEnv, 'utf8').split('\n')) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const [, key, raw] = match;
    if (process.env[key] === undefined) {
      process.env[key] = raw.replace(/^["']|["']$/g, '');
    }
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Пакет общих типов подключается из монорепо и компилируется вместе с приложением
  transpilePackages: ['@qazaq-tas/shared'],
  // Корень монорепо — чтобы сборка правильно определяла зависимости
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,

  // Загруженные через админку файлы хранит и раздаёт API,
  // но на сайте они доступны по короткому адресу /uploads/...
  async rewrites() {
    const api = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api').replace(
      /\/api\/?$/,
      '',
    );
    return [{ source: '/uploads/:path*', destination: `${api}/uploads/:path*` }];
  },
};

export default nextConfig;
