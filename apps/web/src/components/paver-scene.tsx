'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, RoundedBox } from '@react-three/drei';
import { useRef, useState } from 'react';
import type { Group } from 'three';

/**
 * Трёхмерная выкладка брусчатки: медленно вращающийся фрагмент мощения.
 * Геометрия строится программно — внешние 3D-модели не нужны,
 * поэтому сцена весит немного и не тянет файлы с диска.
 */

/** Раскладка «ёлочкой»: смещение рядов даёт узнаваемый рисунок мощения. */
const TILES = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 5 }, (_, column) => ({
    key: `${row}-${column}`,
    position: [column * 1.05 - 2.1 + (row % 2) * 0.5, 0, row * 1.05 - 2.1] as [
      number,
      number,
      number,
    ],
    // Три оттенка камня вперемешку — как в настоящей укладке
    tone: (row * 5 + column) % 3,
  })),
).flat();

const TONES = ['#b8ab9c', '#8d8073', '#d6cec2'];

function Paving() {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    // Плавное покачивание вместо равномерного вращения — выглядит живее
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.15) * 0.35 + 0.4;
    group.current.position.y = Math.sin(t * 0.4) * 0.06;
  });

  return (
    <group ref={group} rotation={[0.15, 0.4, 0]}>
      {TILES.map((tile) => (
        <RoundedBox
          key={tile.key}
          args={[1, 0.28, 1]}
          radius={0.05}
          smoothness={3}
          position={tile.position}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={TONES[tile.tone]} roughness={0.55} metalness={0.05} />
        </RoundedBox>
      ))}
    </group>
  );
}

export function PaverScene() {
  const [failed, setFailed] = useState(false);

  // Если WebGL недоступен (старый браузер, отключено ускорение) — тихо скрываем сцену.
  if (failed) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 4.2, 5.6], fov: 42 }}
        dpr={[1, 1.75]}
        onCreated={({ gl }) => gl.setClearAlpha(0)}
        onError={() => setFailed(true)}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 8, 4]} intensity={1.6} castShadow />
        <directionalLight position={[-5, 3, -3]} intensity={0.4} color="#c9a227" />
        <Paving />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
