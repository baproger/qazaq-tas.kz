'use client';

import { Environment, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { Group, Mesh } from 'three';

/**
 * Трёхмерная укладка брусчатки, которая собирается по мере прокрутки страницы.
 *
 * В начале плитки разлетелись и подняты над основанием; чем ниже пролистана
 * страница, тем ближе они к своему месту в рисунке мощения. Геометрия строится
 * программно, поэтому внешние 3D-модели не нужны и сцена весит немного.
 */

const ROWS = 6;
const COLUMNS = 6;
const TILE = 1.02;

/** Три оттенка мраморного композита — как в настоящей укладке. */
const TONES = ['#c3b6a6', '#8f8274', '#ded6cb'];

interface TileData {
  key: string;
  /** Куда плитка должна лечь */
  target: [number, number, number];
  /** Откуда прилетает */
  start: [number, number, number];
  startRotation: [number, number, number];
  tone: string;
  /** Сдвиг по времени, чтобы плитки ложились волной, а не разом */
  delay: number;
}

const TILES: TileData[] = Array.from({ length: ROWS }, (_, row) =>
  Array.from({ length: COLUMNS }, (_, column): TileData => {
    // Смещение чётных рядов даёт узнаваемый рисунок мощения вразбежку
    const x = column * TILE - (COLUMNS - 1) * TILE * 0.5 + (row % 2) * TILE * 0.5;
    const z = row * TILE - (ROWS - 1) * TILE * 0.5;
    const index = row * COLUMNS + column;

    // Псевдослучайный, но одинаковый при каждой отрисовке разлёт
    const scatter = (seed: number) => (Math.sin(index * seed) + Math.cos(index * seed * 1.7)) * 0.5;

    return {
      key: `${row}-${column}`,
      target: [x, 0, z],
      start: [x + scatter(12.9) * 3.5, 2.5 + scatter(7.3) * 2.4, z + scatter(4.1) * 3.5],
      startRotation: [scatter(3.7) * 1.2, scatter(9.1) * 1.6, scatter(5.3) * 1.2],
      tone: TONES[index % TONES.length] as string,
      // Дальние ряды ложатся первыми
      delay: (row / ROWS) * 0.45,
    };
  }),
).flat();

/** Плавное замедление к концу — движение выглядит «тяжёлым», как настоящий камень. */
function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}

function Tile({ tile, progress }: { tile: TileData; progress: React.RefObject<number> }) {
  const mesh = useRef<Mesh>(null);

  useFrame(() => {
    if (!mesh.current) return;

    // Своя доля общего прогресса: плитка «летит» только внутри своего окна
    const local = Math.min(1, Math.max(0, (progress.current - tile.delay) / (1 - tile.delay)));
    const t = easeOutCubic(local);

    mesh.current.position.set(
      tile.start[0] + (tile.target[0] - tile.start[0]) * t,
      tile.start[1] + (tile.target[1] - tile.start[1]) * t,
      tile.start[2] + (tile.target[2] - tile.start[2]) * t,
    );
    mesh.current.rotation.set(
      tile.startRotation[0] * (1 - t),
      tile.startRotation[1] * (1 - t),
      tile.startRotation[2] * (1 - t),
    );
  });

  return (
    <RoundedBox ref={mesh} args={[1, 0.3, 1]} radius={0.05} smoothness={3} castShadow receiveShadow>
      <meshStandardMaterial color={tile.tone} roughness={0.5} metalness={0.06} />
    </RoundedBox>
  );
}

function Paving({ progress }: { progress: React.RefObject<number> }) {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    // Лёгкое покачивание, чтобы сцена не выглядела застывшей после сборки
    group.current.rotation.y = 0.35 + Math.sin(state.clock.elapsedTime * 0.18) * 0.12;
  });

  return (
    <group ref={group} rotation={[0.1, 0.35, 0]}>
      {TILES.map((tile) => (
        <Tile key={tile.key} tile={tile} progress={progress} />
      ))}
    </group>
  );
}

export function PaverScene() {
  const container = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Уважаем системную настройку «уменьшить движение»: сразу показываем
    // собранную укладку и не анимируем её при прокрутке.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      progress.current = 1;
      return;
    }

    function update() {
      const element = container.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      const passed = window.innerHeight - rect.top;
      progress.current = Math.min(1, Math.max(0, passed / total)) * 1.6;
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div ref={container} className="pointer-events-none absolute inset-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 4.4, 6], fov: 40 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearAlpha(0)}
        // Если WebGL недоступен — сцена просто исчезает, страница остаётся целой
        onError={() => setEnabled(false)}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 9, 4]} intensity={1.7} castShadow />
        <directionalLight position={[-6, 3, -4]} intensity={0.45} color="#c9a227" />
        <Paving progress={progress} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
