'use client';

import React, { useState } from 'react';

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
  const [petals] = useState<Petal[]>(() => {
    if (typeof window === 'undefined') return [];
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    return createPetals(isMobile ? mobileCount : count, minSize, maxSize, maxOpacity);
  });

  if (!petals.length) return null;

  return (
    <div
      aria-hidden
      className={`petals ${variant === 'fixed' ? 'fixed' : 'absolute'} inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
    >
      {petals.map((petal) => (
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
