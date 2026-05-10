'use client';

import React, { useMemo, useRef } from 'react';
import { AsciiRenderer, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

export type ArtworkKind =
  | 'urchin'
  | 'sphere'
  | 'box'
  | 'torus'
  | 'knot'
  | 'cone'
  | 'capsule'
  | 'dodeca'
  | 'octa'
  | 'grid';

interface AsciiSceneProps {
  kind?: ArtworkKind;
  characters?: string;
  resolution?: number;
  invert?: boolean;
  color?: boolean;
  rotation?: { x: number; y: number; z: number };
  scale?: number;
  cameraZ?: number;
  interactive?: boolean;
  modelUrl?: string | null;
  modelType?: 'stl' | 'gltf' | null;
}

function deterministicNoise(index: number): number {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function makeGeometry(kind: ArtworkKind): THREE.BufferGeometry {
  if (kind === 'box') return new THREE.BoxGeometry(2, 2, 2, 12, 12, 12);
  if (kind === 'torus') return new THREE.TorusGeometry(1.18, 0.36, 40, 160);
  if (kind === 'knot') return new THREE.TorusKnotGeometry(0.98, 0.28, 220, 28);
  if (kind === 'cone') return new THREE.ConeGeometry(1.25, 2.4, 72, 24);
  if (kind === 'capsule') return new THREE.CapsuleGeometry(0.82, 1.55, 18, 48);
  if (kind === 'dodeca') return new THREE.DodecahedronGeometry(1.45, 2);
  if (kind === 'octa') return new THREE.OctahedronGeometry(1.65, 3);
  if (kind === 'grid') return new THREE.TorusKnotGeometry(1.15, 0.12, 260, 12, 3, 7);

  const geometry = new THREE.SphereGeometry(1.45, 72, 36);
  if (kind !== 'urchin') return geometry;

  const position = geometry.attributes.position;
  for (let index = 0; index < position.count; index += 1) {
    if (deterministicNoise(index) < 0.82) continue;

    const vector = new THREE.Vector3().fromBufferAttribute(position, index);
    vector.normalize().multiplyScalar(1.4 + deterministicNoise(index + 9) * 0.95);
    position.setXYZ(index, vector.x, vector.y, vector.z);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function ProceduralMesh({
  kind,
  rotation,
  scale,
}: Required<Pick<AsciiSceneProps, 'kind' | 'rotation' | 'scale'>>) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => makeGeometry(kind), [kind]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const t = clock.elapsedTime;
    meshRef.current.rotation.x = rotation.x + t * 0.12;
    meshRef.current.rotation.y = rotation.y + t * 0.18;
    meshRef.current.rotation.z = rotation.z + t * 0.05;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color="#f6f6f6" roughness={0.55} metalness={0.12} />
    </mesh>
  );
}

function StlModel({
  url,
  rotation,
  scale,
}: {
  url: string;
  rotation: { x: number; y: number; z: number };
  scale: number;
}) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef<THREE.Mesh>(null);

  useMemo(() => {
    geometry.center();
    geometry.computeVertexNormals();
  }, [geometry]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    meshRef.current.rotation.x = rotation.x + t * 0.1;
    meshRef.current.rotation.y = rotation.y + t * 0.16;
    meshRef.current.rotation.z = rotation.z;
    meshRef.current.scale.setScalar(scale * 0.025);
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color="#f6f6f6" roughness={0.52} metalness={0.08} />
    </mesh>
  );
}

function GltfModel({
  url,
  rotation,
  scale,
}: {
  url: string;
  rotation: { x: number; y: number; z: number };
  scale: number;
}) {
  const gltf = useLoader(GLTFLoader, url);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.rotation.x = rotation.x + t * 0.1;
    groupRef.current.rotation.y = rotation.y + t * 0.16;
    groupRef.current.rotation.z = rotation.z;
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function StableAsciiRenderer({
  characters,
  color,
  invert,
  resolution,
}: {
  characters: string;
  color: boolean;
  invert: boolean;
  resolution: number;
}) {
  const { size } = useThree();
  if (
    !Number.isFinite(size.width) ||
    !Number.isFinite(size.height) ||
    size.width < 2 ||
    size.height < 2
  ) {
    return null;
  }

  return (
    <AsciiRenderer
      characters={characters}
      color={color}
      fgColor={color ? '#d7f5ff' : '#f4f4f4'}
      bgColor="#050507"
      resolution={resolution}
      invert={invert}
    />
  );
}

export function AsciiScene({
  kind = 'urchin',
  characters = ' .:-=+*#%@',
  resolution = 0.3,
  invert = false,
  color = false,
  rotation = { x: 0, y: 0, z: 0 },
  scale = 0.82,
  cameraZ = 7.2,
  interactive = true,
  modelUrl,
  modelType,
}: AsciiSceneProps) {
  return (
    <div className="ascii-scene">
      <Canvas dpr={1} camera={{ position: [0, 0, cameraZ], fov: 42 }}>
        <color attach="background" args={['#050507']} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[2.5, 4, 5]} intensity={2.3} />
        {modelUrl && modelType === 'stl' ? (
          <StlModel url={modelUrl} rotation={rotation} scale={scale} />
        ) : null}
        {modelUrl && modelType === 'gltf' ? (
          <GltfModel url={modelUrl} rotation={rotation} scale={scale} />
        ) : null}
        {!modelUrl ? <ProceduralMesh kind={kind} rotation={rotation} scale={scale} /> : null}
        {interactive ? (
          <OrbitControls
            enableDamping
            enablePan={false}
            enableZoom
            dampingFactor={0.08}
            minDistance={3.8}
            maxDistance={12}
          />
        ) : null}
        <StableAsciiRenderer
          characters={characters}
          color={color}
          invert={invert}
          resolution={resolution}
        />
      </Canvas>
    </div>
  );
}
