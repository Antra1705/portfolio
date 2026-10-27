'use client';

import React, { useId, useState } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { ease } from './heroShared';

// A paper lantern (chōchin) hung by a cord from a branch: lit and glowing powder
// blue at night (dark mode), unlit pink paper by day (light mode). Clicking it
// swings it and does its job. The hero's is the page's light switch (the new
// theme spreads out from the lantern; BlossomBranch places it); the contact
// tree's takes you back to the top.

type Theme = 'light' | 'dark';

type Props = {
    lit: boolean;
    onPress: (origin: { x: number; y: number }) => void;
    label: string; // what pressing it does
    hint: string; // the note beside it while pointed at
    track: string; // its analytics name
    cord: number; // how far it hangs below the bough, px
    delay?: number; // when it fades in, s
};

const Rib = ({ y, rx }: { y: number; rx: number }) => (
    <path d={`M${32 - rx} ${y} Q32 ${y + 3.2} ${32 + rx} ${y}`} stroke="currentColor" strokeWidth="0.9" fill="none" opacity="0.35" />
);

const PaperLantern = ({ lit, onPress, label, hint, track, cord, delay = 2.2 }: Props) => {
    const reduceMotion = useReducedMotion();
    const swing = useAnimationControls();
    const [hover, setHover] = useState(false);
    // its own gradient ids, as two lanterns can be on the page at once (letters only: they go inside url(#…))
    const paper = `lantern${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

    const click = (e: React.MouseEvent<HTMLButtonElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        onPress({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
        if (!reduceMotion) swing.start({ rotate: [0, 14, -10, 6, -3, 0], transition: { duration: 1.4, ease: 'easeOut' } });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 1, ease }}
            className="relative -translate-x-1/2"
        >
            {/* idle sway from the knot on the bough */}
            <motion.div
                animate={reduceMotion ? undefined : { rotate: [-2.5, 2.5, -2.5] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ originY: 0 }}
                className="flex flex-col items-center"
            >
                <motion.div animate={swing} style={{ originY: 0 }} className="flex flex-col items-center">
                    <span aria-hidden className="block w-px bg-fg/45" style={{ height: cord }} />
                    <button
                        type="button"
                        data-track={track}
                        onClick={click}
                        onPointerEnter={() => setHover(true)}
                        onPointerLeave={() => setHover(false)}
                        onFocus={() => setHover(true)}
                        onBlur={() => setHover(false)}
                        aria-label={label}
                        title={hint}
                        className="group pointer-events-auto relative -mt-px block cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
                    >
                        {/* the glow it throws when lit */}
                        <motion.span
                            aria-hidden
                            initial={false}
                            animate={{ opacity: lit ? 1 : 0, scale: lit ? 1 : 0.6 }}
                            transition={{ duration: 0.6 }}
                            className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(190,230,240,0.55),rgba(155,208,237,0.2)_45%,transparent_70%)]"
                        />
                        <svg viewBox="0 0 64 104" className="relative h-[112px] w-[69px] transition-transform duration-300 group-hover:scale-105 group-active:scale-95 sm:h-[128px] sm:w-[79px]">
                            <defs>
                                <radialGradient id={`${paper}-lit`} cx="50%" cy="48%" r="60%">
                                    <stop offset="0%" stopColor="#F4FCFF" />
                                    <stop offset="45%" stopColor="#BFE3EC" />
                                    <stop offset="100%" stopColor="#86BDD3" />
                                </radialGradient>
                                <linearGradient id={`${paper}-unlit`} x1="0" x2="1">
                                    <stop offset="0%" stopColor="#E9919F" />
                                    <stop offset="50%" stopColor="#F6BCC6" />
                                    <stop offset="100%" stopColor="#E28D9C" />
                                </linearGradient>
                            </defs>
                            {/* hanger and top cap */}
                            <path d="M32 0 v6" stroke="#3A281B" strokeWidth="1.5" />
                            <rect x="21" y="6" width="22" height="7" rx="2" fill="#2B1D14" />
                            {/* the paper body */}
                            <ellipse cx="32" cy="48" rx="27" ry="36" fill={`url(#${paper}-${lit ? 'lit' : 'unlit'})`} className="transition-[fill] duration-500" />
                            <g className={lit ? 'text-[#3E7E99]' : 'text-[#9E4A60]'}>
                                {[[20, 18], [27, 24], [34, 26.5], [41, 26.5], [48, 26.5], [55, 26.5], [62, 26.5], [69, 24], [76, 18]].map(([y, rx]) => <Rib key={y} y={y} rx={rx} />)}
                            </g>
                            {/* a blossom painted on the paper */}
                            <g transform="translate(32 48) scale(1.25)" fill={lit ? '#E58FA7' : '#A4405C'} opacity={lit ? 0.9 : 0.75}>
                                {[0, 72, 144, 216, 288].map((r) => (
                                    <path key={r} d="M0 -1.5 C -3.6 -4 -4 -8.6 -1.4 -10.8 L 0 -9.4 L 1.4 -10.8 C 4 -8.6 3.6 -4 0 -1.5 Z" transform={`rotate(${r})`} />
                                ))}
                            </g>
                            {/* bottom cap and tassel */}
                            <rect x="21" y="83" width="22" height="7" rx="2" fill="#2B1D14" />
                            <path d="M32 90 v5" stroke={lit ? '#6FA9C2' : '#C67A8E'} strokeWidth="1.6" />
                            <path d="M28.5 95 h7 l-1 9 h-5 z" fill={lit ? '#6FA9C2' : '#E0566F'} className="transition-[fill] duration-500" />
                        </svg>
                    </button>
                </motion.div>
            </motion.div>

            {/* a quiet hint while pointed at */}
            <motion.span
                aria-hidden
                initial={false}
                animate={{ opacity: hover ? 1 : 0, x: hover ? 0 : -6 }}
                transition={{ duration: 0.25 }}
                className="pointer-events-none absolute left-full top-[calc(var(--cord)+50px)] ml-1 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-fg/70"
                style={{ '--cord': `${cord}px` } as React.CSSProperties}
            >
                {hint}
            </motion.span>
        </motion.div>
    );
};

// The hero's lantern: the page's light switch
export const ThemeLantern = ({ theme, onToggle, cord }: { theme: Theme; onToggle: Props['onPress']; cord: number }) => {
    const lit = theme === 'dark';
    return (
        <PaperLantern
            lit={lit}
            onPress={onToggle}
            label={lit ? 'Switch to light mode' : 'Switch to dark mode'}
            hint={lit ? 'Click for day' : 'Click for night'}
            track="theme-lantern"
            cord={cord}
        />
    );
};

export default PaperLantern;
