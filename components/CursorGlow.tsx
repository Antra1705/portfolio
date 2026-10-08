'use client';

import React, { useEffect, useRef } from 'react';

// A ring that eases after the pointer and swells over anything clickable.
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

        const step = () => {
            rx += (x - rx) * 0.2;
            ry += (y - ry) * 0.2;
            ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
            // Keep animating only until the ring catches up
            frame = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(step) : 0;
        };

        const onMove = (e: PointerEvent) => {
            x = e.clientX;
            y = e.clientY;
            if (!started) {
                rx = x;
                ry = y;
                started = true;
            }
            ring.style.opacity = '1';
            const target = e.target as Element | null;
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
            <span />
        </div>
    );
};

export default CursorGlow;
