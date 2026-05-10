'use client';

import { AsciiScene, type ArtworkKind } from '@/components/AsciiScene';
import { Nav } from '@/components/Nav';

const LIBRARY: Array<{
  title: string;
  type: string;
  kind: ArtworkKind;
  resolution: number;
  characters: string;
  color?: boolean;
  scale?: number;
  cameraZ?: number;
}> = [
  { title: 'Urchin', type: '3D', kind: 'urchin', resolution: 0.32, characters: ' .:-=+*#%@', scale: 0.72, cameraZ: 8.4 },
  { title: 'Knot', type: '3D', kind: 'knot', resolution: 0.34, characters: ' .,:;irsXA253hMHGS#9B&@', scale: 0.78, cameraZ: 8.2 },
  { title: 'Torus', type: 'Interactive', kind: 'torus', resolution: 0.31, characters: '  `.-:+*=%@', scale: 0.78, cameraZ: 8.0 },
  { title: 'Sphere', type: 'Image', kind: 'sphere', resolution: 0.33, characters: ' .oO0@', color: true, scale: 0.76, cameraZ: 8.0 },
  { title: 'Box', type: 'Text', kind: 'box', resolution: 0.34, characters: ' .[]#', scale: 0.72, cameraZ: 8.6 },
  { title: 'Shell', type: 'Video', kind: 'urchin', resolution: 0.36, characters: ' .:-+*#%@', scale: 0.6, cameraZ: 9.2 },
  { title: 'Cone', type: '3D', kind: 'cone', resolution: 0.32, characters: ' .-+x#@', scale: 0.72, cameraZ: 8.0 },
  { title: 'Capsule', type: '3D', kind: 'capsule', resolution: 0.34, characters: ' .:coO8@', scale: 0.72, cameraZ: 8.4 },
  { title: 'Dodeca', type: '3D', kind: 'dodeca', resolution: 0.33, characters: ' .,:;+=xX$@', scale: 0.78, cameraZ: 8.2 },
  { title: 'Octa', type: '3D', kind: 'octa', resolution: 0.34, characters: ' .`^"*#@', scale: 0.76, cameraZ: 8.4 },
  { title: 'Grid', type: 'Interactive', kind: 'grid', resolution: 0.35, characters: ' .:-=+*#%@', scale: 0.82, cameraZ: 8.4 },
  { title: 'Mono', type: 'Text', kind: 'torus', resolution: 0.38, characters: ' 01', scale: 0.72, cameraZ: 8.8 },
];

export default function Home() {
  return (
    <main className="page-shell">
      <Nav />

      <section className="library-grid" aria-label="Library">
        {LIBRARY.map((item) => (
          <article className="library-card" key={item.title}>
            <div className="card-preview">
              <AsciiScene
                kind={item.kind}
                characters={item.characters}
                resolution={item.resolution}
                color={item.color}
                scale={item.scale}
                cameraZ={item.cameraZ}
              />
            </div>
            <div className="card-meta">
              <span>{item.title}</span>
              <a href={`/studio?kind=${item.kind}`}>{item.type}</a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
