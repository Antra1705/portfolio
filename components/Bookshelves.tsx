'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sakura from './Sakura';
import { groups, type Skill } from './skillsData';

// The toolkit as books on floating wall shelves: one shelf per category, one
// book per tool, each row held up by a blossom bookend. A spare shelf at the
// end holds the things that live on a desk.

const ease = [0.16, 1, 0.3, 1] as const;

// A steady "random" number in [0, 1) for a seed, so every book keeps its
// size and shade from one render to the next
const rand = (seed: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
};
const seedOf = (text: string) => [...text].reduce((n, c) => n * 31 + c.charCodeAt(0), 7) % 100000;

// One soft colour per category, with an ink that reads on it
const TINTS = [
    { paper: '#F2AEBC', ink: '#7A2440' }, // Languages
    { paper: '#BFE0F5', ink: '#1F4E79' }, // Frontend
    { paper: '#BDE7D2', ink: '#1F5C45' }, // Backend
    { paper: '#FBE3A6', ink: '#7A5410' }, // Databases
    { paper: '#DCD3F5', ink: '#4B3F8F' }, // Data & ML
    { paper: '#FBCDB5', ink: '#8A3B1E' }, // AI & LLMs
    { paper: '#F6F0E4', ink: '#021D38' }, // Tools
];
type Tint = (typeof TINTS)[number];

const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 1, ease, delay },
});

// A book standing up, spine out. Slimmer and shorter on phones so a full
// shelf still fits. `lean` tips it against the bookend.
const Book = ({ skill, tint, lean = false }: { skill: Skill; tint: Tint; lean?: boolean }) => {
    const seed = seedOf(skill.name);
    const height = 128 + Math.round(rand(seed) * 44);
    const width = 36 + Math.round(rand(seed + 1) * 12);
    // each book of a set differs a little in shade, like a real shelf
    const shade = `color-mix(in srgb, ${tint.paper} ${100 - Math.round(rand(seed + 3) * 18)}%, ${rand(seed + 2) < 0.5 ? 'white' : 'black'})`;
    return (
        <motion.div
            whileHover={{ y: -14, rotate: lean ? 0 : -2 }}
            transition={{ type: 'spring', stiffness: 380, damping: 20 }}
            className="book relative flex h-[calc(var(--h)*0.8)] w-[calc(var(--w)*0.7)] shrink-0 cursor-default flex-col items-center justify-between rounded-[3px] pb-2 pt-2.5 sm:h-(--h) sm:w-(--w) sm:pb-2.5 sm:pt-3"
            style={{
                '--h': `${height}px`,
                '--w': `${width}px`,
                color: tint.ink,
                rotate: lean ? '5deg' : undefined,
                transformOrigin: 'bottom left',
                backgroundColor: shade,
            } as React.CSSProperties}
        >
            <span aria-hidden className="h-[3px] w-[70%] rounded-full bg-current opacity-25" />
            <span className="whitespace-nowrap text-[10px] font-semibold tracking-[0.02em] [writing-mode:vertical-rl] rotate-180 sm:text-[12px]">{skill.name}</span>
            <skill.icon aria-hidden className="text-[13px] opacity-70" />
        </motion.div>
    );
};

const Bookend = () => (
    <div aria-hidden className="ml-1 grid h-16 w-9 shrink-0 place-items-center rounded-t-[14px] bg-[#FFF6E5] text-[#E58FA7] shadow-[2px_2px_6px_rgba(0,0,0,0.35)] sm:h-20 sm:w-11">
        <Sakura className="h-5 w-5" />
    </div>
);

const Blossom = ({ x, y, s }: { x: number; y: number; s: number }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
        {[0, 72, 144, 216, 288].map((r) => (
            <path key={r} d="M0 -1.5 C -3.6 -4 -4 -8.6 -1.4 -10.8 L 0 -9.4 L 1.4 -10.8 C 4 -8.6 3.6 -4 0 -1.5 Z" transform={`rotate(${r})`} fill="#F2AEBC" />
        ))}
    </g>
);

// ---------------------------------------------------------------------------
// The things on the spare shelf. Each reacts a little to the pointer.

// A small framed print of a blossom branch under the moon, leaning on the wall
const FramedPrint = () => (
    <motion.svg
        aria-hidden
        viewBox="0 0 90 118"
        preserveAspectRatio="xMidYMax meet"
        className="h-[105px] w-20 shrink-0 origin-bottom"
        style={{ rotate: -5 }}
        whileHover={{ rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 16 }}
    >
        <rect width="90" height="118" rx="2" fill="#8A6243" />
        <rect x="5" y="5" width="80" height="108" fill="#FFF6E5" />
        <rect x="14" y="14" width="62" height="90" fill="#0C2A4A" />
        <circle cx="58" cy="34" r="10" fill="#FFF6E5" opacity="0.9" />
        <path d="M14 88 C30 80 40 66 52 60 M36 72 C42 78 50 80 60 78" stroke="#6B4A2F" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {[[52, 60], [60, 78], [44, 66], [30, 80], [66, 58]].map(([x, y], i) => <Blossom key={i} x={x} y={y} s={0.55} />)}
    </motion.svg>
);

// A potted sakura that sways when you brush past it
const Plant = () => (
    <motion.svg
        aria-hidden
        viewBox="0 0 120 146"
        preserveAspectRatio="xMidYMax meet"
        className="h-[117px] w-24 shrink-0 origin-bottom xl:h-[136px] xl:w-28"
        whileHover={{ rotate: [0, -4, 3, -2, 0] }}
        transition={{ duration: 0.9 }}
    >
        <path d="M60 110 C58 80 50 62 34 48 M60 96 C64 72 76 58 92 50 M60 104 C60 82 62 60 60 36" stroke="#6B4A2F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {[[34, 46], [92, 48], [60, 32], [44, 62], [80, 64], [72, 40], [48, 36]].map(([x, y], i) => (
            <Blossom key={i} x={x} y={y} s={0.62 + (i % 3) * 0.12} />
        ))}
        <path d="M36 110 h48 l-6 36 h-36 z" fill="#E9DFCC" />
        <path d="M33 106 h54 v8 h-54 z" fill="#D8CAB0" />
    </motion.svg>
);

// A glass jar of fallen petals
const PetalJar = () => (
    <motion.svg aria-hidden viewBox="0 0 50 71" preserveAspectRatio="xMidYMax meet" className="h-[71px] w-[50px] shrink-0" whileHover={{ y: -4 }}>
        <rect x="12" y="2" width="26" height="9" rx="2" fill="#C9A27A" />
        <rect x="10" y="10" width="30" height="4" rx="1" fill="#B38A62" />
        <path d="M8 16 h34 a4 4 0 0 1 4 4 v44 a6 6 0 0 1 -6 6 h-30 a6 6 0 0 1 -6 -6 v-44 a4 4 0 0 1 4 -4 z" className="fill-fg/[0.08] stroke-fg/45" strokeWidth="1.2" />
        {[[16, 62, 20], [25, 64, -30], [34, 61, 60], [20, 55, -60], [30, 56, 15], [24, 48, 80], [35, 50, -20], [15, 46, 40]].map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y} rx="4" ry="2.4" transform={`rotate(${r} ${x} ${y})`} fill={i % 2 ? '#F2AEBC' : '#F7C9D4'} />
        ))}
        <rect x="14" y="28" width="22" height="10" rx="1.5" fill="#FFF6E5" />
        <path d="M18 33 h14" stroke="#C67A8E" strokeWidth="1" />
        <path d="M11 20 v40" className="stroke-fg/30" strokeWidth="2" strokeLinecap="round" />
    </motion.svg>
);

// Two notebooks lying flat, with the debugging duck sitting on top
const DuckOnBooks = () => (
    <div aria-hidden className="flex shrink-0 flex-col items-center">
        <motion.svg
            viewBox="0 0 44 38"
            className="relative z-10 -mb-0.5 h-[38px] w-11 origin-bottom"
            whileHover={{ rotate: [0, -12, 10, -6, 0] }}
            transition={{ duration: 0.7 }}
        >
            <path d="M6 24 C6 16 14 14 22 18 C26 10 36 10 37 18 C38 24 34 26 32 26 C36 30 32 36 22 36 C10 36 6 30 6 24 Z" fill="#FFD66B" />
            <path d="M37 17 l6 2 -6 2 z" fill="#F29A4A" />
            <circle cx="32" cy="15.5" r="1.6" fill="#021D38" />
            <path d="M12 26 C16 30 22 30 26 26" stroke="#E8B84A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </motion.svg>
        <span className="flat-book block h-4 w-[92px] rounded-[2px] bg-[#BFE0F5]" />
        <span className="flat-book block h-5 w-[108px] rounded-[2px] bg-[#F2AEBC]" />
    </div>
);

// A desk lamp in blush pink; it glows brighter when you hover it
const Lamp = () => (
    <motion.svg aria-hidden viewBox="0 0 80 123" preserveAspectRatio="xMidYMax meet" className="h-[123px] w-20 shrink-0" initial="rest" whileHover="on">
        <defs>
            <radialGradient id="lamp-glow">
                <stop offset="0%" stopColor="#FFE9B0" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FFE9B0" stopOpacity="0" />
            </radialGradient>
        </defs>
        <motion.ellipse cx="56" cy="78" rx="26" ry="40" fill="url(#lamp-glow)" variants={{ rest: { opacity: 0.45 }, on: { opacity: 1 } }} />
        <rect x="6" y="114" width="36" height="9" rx="4" fill="#F6E7CF" />
        <path d="M24 114 L16 66 L50 34" stroke="#E8D3B3" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="66" r="3.5" fill="#D9BE95" />
        <circle cx="50" cy="34" r="3.5" fill="#D9BE95" />
        <g transform="rotate(38 56 40)">
            <path d="M44 30 h22 l10 22 h-42 z" fill="#F2AEBC" />
            <path d="M44 30 h22 l2 4 h-26 z" fill="#E58FA7" />
        </g>
        <motion.circle cx="55" cy="56" r="4.5" fill="#FFF3C4" variants={{ rest: { opacity: 0.8 }, on: { opacity: 1 } }} />
    </motion.svg>
);

// A few novels, no titles: the reading that isn't work
const NOVELS = [
    { h: 104, w: 24, c: '#E9B6C4' },
    { h: 94, w: 20, c: '#CFC4EE' },
    { h: 110, w: 26, c: '#F4E2BE' },
    { h: 98, w: 22, c: '#BFD9EE', lean: true },
];

const Novels = () => (
    <div aria-hidden className="flex shrink-0 items-end gap-[2px]">
        {NOVELS.map((n, i) => (
            <motion.span
                key={i}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                className="book flex flex-col items-center justify-between rounded-[2px] py-2"
                style={{ height: n.h, width: n.w, backgroundColor: n.c, rotate: n.lean ? '7deg' : undefined, transformOrigin: 'bottom left' }}
            >
                <span className="h-[2px] w-[65%] bg-black/15" />
                <span className="h-[2px] w-[65%] bg-black/15" />
            </motion.span>
        ))}
    </div>
);

// A lucky cat that waves when you say hello
const LuckyCat = () => (
    <motion.svg aria-hidden viewBox="0 0 60 80" preserveAspectRatio="xMidYMax meet" className="h-20 w-[60px] shrink-0" initial="rest" whileHover="wave">
        <rect x="10" y="40" width="40" height="40" rx="14" fill="#FFF6E5" />
        <circle cx="30" cy="30" r="19" fill="#FFF6E5" />
        <path d="M13 20 L16 4 L26 14 Z M47 20 L44 4 L34 14 Z" fill="#FFF6E5" />
        <path d="M16 15 L17 8 L22 13 Z M44 15 L43 8 L38 13 Z" fill="#F2AEBC" />
        <path d="M21 30 q3 3 6 0 M33 30 q3 3 6 0" stroke="#021D38" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="22" cy="36" r="2.4" fill="#F7C9D4" />
        <circle cx="38" cy="36" r="2.4" fill="#F7C9D4" />
        <path d="M28 37 q2 2 4 0" stroke="#021D38" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M14 48 h32" stroke="#E0566F" strokeWidth="4" strokeLinecap="round" />
        <circle cx="30" cy="52" r="3.4" fill="#F2C94C" />
        <circle cx="30" cy="68" r="7" fill="#F2C94C" opacity="0.9" />
        {/* the raised paw */}
        <motion.g style={{ originX: '48px', originY: '50px' }} variants={{ rest: { rotate: 0 }, wave: { rotate: [0, -24, 0, -24, 0], transition: { duration: 0.9 } } }}>
            <rect x="44" y="26" width="11" height="24" rx="5.5" fill="#FFF6E5" />
            <path d="M46 29 h7" stroke="#F2AEBC" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>
    </motion.svg>
);

// A folded paper crane
const Crane = () => (
    <motion.svg
        aria-hidden
        viewBox="0 0 74 49"
        preserveAspectRatio="xMidYMax meet"
        className="h-[49px] w-[74px] shrink-0"
        whileHover={{ y: -6, rotate: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 14 }}
    >
        <path d="M6 48 L30 30 L44 48 Z" fill="#E58FA7" />
        <path d="M30 30 L44 48 L58 30 Z" fill="#F2AEBC" />
        <path d="M30 30 L44 2 L46 34 Z" fill="#F7C9D4" />
        <path d="M46 34 L58 30 L44 2 Z" fill="#EBA3B7" />
        <path d="M58 30 L70 10 L66 12 L56 36 Z" fill="#E58FA7" />
        <path d="M70 10 L74 14 L68 13 Z" fill="#C67A8E" />
        <path d="M6 48 L2 30 L14 42 Z" fill="#EBA3B7" />
    </motion.svg>
);

// A little succulent in a pink pot
const Succulent = () => (
    <motion.svg aria-hidden viewBox="0 0 54 62" preserveAspectRatio="xMidYMax meet" className="h-[62px] w-[54px] shrink-0" whileHover={{ rotate: [0, -5, 4, 0] }} transition={{ duration: 0.6 }}>
        {[[-50, 14], [50, 14], [-25, 18], [25, 18], [0, 20]].map(([r, h], i) => (
            <ellipse key={i} cx="27" cy={36 - h / 2} rx="6" ry={h / 2} transform={`rotate(${r} 27 36)`} fill={i % 2 ? '#8FC6A4' : '#A9D8BB'} />
        ))}
        <path d="M12 38 h30 l-4 24 h-22 z" fill="#F2AEBC" />
        <path d="M10 35 h34 v5 h-34 z" fill="#E58FA7" />
    </motion.svg>
);

// A mug of tea, still steaming
const Mug = () => (
    <svg aria-hidden viewBox="0 0 32 28.5" preserveAspectRatio="xMidYMax meet" className="h-[50px] w-14 shrink-0">
        <motion.g animate={{ y: [0, -2, 0], opacity: [0.9, 0.4, 0.9] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
            <path d="M11 9c-1.5 -2 1.5 -3 0 -5M16 8c-1.5 -2 1.5 -3 0 -5" stroke="#C9B8A6" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </motion.g>
        <path d="M23 14h2.5a3.5 3.5 0 010 7H22" stroke="#C67A8E" strokeWidth="2.2" fill="none" />
        <path d="M6 11h18v9a8 8 0 01-8 8h-2a8 8 0 01-8-8z" fill="#FFF6E5" className="stroke-fg/20" strokeWidth="0.6" />
        <circle cx="15" cy="20" r="2.6" fill="#F2AEBC" />
    </svg>
);

// The alarm clock keeps the visitor's real time, ticking each second. It
// rings when you hover it.
const AlarmClock = () => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const h = now.getHours();
    const m = now.getMinutes();
    const sec = now.getSeconds();
    const hand = (deg: number) => `rotate(${deg} 25 32)`;
    return (
        <motion.svg
            role="img"
            aria-label={`Alarm clock showing ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
            viewBox="0 0 50 58"
            preserveAspectRatio="xMidYMax meet"
            className="h-[58px] w-[50px] shrink-0"
            whileHover={{ rotate: [0, -8, 8, -8, 8, -4, 0] }}
            transition={{ duration: 0.6 }}
        >
            <circle cx="11" cy="12" r="8" fill="#F2AEBC" />
            <circle cx="39" cy="12" r="8" fill="#F2AEBC" />
            <path d="M25 4 v6" stroke="#E58FA7" strokeWidth="3" strokeLinecap="round" />
            <path d="M12 52 l-4 4.5 M38 52 l4 4.5" stroke="#E58FA7" strokeWidth="3" strokeLinecap="round" />
            <circle cx="25" cy="32" r="21" fill="#E58FA7" />
            <circle cx="25" cy="32" r="17" fill="#FFF6E5" />
            {Array.from({ length: 12 }, (_, i) => (
                <path key={i} d={i % 3 ? 'M25 16.5 v1.6' : 'M25 16.5 v3'} stroke="#C67A8E" strokeWidth={i % 3 ? 1 : 1.6} transform={hand(i * 30)} />
            ))}
            <path d="M25 32 V23.5" stroke="#021D38" strokeWidth="2.2" strokeLinecap="round" transform={hand((h % 12) * 30 + m * 0.5)} />
            <path d="M25 32 V19" stroke="#021D38" strokeWidth="1.5" strokeLinecap="round" transform={hand(m * 6 + sec * 0.1)} />
            <path d="M25 35 V18" stroke="#E0566F" strokeWidth="0.8" strokeLinecap="round" transform={hand(sec * 6)} />
            <circle cx="25" cy="32" r="1.8" fill="#021D38" />
        </motion.svg>
    );
};

// Fairy lights strung along the wall above the shelf, with three tiny
// polaroids pegged to them. The wire sags in a gentle curve.
const SAG = 34; // how far the middle of the string drops, px
const sagAt = (f: number) => 4 + 4 * SAG * f * (1 - f);
const BULBS = Array.from({ length: 19 }, (_, i) => 0.03 + i * (0.94 / 18));
const SNAPS = [
    { f: 0.2, tilt: -7, art: 'moon' },
    { f: 0.5, tilt: 4, art: 'sakura' },
    { f: 0.8, tilt: -3, art: 'code' },
] as const;

const Snap = ({ art }: { art: (typeof SNAPS)[number]['art'] }) => (
    <span className="block bg-[#FFFDF6] p-1 pb-3 shadow-[0_3px_6px_rgba(0,0,0,0.35)]">
        <span className="grid h-8 w-9 place-items-center bg-[#0C2A4A]">
            {art === 'moon' && <span className="h-4 w-4 rounded-full bg-[#FFF6E5] shadow-[0_0_8px_#FFF6E5]" />}
            {art === 'sakura' && <Sakura className="h-5 w-5 text-pink" />}
            {art === 'code' && <span className="font-mono text-[10px] font-bold text-pink">&lt;/&gt;</span>}
        </span>
    </span>
);

const FairyLights = () => (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-11">
        <svg viewBox="0 0 100 44" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <path d={`M0 4 Q50 ${4 + 2 * SAG} 100 4`} className="stroke-fg/35" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="absolute -left-1 top-0.5 h-2.5 w-2.5 rounded-full bg-[#D9BE95]" />
        <span className="absolute -right-1 top-0.5 h-2.5 w-2.5 rounded-full bg-[#D9BE95]" />
        {BULBS.map((f, i) => (
            <span
                key={i}
                className="fairy-bulb absolute h-2.5 w-[7px] -translate-x-1/2 rounded-full"
                style={{
                    left: `${f * 100}%`,
                    top: sagAt(f),
                    backgroundColor: i % 3 === 1 ? '#F7B8CA' : '#FFE9B0',
                    color: i % 3 === 1 ? '#F7B8CA' : '#FFE9B0',
                    animationDelay: `${(i * 0.37) % 2.4}s`,
                }}
            />
        ))}
        {SNAPS.map((s) => (
            <motion.span
                key={s.art}
                className="pointer-events-auto absolute flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${s.f * 100}%`, top: sagAt(s.f) - 3, rotate: s.tilt, originY: 0 }}
                whileHover={{ rotate: [s.tilt, s.tilt + 10, s.tilt - 6, s.tilt] }}
                transition={{ duration: 0.8 }}
            >
                <span className="relative z-10 h-2.5 w-1.5 rounded-[1px] bg-[#C9A27A]" />
                <span className="-mt-1"><Snap art={s.art} /></span>
            </motion.span>
        ))}
    </div>
);

// ---------------------------------------------------------------------------

export const Wall = () => (
    <div className="grid gap-x-12 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((g, gi) => (
            <motion.div key={g.name} {...reveal(gi * 0.05)} className="flex flex-col justify-end">
                <div className="flex min-h-[148px] items-end px-3 sm:min-h-[184px]">
                    <ul aria-label={g.name} className="flex items-end gap-[2px] sm:gap-[3px]">
                        {g.items.map((s, i) => (
                            <li key={s.name}>
                                <Book skill={s} tint={TINTS[gi]} lean={i === g.items.length - 1 && g.items.length > 2} />
                            </li>
                        ))}
                    </ul>
                    <Bookend />
                </div>
                <div className="float-plank h-3 rounded-[2px]" />
                <p className="mt-4 flex items-baseline gap-3 px-1">
                    <span className="font-display text-2xl italic leading-none text-fg">{g.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{g.items.length} books</span>
                </p>
            </motion.div>
        ))}
        {/* the spare shelf: the things that live on a desk */}
        <motion.div {...reveal(0.4)} className="relative flex flex-col justify-end pt-[88px] xl:col-span-2">
            <FairyLights />
            {/* packed end to end; narrower screens keep the ones that fit */}
            <div className="flex min-h-[184px] items-end justify-between gap-1 px-1 sm:px-3">
                <span className="hidden shrink-0 xl:block"><Lamp /></span>
                <span className="hidden shrink-0 xl:block"><FramedPrint /></span>
                <Plant />
                <span className="hidden shrink-0 lg:block"><PetalJar /></span>
                <span className="hidden shrink-0 xl:block"><Novels /></span>
                <DuckOnBooks />
                <span className="hidden shrink-0 lg:block"><LuckyCat /></span>
                <AlarmClock />
                <span className="hidden shrink-0 min-[1400px]:block"><Crane /></span>
                <span className="hidden shrink-0 min-[1400px]:block"><Succulent /></span>
                <Mug />
            </div>
            <div className="float-plank h-3 rounded-[2px]" />
            <p className="mt-4 flex items-baseline gap-3 px-1">
                <span className="font-display text-2xl italic leading-none text-fg">Off the clock</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">debugging duck included</span>
            </p>
        </motion.div>
    </div>
);
