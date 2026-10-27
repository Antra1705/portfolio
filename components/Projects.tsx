'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IoArrowForward, IoClose, IoExpandOutline, IoLogoGithub } from 'react-icons/io5';
import SectionHeading from './SectionHeading';
import Sakura from './Sakura';
import { GROUPS, inGroup, works, type Group, type Work } from './projectsData';

// Things I've built: paper lanterns hanging from an ink sakura branch, like the
// hero's, one per piece of work, in three clusters, each kind with its own
// lantern: round pink ones for the web, tall blue ones for AI & ML, small gold
// globes for design. Light one and a scroll unrolls beneath with the piece.

const ease = [0.16, 1, 0.3, 1] as const;
const two = (n: number) => String(n).padStart(2, '0');
const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
type View = (w: Work, e: React.MouseEvent<HTMLElement>) => void;

// Each kind of work: its lantern's shape, its paper (unlit and lit, light to
// dark), the colour of its ribs and glow, and an ink dark enough to read on washi
type Kind = { slug: string; shape: 'round' | 'tall' | 'globe'; unlit: string[]; lit: string[]; rib: string; glow: string; dot: string; ink: string };
const KIND: Record<Group, Kind> = {
    Web: { slug: 'web', shape: 'round', unlit: ['#EFB0BC', '#D98293'], lit: ['#FFF5F7', '#F7BCC8', '#E3889F'], rib: '#9E4A60', glow: 'rgba(242, 174, 188, 0.55)', dot: '#F2AEBC', ink: '#B8365E' },
    'AI & ML': { slug: 'ai', shape: 'tall', unlit: ['#B3D2DF', '#7FA9BD'], lit: ['#F4FCFF', '#BFE3EC', '#86BDD3'], rib: '#3E7E99', glow: 'rgba(170, 220, 240, 0.55)', dot: '#9BD0ED', ink: '#2F6F8F' },
    Design: { slug: 'design', shape: 'globe', unlit: ['#EBD09A', '#C9A35C'], lit: ['#FFFBEA', '#FFE3A3', '#E8C170'], rib: '#8C6A2A', glow: 'rgba(255, 227, 163, 0.55)', dot: '#FFE3A3', ink: '#8A5D0B' },
};

// ---------------------------------------------------------------------------
// Pictures, buttons and the viewer

// Discord Orchestrator has no site to photograph, so it gets a drawn moderation log
const ModLog = ({ className = '', label }: { className?: string; label: string }) => (
    <span role="img" aria-label={label} className={`flex flex-col justify-center gap-[0.7em] bg-[#2B2D31] px-[8%] font-mono leading-snug text-[#DBDEE1] [container-type:inline-size] ${className}`}>
        <span className="block text-[4.4cqw] text-[#949BA4]"># mod-log</span>
        <span className="block text-[4.4cqw]"><b className="text-[#A5B4FC]">Orchestrator</b> gave <span className="text-[#57F287]">@new-member</span> the Member role</span>
        <span className="block text-[4.4cqw]"><b className="text-[#A5B4FC]">Orchestrator</b> verified 24 users</span>
        <span className="block text-[4.4cqw]"><b className="text-[#A5B4FC]">Orchestrator</b> timed out <span className="text-[#ED4245]">@spam-bot</span> · 10m</span>
    </span>
);

// A piece's picture: a screenshot, the design itself, or the drawn log
const Shot = ({ w, className = '' }: { w: Work; className?: string }) =>
    w.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- a static export, so images are served as they are
        <img src={w.image} alt={w.alt} loading="lazy" className={`${className} ${w.contain ? 'bg-[#1B2334] object-contain p-[8%]' : 'object-cover object-top'}`} />
    ) : (
        <ModLog className={className} label={w.alt} />
    );

// The site's buttons: a pink pill for the live site (or a larger view), an outline for the code
const pill = 'inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[13px] font-bold uppercase tracking-[0.1em] transition-[transform,color,border-color] duration-300';
const Buttons = ({ w, onView }: { w: Work; onView: View }) => (
    <div className="flex flex-wrap gap-3">
        {w.link && (
            <a href={w.link} {...ext} className={`${pill} bg-pink text-ink hover:-translate-y-0.5`}>
                Visit the site <IoArrowForward className="-rotate-45" />
            </a>
        )}
        {w.github && (
            <a href={w.github} {...ext} className={`${pill} border border-[#2A211B]/30 text-[#2A211B] hover:border-[#B8365E] hover:text-[#B8365E]`}>
                <IoLogoGithub /> Code
            </a>
        )}
        {w.full && (
            <button type="button" onClick={(e) => onView(w, e)} className={`${pill} cursor-pointer bg-pink text-ink hover:-translate-y-0.5`}>
                <IoExpandOutline /> View it larger
            </button>
        )}
    </div>
);

// A design piece, viewed larger
const Viewer = ({ w, onClose }: { w: Work; onClose: () => void }) => {
    const closeRef = useRef<HTMLButtonElement>(null);
    // the latest onClose, so the setup below runs once however often the parent renders
    const latestClose = useRef(onClose);
    useEffect(() => {
        latestClose.current = onClose;
    });
    useEffect(() => {
        closeRef.current?.focus();
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && latestClose.current();
        window.addEventListener('keydown', onKey);
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = overflow;
        };
    }, []);

    return createPortal(
        <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={w.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm sm:p-10"
        >
            <motion.figure
                initial={{ y: 24, scale: 0.97 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 12, opacity: 0 }}
                transition={{ duration: 0.35, ease }}
                onClick={(e) => e.stopPropagation()}
                className="relative flex max-h-full w-full max-w-[880px] flex-col rounded-[14px] bg-[#FFFDF7] p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]"
            >
                <div className={`min-h-0 overflow-hidden rounded-[8px] ${w.tall ? 'overflow-y-auto overscroll-contain' : 'flex justify-center'} ${w.contain ? 'bg-[#1B2334] p-8' : 'bg-[#2A2A35]'}`} style={{ maxHeight: 'calc(100svh - 10rem)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- a static export, so images are served as they are */}
                    <img src={w.full ?? w.image} alt={w.alt} className={w.tall ? 'block w-full' : 'block max-h-[calc(100svh-10rem)] w-auto max-w-full'} />
                </div>
                <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1 pt-3 text-[14px] text-[#2A2A35]">
                    <span>
                        <b>{w.title}</b> · {w.kind}
                    </span>
                    {w.tall && <span className="text-[13px] text-[#2A2A35]/60">Scroll to see the whole page</span>}
                </figcaption>
                <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute -right-3 -top-3 grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-[#FFFDF7] text-xl text-[#2A2A35] shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                    <IoClose />
                </button>
            </motion.figure>
        </motion.div>,
        document.body,
    );
};

// ---------------------------------------------------------------------------
// The lanterns

// The paper of every lantern, unlit and lit, for each kind
const LanternPapers = () => (
    <svg aria-hidden className="absolute h-0 w-0">
        <defs>
            {GROUPS.map((g) => {
                const k = KIND[g];
                return (
                    <React.Fragment key={g}>
                        <linearGradient id={`lan-${k.slug}-unlit`} x1="0" x2="1">
                            <stop offset="0%" stopColor={k.unlit[1]} />
                            <stop offset="50%" stopColor={k.unlit[0]} />
                            <stop offset="100%" stopColor={k.unlit[1]} />
                        </linearGradient>
                        <radialGradient id={`lan-${k.slug}-lit`} cx="50%" cy="48%" r="60%">
                            <stop offset="0%" stopColor={k.lit[0]} />
                            <stop offset="45%" stopColor={k.lit[1]} />
                            <stop offset="100%" stopColor={k.lit[2]} />
                        </radialGradient>
                    </React.Fragment>
                );
            })}
        </defs>
    </svg>
);

// Ribs across each shape: [y, half-width]
const RIBS = {
    round: [[20, 18], [27, 24], [34, 26.5], [41, 26.5], [48, 26.5], [55, 26.5], [62, 26.5], [69, 24], [76, 18]],
    tall: [[20, 19], [28, 19], [36, 19], [44, 19], [52, 19], [60, 19], [68, 19], [76, 19]],
    globe: [[31, 17], [38, 23], [45, 25.5], [52, 25.5], [59, 23], [66, 17]],
};

const Lantern = ({ group, lit }: { group: Group; lit: boolean }) => {
    const k = KIND[group];
    const globe = k.shape === 'globe';
    const [top, bottom] = globe ? [18, 76] : [6, 83]; // where the caps sit
    const paper = `url(#lan-${k.slug}-${lit ? 'lit' : 'unlit'})`;
    return (
        <svg aria-hidden viewBox="0 0 64 104" className={`relative transition-[filter] duration-500 ${globe ? 'h-[66px] w-[40px] sm:h-[76px] sm:w-[47px]' : 'h-[74px] w-[46px] sm:h-[88px] sm:w-[54px]'}`}>
            <path d={`M32 0 v${top}`} stroke="#3A281B" strokeWidth="1.5" />
            <rect x={globe ? 24 : 21} y={top} width={globe ? 16 : 22} height="7" rx="2" fill="#2B1D14" />
            {k.shape === 'round' && <ellipse cx="32" cy="48" rx="27" ry="36" fill={paper} />}
            {k.shape === 'tall' && <rect x="12" y="12" width="40" height="72" rx="10" fill={paper} />}
            {globe && <circle cx="32" cy="48.5" r="26" fill={paper} />}
            <g stroke={k.rib} strokeWidth="0.9" fill="none" opacity="0.35">
                {RIBS[k.shape].map(([y, rx]) => (
                    <path key={y} d={`M${32 - rx} ${y} Q32 ${y + (k.shape === 'tall' ? 1.2 : 3.2)} ${32 + rx} ${y}`} />
                ))}
            </g>
            <g transform={`translate(32 48) scale(${globe ? 0.95 : 1.1})`} fill={k.rib} opacity={lit ? 0.7 : 0.55}>
                {[0, 72, 144, 216, 288].map((r) => (
                    <path key={r} d="M0 -1.5 C -3.6 -4 -4 -8.6 -1.4 -10.8 L 0 -9.4 L 1.4 -10.8 C 4 -8.6 3.6 -4 0 -1.5 Z" transform={`rotate(${r})`} />
                ))}
            </g>
            <rect x={globe ? 24 : 21} y={bottom} width={globe ? 16 : 22} height="7" rx="2" fill="#2B1D14" />
            <path d={`M32 ${bottom + 7} v5`} stroke={k.rib} strokeWidth="1.6" />
            <path d={`M28.5 ${bottom + 12} h7 l-1 9 h-5 z`} fill={k.ink} />
        </svg>
    );
};

// The branch arches up a little: at p across it sits 30 - 48p(1 - p) from the top
const branchY = (p: number) => 30 - 48 * p * (1 - p);

// Along the branch: each group's name plaque, then its lanterns
type Slot = { group: Group; w?: Work; cont?: boolean };
const SLOTS: Slot[] = GROUPS.flatMap((group) => [{ group }, ...inGroup(group).map((w) => ({ group, w }))]);
const CORDS = [44, 74, 50, 86, 58, 80];

// When the lanterns no longer fit on one branch, they carry on along another
// below, split evenly so every branch is about as full. A branch that picks up
// partway through a group opens with that group's plaque again, and a plaque is
// never left hanging at the end of a branch.
const rowsOf = (perRow: number): Slot[][] => {
    const count = Math.ceil(SLOTS.length / perRow);
    const size = Math.ceil(SLOTS.length / count);
    const rows: Slot[][] = [[]];
    for (const slot of SLOTS) {
        const row = rows[rows.length - 1];
        if (rows.length < count && (row.length >= size || (!slot.w && row.length >= size - 1))) {
            rows.push(slot.w ? [{ group: slot.group, cont: true }] : []);
        }
        rows[rows.length - 1].push(slot);
    }
    return rows;
};

// How many slots a branch can hold: on wide screens, one per 84px of branch;
// narrower screens scroll the branch sideways, so they keep long branches
const SLOT_WIDTH = 84;
const onResize = (update: () => void) => {
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
};
const slotsPerRow = () => (window.innerWidth >= 1280 ? Math.floor(Math.min(window.innerWidth - 80, 1360) / SLOT_WIDTH) : 14);
const useSlotsPerRow = () => useSyncExternalStore(onResize, slotsPerRow, () => 14);

const Plaque = ({ group, p, cont }: { group: Group; p: number; cont?: boolean }) => (
    <div aria-hidden className="absolute flex -translate-x-1/2 flex-col items-center" style={{ left: `${p * 100}%`, top: branchY(p) }}>
        <span className="flex w-12 justify-between">
            <span className="block h-6 w-px rotate-[14deg] bg-fg/40" />
            <span className="block h-6 w-px -rotate-[14deg] bg-fg/40" />
        </span>
        <span className="-mt-px rounded-[3px] bg-[#EFE2C6] px-3 pb-2 pt-1.5 text-center shadow-[0_8px_14px_-8px_rgba(0,0,0,0.6)]" style={{ borderTop: `3px solid ${KIND[group].dot}` }}>
            <span className="block whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#2A211B]">{group}</span>
            <span className="block font-display text-[15px] italic leading-none text-[#2A211B]/60">{cont ? 'cont.' : inGroup(group).length}</span>
        </span>
    </div>
);

// ---------------------------------------------------------------------------

const Projects = () => {
    const [sel, setSel] = useState(0);
    const [viewing, setViewing] = useState<Work | null>(null);
    const opener = useRef<HTMLElement | null>(null);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const rows = rowsOf(useSlotsPerRow());
    const w = works[sel];
    const k = KIND[w.group];
    const design = w.group === 'Design';

    const view: View = (piece, e) => {
        opener.current = e.currentTarget;
        setViewing(piece);
    };
    const close = () => {
        setViewing(null);
        opener.current?.focus();
    };
    // arrow keys move along the lanterns, as in any set of tabs
    const onKey = (e: React.KeyboardEvent) => {
        const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = (sel + step + works.length) % works.length;
        setSel(next);
        tabs.current[next]?.focus();
    };

    return (
        <section id="projects" className="w-full px-5 pb-28 pt-20 sm:px-10 sm:pb-36 sm:pt-28">
            <div className="mx-auto max-w-[1360px]">
                <SectionHeading title={<>Things I’ve <em>built</em></>} />
                <LanternPapers />

                {/* the branches, each with its name plaques and lanterns */}
                <div role="tablist" aria-label="Projects">
                    {rows.map((row, r) => (
                        <div key={r} className="-mx-5 overflow-x-auto px-5 sm:-mx-10 sm:px-10 xl:mx-0 xl:overflow-visible xl:px-0">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.8, ease }}
                                className="relative h-[250px] sm:h-[280px]"
                                style={{ minWidth: row.length * 68 }}
                            >
                                {/* (every other branch is drawn the other way round) */}
                                <svg aria-hidden viewBox="0 0 1000 60" preserveAspectRatio="none" className={`absolute inset-x-0 top-0 h-[60px] w-full text-fg/55 ${r % 2 ? '-scale-x-100' : ''}`}>
                                    <path d="M-10 32 Q500 -18 1010 32" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                    <path d="M110 24 q30 -18 60 -16 M390 11 q24 -16 52 -12 M640 10 q30 -14 58 -6 M860 20 q24 -14 50 -8" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                </svg>
                                {[0.03, 0.17, 0.3, 0.44, 0.58, 0.72, 0.85, 0.97].map((p) => (
                                    <span key={p} aria-hidden className="absolute -translate-x-1/2 -translate-y-1/2 text-[#F2AEBC]" style={{ left: `${(r % 2 ? 1 - p : p) * 100}%`, top: branchY(p) - 4 }}>
                                        <Sakura className="h-4 w-4" />
                                    </span>
                                ))}

                                {row.map((slot, s) => {
                                    const p = (s + 0.5) / row.length;
                                    if (!slot.w) return <Plaque key={`${slot.group}-${s}`} group={slot.group} p={p} cont={slot.cont} />;
                                    const i = works.indexOf(slot.w);
                                    const lit = i === sel;
                                    const kind = KIND[slot.group];
                                    const cord = CORDS[i % CORDS.length];
                                    return (
                                        <button
                                            key={slot.w.title}
                                            ref={(el) => {
                                                tabs.current[i] = el;
                                            }}
                                            type="button"
                                            role="tab"
                                            aria-selected={lit}
                                            aria-controls="project-scroll"
                                            aria-label={`${slot.w.title}, ${slot.group}`}
                                            tabIndex={lit ? 0 : -1}
                                            onClick={() => setSel(i)}
                                            onKeyDown={onKey}
                                            className="lantern-sway group absolute flex -translate-x-1/2 cursor-pointer flex-col items-center outline-none"
                                            style={{ left: `${p * 100}%`, top: branchY(p), animationDelay: `${-i * 0.7}s` }}
                                        >
                                            <span aria-hidden className="block w-px bg-fg/45" style={{ height: cord }} />
                                            <span className="relative -mt-px transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105">
                                                <motion.span
                                                    aria-hidden
                                                    initial={false}
                                                    animate={{ opacity: lit ? 1 : 0, scale: lit ? 1 : 0.6 }}
                                                    className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
                                                    style={{ background: `radial-gradient(circle, ${kind.glow}, transparent 68%)` }}
                                                />
                                                <Lantern group={slot.group} lit={lit} />
                                            </span>
                                            <span className={`mt-2 max-w-[7.5rem] text-center font-mono text-[10px] uppercase leading-tight tracking-[0.14em] transition-colors group-focus-visible:underline ${lit ? 'text-fg' : 'text-fg/55 group-hover:text-fg'}`}>
                                                {slot.w.title}
                                            </span>
                                        </button>
                                    );
                                })}
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* the key: each kind's colour, and a way straight to it */}
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1">
                    {GROUPS.map((g) => {
                        const here = w.group === g;
                        return (
                            <button
                                key={g}
                                type="button"
                                onClick={() => {
                                    const i = works.indexOf(inGroup(g)[0]);
                                    setSel(i);
                                    // on narrow screens the branch scrolls sideways: bring the group into view
                                    tabs.current[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                                }}
                                className={`flex min-h-11 cursor-pointer items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${here ? 'text-fg' : 'text-fg/55 hover:text-fg'}`}
                            >
                                <span className="h-2.5 w-2.5 rounded-full" style={{ background: KIND[g].dot, boxShadow: here ? `0 0 10px 2px ${KIND[g].glow}` : undefined }} />
                                {g}
                                <span className="text-fg/40">{inGroup(g).length}</span>
                            </button>
                        );
                    })}
                    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:ml-auto">
                        <Sakura className="h-3 w-3 text-accent" /> Light a lantern
                    </p>
                </div>

                {/* the hanging scroll, unrolling for the lit lantern */}
                <div id="project-scroll" role="tabpanel" aria-live="polite" className="relative mt-10">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div key={sel} className="relative px-3 sm:px-4" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                            <span aria-hidden className="scroll-roller absolute bottom-[-8px] left-0 top-[-8px] z-10 w-4 rounded-full sm:w-5" />
                            <motion.span
                                aria-hidden
                                initial={{ left: '0%' }}
                                animate={{ left: 'calc(100% - 20px)' }}
                                transition={{ duration: 0.9, ease }}
                                className="scroll-roller absolute bottom-[-8px] top-[-8px] z-10 w-4 rounded-full sm:w-5"
                            />
                            <motion.div
                                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                                transition={{ duration: 0.9, ease }}
                                className={`scroll-paper grid items-center gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:gap-12 ${design ? 'lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]' : 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]'}`}
                                style={{ borderTop: `4px solid ${k.dot}` }}
                            >
                                {design ? (
                                    <button
                                        type="button"
                                        onClick={(e) => view(w, e)}
                                        aria-label={`View ${w.title} larger`}
                                        className="mx-auto block w-full max-w-[300px] cursor-zoom-in overflow-hidden rounded-[10px] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)] outline-none ring-1 ring-black/10 focus-visible:ring-2 focus-visible:ring-[#B8365E]"
                                    >
                                        <Shot w={w} className="block aspect-[3/4] w-full" />
                                    </button>
                                ) : (
                                    <div className="overflow-hidden rounded-[10px] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)] ring-1 ring-black/10">
                                        <Shot w={w} className="block aspect-[16/10] w-full" />
                                    </div>
                                )}
                                <div className="text-[#2A211B]">
                                    <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: k.ink }}>
                                        <span className="h-2 w-2 rounded-full" style={{ background: k.ink }} />
                                        {w.group} · {two(inGroup(w.group).indexOf(w) + 1)} of {two(inGroup(w.group).length)}
                                    </p>
                                    <h3 className="mt-3 text-[clamp(2.2rem,4vw,3.4rem)] font-black leading-[0.92] tracking-[-0.045em]">{w.title}</h3>
                                    <p className="mt-4 font-display text-[1.35rem] italic leading-snug text-[#2A211B]/80">{w.desc}</p>
                                    <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#2A211B]/60">{w.kind ?? w.tech.join(' · ')}</p>
                                    <div className="mt-6">
                                        <Buttons w={w} onView={view} />
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>{viewing && <Viewer key={viewing.title} w={viewing} onClose={close} />}</AnimatePresence>
        </section>
    );
};

export default Projects;
