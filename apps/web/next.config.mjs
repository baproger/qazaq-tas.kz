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
};

export default nextConfig;
