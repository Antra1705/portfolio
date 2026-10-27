'use client';

import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ease } from './heroShared';

// A tanzaku: a small paper wish strip tied by a thread to a twig of the hero
// branch (BlossomBranch places it). It hangs tiny and swings a little; hover,
// focus or tap and it unfolds to full size so the number can be read.

const PAPERS = [
    { paper: '#FBDCE5', ink: '#B8365E' },
    { paper: '#FFF6E5', ink: '#8A5A1E' },
    { paper: '#D6EAF6', ink: '#2F6FA8' },
    { paper: '#E9E4F7', ink: '#4B3F8F' },
];

const W = 64; // full-size strip, px
const H = 184;
const SMALL = 0.3; // hanging size, as a fraction of full size

type Stat = { value: number; decimals?: number; label: string };

const HangingTag = ({ stat, index, thread }: { stat: Stat; index: number; thread: number }) => {
    const reduceMotion = useReducedMotion();
    const [open, setOpen] = useState(false);
    const pointerType = useRef('');
    const { paper, ink } = PAPERS[index % PAPERS.length];
    const text = `${stat.value.toFixed(stat.decimals ?? 0)} ${stat.label}`;

    return (
        // centred under the point it hangs from
        <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 + index * 0.15, duration: 0.9, ease }}
            className="relative -translate-x-1/2"
            style={{ zIndex: open ? 2 : 1 }}
        >
            {/* swings from the knot on the twig */}
            <motion.div
                animate={reduceMotion || open ? { rotate: 0 } : { rotate: [-4, 4, -4] }}
                transition={open ? { duration: 0.4 } : { duration: 3.6 + index * 0.6, repeat: Infinity, ease: 'easeInOut', delay: index * 0.35 }}
                style={{ originY: 0, width: W * SMALL }}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
                onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
            >
                <span aria-hidden className="mx-auto block w-px bg-fg/45" style={{ height: thread }} />
                <div className="relative mx-auto" style={{ width: W * SMALL, height: H * SMALL }}>
                    <motion.div
                        aria-hidden
                        initial={false}
                        animate={{ scale: open ? 1 : SMALL }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        className="absolute top-0 flex flex-col items-center gap-3 rounded-[2px] px-1 pb-3 pt-5 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.55)]"
                        style={{ width: W, height: H, left: -(W - W * SMALL) / 2, originY: 0, background: paper, color: ink, pointerEvents: open ? 'auto' : 'none' }}
                    >
                        <span className="absolute top-1.5 h-1.5 w-1.5 rounded-full bg-black/25" />
                        <span className="font-display text-3xl leading-none tabular-nums">{stat.value.toFixed(stat.decimals ?? 0)}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] [writing-mode:vertical-rl]">{stat.label}</span>
                    </motion.div>
                    {/* the hit area: the small strip plus a margin, so it is easy to tap */}
                    <button
                        type="button"
                        aria-label={text}
                        aria-expanded={open}
                        onPointerDown={(e) => { pointerType.current = e.pointerType; }}
                        onClick={() => pointerType.current !== 'mouse' && setOpen((o) => !o)}
                        // keyboard focus only; a tap also focuses, and the click handles that
                        onFocus={(e) => e.currentTarget.matches(':focus-visible') && setOpen(true)}
                        onBlur={() => setOpen(false)}
                        className="pointer-events-auto absolute -inset-3 cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default HangingTag;
