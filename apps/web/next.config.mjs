import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
