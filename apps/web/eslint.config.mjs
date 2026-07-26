import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

// Next 16 использует плоскую конфигурацию ESLint (команда `next lint` удалена).
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'out/**'],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default config;
