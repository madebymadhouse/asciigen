'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DEFAULT_CHARS, imageDataToAscii } from '@asciigen/engine';
import { AsciiScene, type ArtworkKind } from '@/components/AsciiScene';
import { Nav } from '@/components/Nav';

type SourceMode = 'image' | 'video' | '3d' | 'text';
type ModelType = 'stl' | 'gltf';

const MODES: SourceMode[] = ['image', 'video', '3d', 'text'];
const KINDS: ArtworkKind[] = [
  'urchin',
  'knot',
  'torus',
  'sphere',
  'box',
  'cone',
  'capsule',
  'dodeca',
  'octa',
  'grid',
];

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="control">
      <span>
        {label}
        <b>{value.toFixed(step < 1 ? 2 : 0)}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number.parseFloat(event.target.value))}
      />
    </label>
  );
}

function StudioContent() {
  const searchParams = useSearchParams();
  const initialKind = searchParams.get('kind');
  const safeInitialKind = KINDS.includes(initialKind as ArtworkKind)
    ? (initialKind as ArtworkKind)
    : 'urchin';

  const [mode, setMode] = useState<SourceMode>('3d');
  const [kind, setKind] = useState<ArtworkKind>(safeInitialKind);
  const [characters, setCharacters] = useState(DEFAULT_CHARS);
  const [width, setWidth] = useState(96);
  const [contrast, setContrast] = useState(0);
  const [resolution, setResolution] = useState(0.34);
  const [invert, setInvert] = useState(false);
  const [color, setColor] = useState(false);
  const [scale, setScale] = useState(0.76);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [fileName, setFileName] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [modelType, setModelType] = useState<ModelType | null>(null);
  const [ascii, setAscii] = useState('');
  const [textInput, setTextInput] = useState('ASCIIGEN');
  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  const updateFromCanvas = useCallback(
    (canvas: HTMLCanvasElement) => {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      setAscii(
        imageDataToAscii(imageData, {
          width,
          characters,
          contrast,
          invert,
        }),
      );
    },
    [characters, contrast, invert, width],
  );

  const renderImage = useCallback(() => {
    const image = imageRef.current;
    if (!image || !image.naturalWidth || !image.naturalHeight) return;

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(image, 0, 0);
    updateFromCanvas(canvas);
  }, [updateFromCanvas]);

  const renderVideoFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0);
    updateFromCanvas(canvas);
  }, [updateFromCanvas]);

  useEffect(() => {
    if (mode !== 'image' && mode !== 'video') return;

    const frame = window.requestAnimationFrame(() => {
      if (mode === 'image') renderImage();
      if (mode === 'video') renderVideoFrame();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [characters, contrast, invert, mode, renderImage, renderVideoFrame, width]);

  const textAscii = useMemo(() => {
    const ramp = characters || DEFAULT_CHARS;
    const line = textInput || ' ';
    return Array.from({ length: 18 }, (_, row) =>
      Array.from({ length: width }, (_, col) => {
        const source = line[(col + row) % line.length] ?? ' ';
        const rampIndex = (source.charCodeAt(0) + row + col) % ramp.length;
        return ramp[rampIndex];
      }).join(''),
    ).join('\n');
  }, [characters, textInput, width]);

  const exportText = mode === 'text' ? textAscii : ascii;

  const setFile = (file: File | null) => {
    if (!file) return;
    const nextUrl = URL.createObjectURL(file);
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);

    setMediaUrl(nextUrl);
    setFileName(file.name);
    setAscii('');

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (mode === '3d') {
      setModelType(extension === 'stl' ? 'stl' : 'gltf');
    }
  };

  const downloadAscii = () => {
    if (!exportText) return;
    const blob = new Blob([`${exportText}\n`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'asciigen.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const preview = useMemo(() => {
    if (mode === '3d') {
      return (
        <AsciiScene
          kind={kind}
          characters={characters}
          resolution={resolution}
          invert={invert}
          color={color}
          rotation={rotation}
          scale={scale}
          cameraZ={8.4}
          modelUrl={mediaUrl}
          modelType={modelType}
        />
      );
    }

    return (
      <pre className="ascii-output" aria-label="Output">
        {exportText || ' '}
      </pre>
    );
  }, [characters, color, exportText, invert, kind, mediaUrl, mode, modelType, resolution, rotation, scale]);

  return (
    <main className="studio-shell">
      <Nav />
      <aside className="studio-panel">
        <div className="segmented">
          {MODES.map((item) => (
            <button
              type="button"
              className={mode === item ? 'active' : ''}
              key={item}
              onClick={() => {
                setMode(item);
                setAscii('');
                setFileName('');
                if (mediaUrl) URL.revokeObjectURL(mediaUrl);
                setMediaUrl(null);
                setModelType(null);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {mode === '3d' ? (
          <label className="control">
            <span>Kind</span>
            <select value={kind} onChange={(event) => setKind(event.target.value as ArtworkKind)}>
              {KINDS.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {mode === 'text' ? (
          <label className="control">
            <span>Text</span>
            <input value={textInput} onChange={(event) => setTextInput(event.target.value)} />
          </label>
        ) : null}

        {mode !== 'text' ? (
          <label className="drop-input">
            <input
              type="file"
              accept={
                mode === 'image'
                  ? 'image/*'
                  : mode === 'video'
                    ? 'video/*'
                    : '.stl,.gltf,.glb,model/stl,model/gltf-binary,model/gltf+json'
              }
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <span>Upload</span>
            <b>{fileName || mode}</b>
          </label>
        ) : null}

        <label className="control">
          <span>Characters</span>
          <input value={characters} onChange={(event) => setCharacters(event.target.value)} />
        </label>

        {mode !== '3d' ? (
          <>
            <Slider label="Width" value={width} min={32} max={180} step={1} onChange={setWidth} />
            <Slider label="Contrast" value={contrast} min={-160} max={160} step={1} onChange={setContrast} />
          </>
        ) : (
          <>
            <Slider label="Resolution" value={resolution} min={0.12} max={0.48} step={0.01} onChange={setResolution} />
            <Slider label="Scale" value={scale} min={0.35} max={2.4} step={0.01} onChange={setScale} />
            <Slider
              label="Rotate X"
              value={rotation.x}
              min={-Math.PI}
              max={Math.PI}
              step={0.01}
              onChange={(value) => setRotation((current) => ({ ...current, x: value }))}
            />
            <Slider
              label="Rotate Y"
              value={rotation.y}
              min={-Math.PI}
              max={Math.PI}
              step={0.01}
              onChange={(value) => setRotation((current) => ({ ...current, y: value }))}
            />
          </>
        )}

        <label className="toggle">
          <span>Invert</span>
          <input type="checkbox" checked={invert} onChange={(event) => setInvert(event.target.checked)} />
        </label>

        {mode === '3d' ? (
          <label className="toggle">
            <span>Color</span>
            <input type="checkbox" checked={color} onChange={(event) => setColor(event.target.checked)} />
          </label>
        ) : null}

        <div className="action-row">
          <button type="button" onClick={() => void navigator.clipboard.writeText(exportText)} disabled={!exportText}>
            Copy
          </button>
          <button type="button" onClick={downloadAscii} disabled={!exportText}>
            Download
          </button>
        </div>
      </aside>

      <section className="studio-preview">
        {mediaUrl && mode === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img ref={imageRef} src={mediaUrl} alt="" onLoad={renderImage} hidden />
        ) : null}
        {mediaUrl && mode === 'video' ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            muted
            loop
            playsInline
            controls
            onLoadedData={renderVideoFrame}
            onTimeUpdate={renderVideoFrame}
            className="video-sampler"
          />
        ) : null}
        {preview}
      </section>
    </main>
  );
}

export default function Studio() {
  return (
    <Suspense fallback={<main className="studio-shell" />}>
      <StudioContent />
    </Suspense>
  );
}
