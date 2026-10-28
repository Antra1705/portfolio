'use client';

import React, { useEffect, useRef } from 'react';
import Sakura from './Sakura';

// A little sakura blossom that drifts after the pointer, turning slowly,
// and blooms larger over anything clickable.
// The native cursor stays visible. Mouse/trackpad only; skipped on touch
// screens and for reduced motion.
const CursorGlow = () => {
    const ringRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const finePointer = window.matchMedia('(pointer: fine)').matches;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const ring = ringRef.current;
        if (!finePointer || reducedMotion || !ring) return;

        let frame = 0;
        let x = 0;
        let y = 0;
        let rx = 0;
        let ry = 0;
        let started = false;

        let then = 0;
        const step = (now: number) => {
            // eased toward the pointer by elapsed time, so it feels the same at 60Hz or 120Hz
            const k = then ? 1 - Math.exp(-Math.min(now - then, 50) / 70) : 0.2;
            then = now;
            rx += (x - rx) * k;
            ry += (y - ry) * k;
            ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
            // Keep animating only until the ring catches up
            frame = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(step) : 0;
            if (!frame) then = 0;
        };

        const onMove = (e: PointerEvent) => {
            x = e.clientX;
            y = e.clientY;
            if (!started) {
                rx = x;
                ry = y;
                started = true;
            }
            const target = e.target as Element | null;
            // Areas with their own cursor (the garden's birds) hide the ring
            ring.style.opacity = target?.closest('[data-cursor="none"]') ? '0' : '1';
            ring.classList.toggle('is-hover', !!target?.closest('a, button, input, [role="button"]'));
            if (!frame) frame = requestAnimationFrame(step);
        };

        const onLeave = () => { ring.style.opacity = '0'; };

        window.addEventListener('pointermove', onMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onLeave);
        return () => {
            window.removeEventListener('pointermove', onMove);
            document.documentElement.removeEventListener('pointerleave', onLeave);
            cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <div ref={ringRef} aria-hidden className="cursor-ring">
            <span>
                <Sakura className="cursor-sakura h-full w-full" />
            </span>
        </div>
    );
};

export default CursorGlow;
