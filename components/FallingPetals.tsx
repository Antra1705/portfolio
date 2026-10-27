'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// The 3D petals need three.js (~600 KB), so they load after the page is idle;
// until then (and without WebGL) the lightweight CSS petals below are shown
const Petals3D = dynamic(() => import('./Petals3D'), { ssr: false });

const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

interface Petal {
  id: number;
  x: number;
  size: number;
  fall: number;
  fallDelay: number;
  drift: number;
  sway: number;
  swayDuration: number;
  swayDelay: number;
  spin: number;
  spinDirection: 'normal' | 'reverse';
  spinDelay: number;
  opacity: number;
}

interface FallingPetalsProps {
  // 'fixed' covers the viewport; 'contained' fills the nearest positioned parent
  variant?: 'fixed' | 'contained';
  count?: number;
  mobileCount?: number;
  minSize?: number;
  maxSize?: number;
  maxOpacity?: number;
  className?: string;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const createPetals = (count: number, minSize: number, maxSize: number, maxOpacity: number): Petal[] =>
  Array.from({ length: count }).map((_, i): Petal => {
    const fall = rand(14, 24);
    const swayDuration = rand(3, 6);
    const spin = rand(6, 12);
    return {
      id: i,
      // One column per petal with jitter, so petals never stack on the same x
      x: ((i + rand(0.15, 0.85)) / count) * 100,
      size: rand(minSize, maxSize),
      fall,
      // Negative delay starts each petal part-way through its fall, so they are
      // spread over the screen on load instead of all dropping from the top together
      fallDelay: -rand(0, fall),
      drift: rand(-40, 40),
      sway: rand(15, 35),
      swayDuration,
      swayDelay: -rand(0, swayDuration),
      spin,
      spinDelay: -rand(0, spin),
      spinDirection: Math.random() > 0.5 ? 'normal' : 'reverse',
      opacity: rand(maxOpacity * 0.6, maxOpacity),
    };
  }).sort(() => Math.random() - 0.5);

const FallingPetals = ({
  variant = 'fixed',
  count = 26,
  mobileCount = 12,
  minSize = 8,
  maxSize = 18,
  maxOpacity = 0.9,
  className = '',
}: FallingPetalsProps) => {
  // Generated once on the client (the page only renders after mount), so the
  // random layout is stable across re-renders such as a theme toggle
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches);
  const [petals] = useState<Petal[]>(() => {
    if (typeof window === 'undefined') return [];
    return createPetals(isMobile ? mobileCount : count, minSize, maxSize, maxOpacity);
  });
  const [load3d, setLoad3d] = useState(false); // start fetching the 3D layer
  const [ready3d, setReady3d] = useState(false); // 3D petals are drawing
  // With WebGL the petals come from the hero branch, so the CSS fallback (which
  // falls from the top of the screen) is only for browsers without it
  const [cssFallback] = useState(() => typeof window !== 'undefined' && !hasWebGL());

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !hasWebGL()) return;
    const start = () => setLoad3d(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 1500);
    return () => clearTimeout(id);
  }, []);

  if (!petals.length) return null;

  return (
    <div
      aria-hidden
      className={`petals ${variant === 'fixed' ? 'fixed' : 'absolute'} inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
    >
      {load3d && (
        <Petals3D
          perScreen={isMobile ? 9 : 16}
          minSize={minSize * 1.6}
          maxSize={maxSize * 1.6}
          opacity={maxOpacity}
          onReady={() => setReady3d(true)}
        />
      )}
      {cssFallback && !ready3d && petals.map((petal) => (
        <div
          key={petal.id}
          className="petal-fall"
          style={{
            left: `${petal.x}%`,
            animationDuration: `${petal.fall}s`,
            animationDelay: `${petal.fallDelay}s`,
            '--drift': `${petal.drift}px`,
            '--petal-opacity': petal.opacity,
          } as React.CSSProperties}
        >
          <div
            className="petal-sway"
            style={{
              animationDuration: `${petal.swayDuration}s`,
              animationDelay: `${petal.swayDelay}s`,
              '--sway': `${petal.sway}px`,
            } as React.CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static export with images.unoptimized: next/image would add nothing here */}
            <img
              src="/portfolio/petal.png"
              alt=""
              className="petal-spin"
              style={{
                width: petal.size,
                animationDuration: `${petal.spin}s`,
                animationDirection: petal.spinDirection,
                animationDelay: `${petal.spinDelay}s`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FallingPetals;
