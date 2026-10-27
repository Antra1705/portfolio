'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import Sakura from './Sakura';
import { DeskSticker, StickerSheet, STICKERS, type PlacedSticker, type StickerKind } from './Stickers';

// A 720px WebP of the original photo (2.6 MB), so the polaroid loads quickly.
// If it ever fails to load, a monogram is shown in its place.
const PHOTO_SRC: string | null = '/portfolio/antra.webp';

const ease = [0.16, 1, 0.3, 1] as const;

// About: a desk collage on the left (the polaroid, fixed, and the paper things
// that carry the facts: student ID and sticky note) that visitors can
// decorate from a sheet of stickers, and the story on the right, split into its
// two sides.

const sides = [
    {
        title: 'the engineer',
        body: (
            <>
                I’m pursuing Computer Science and Engineering with a specialisation in Data Science at VIT,
                working from React and Next.js interfaces to FastAPI and Node.js backends. I enjoy thinking
                in terms of <span className="text-fg">system design</span>: clean API contracts, role-based
                access control, real-time pipelines over WebSockets, caching, and data models that stay
                maintainable as a product grows.
            </>
        ),
        tools: ['React', 'Next.js', 'FastAPI', 'Node.js', 'WebSockets', 'System design'],
    },
    {
        title: 'the data scientist',
        body: (
            <>
                On the data side, I use Python, Pandas, and Scikit-learn to build and evaluate models, and
                bring computer vision and audio ML into real applications.{' '}
                <span className="text-fg">Competitive programming</span> keeps my problem-solving sharp: I
                regularly solve data structures and algorithms problems on LeetCode, and contribute to open source.
            </>
        ),
        tools: ['Python', 'Pandas', 'Scikit-learn', 'Computer vision', 'Audio ML', 'DSA'],
    },
];

const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.9, ease, delay },
});

type PieceProps = {
    rotate: number;
    delay: number;
    z: number;
    draggable: boolean;
    bounds: React.RefObject<HTMLDivElement | null>;
    onLift: () => void;
    className: string;
    children: React.ReactNode;
};

// One thing on the desk: drops into place when scrolled to, and (with a mouse)
// can be picked up and moved; whatever was touched last sits on top
const Piece = ({ rotate, delay, z, draggable, bounds, onLift, className, children }: PieceProps) => (
    <motion.div
        drag={draggable}
        dragConstraints={bounds}
        dragElastic={0.12}
        onPointerDown={onLift}
        initial={{ opacity: 0, scale: 0.85, rotate: rotate - 10 }}
        whileInView={{ opacity: 1, scale: 1, rotate }}
        whileHover={draggable ? { scale: 1.02 } : undefined}
        whileDrag={{ scale: 1.05, rotate: rotate / 3 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease, delay }}
        style={{ zIndex: z }}
        className={`absolute ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
    >
        {children}
    </motion.div>
);

const Polaroid = () => {
    const [failed, setFailed] = useState(false);
    const showPhoto = PHOTO_SRC && !failed;
    return (
        <figure className="relative bg-card p-3 pb-14 shadow-paper">
            <span aria-hidden className="absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 rotate-[3deg] bg-pink/75" />
            {/* Blossom backdrop behind the cut-out photo (or the monogram): navy in dark mode, pink in light */}
            <div className="portrait-bg relative aspect-[4/5] overflow-hidden">
                {showPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element -- static export with images.unoptimized: next/image would add nothing here
                    <img
                        src={PHOTO_SRC}
                        alt="Portrait of Antra"
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        onError={() => setFailed(true)}
                        className="relative h-full w-full object-cover object-top"
                    />
                ) : (
                    <div className="relative grid h-full w-full place-items-center">
                        <span className="font-display italic text-[8rem] leading-none text-panel-fg">A</span>
                    </div>
                )}
            </div>
            <figcaption className="absolute inset-x-4 bottom-3.5 font-display text-2xl italic text-ink">Antra, ’26</figcaption>
            {/* Sticker */}
            <div className="absolute -right-5 -bottom-5 grid h-20 w-20 rotate-12 place-items-center rounded-full bg-pink text-center text-ink shadow-xl sm:h-24 sm:w-24">
                <div className="flex flex-col items-center gap-1">
                    <Sakura className="h-4 w-4" />
                    <span className="font-mono text-[8px] font-medium uppercase leading-tight tracking-[0.14em] sm:text-[9px]">Patent<br />co-inventor</span>
                </div>
            </div>
        </figure>
    );
};

const StudentCard = () => (
    <div className="w-[220px] overflow-hidden rounded-xl bg-card text-ink shadow-paper sm:w-[250px]">
        <div className="flex items-center justify-between bg-pink px-4 py-2">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em]">VIT · Student</span>
            <Sakura className="h-3.5 w-3.5" />
        </div>
        <div className="flex gap-3 px-4 pb-4 pt-3">
            <div className="flex-1">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/50">Programme</p>
                <p className="mt-0.5 text-[15px] font-semibold leading-tight">B.Tech CSE<br />(Data Science)</p>
                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-ink/50">Batch</p>
                <p className="mt-0.5 font-display text-xl leading-none">2024 – 2028</p>
            </div>
            {/* a barcode, for the look of it */}
            <span aria-hidden className="w-7 self-stretch bg-[repeating-linear-gradient(0deg,currentColor_0_2px,transparent_2px_4px,currentColor_4px_5px,transparent_5px_8px)] opacity-70" />
        </div>
    </div>
);

const StickyNote = () => (
    <div className="flex h-40 w-40 flex-col justify-between bg-[#E9E4F7] p-4 text-[#4B3F8F] shadow-paper sm:h-44 sm:w-44">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-70">Open source</p>
        <p className="font-display leading-none">
            <span className="text-6xl">36</span>
            <span className="ml-1 text-lg italic">PRs merged</span>
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em]">across 20 repos</p>
    </div>
);

// The paper things around the photo; with a mouse they can be pushed around
// A push pin: a glossy head with its shadow falling down and to the right
const Pin = ({ color }: { color: string }) => (
    <span
        aria-hidden
        className="absolute -top-1.5 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full shadow-[2px_4px_4px_rgba(40,20,5,0.45)]"
        style={{ background: `radial-gradient(circle at 35% 30%, #fff 0 12%, ${color} 38%, color-mix(in srgb, ${color} 60%, #000) 100%)` }}
    />
);

const PIECES = [
    { id: 'card', rotate: 6, pin: '#5B8FD0', className: 'right-[3%] bottom-[5%] sm:right-[4%] sm:bottom-[3%]', render: <StudentCard /> },
    { id: 'note', rotate: 5, pin: '#E0566F', className: 'right-[3%] top-[3%] sm:right-[6%] sm:top-[7%]', render: <StickyNote /> },
];

// What a first-time visitor finds already stuck on the desk
const STARTER_STICKERS: PlacedSticker[] = [
    { id: 'starter-hello', kind: 'hello', x: 0.12, y: 0.07, r: -10 },
    { id: 'starter-coffee', kind: 'coffee', x: 0.88, y: 0.44, r: 8 },
    { id: 'starter-sakura', kind: 'sakura', x: 0.16, y: 0.86, r: -12 },
];

// Somewhere fresh for a new sticker: of a handful of random spots, the one
// furthest from the stickers already down
const freeSpot = (taken: PlacedSticker[]) => {
    let best = { x: 0.5, y: 0.5, gap: -1 };
    for (let i = 0; i < 16; i++) {
        const x = 0.12 + Math.random() * 0.76;
        const y = 0.1 + Math.random() * 0.78;
        const gap = Math.min(2, ...taken.map((s) => Math.hypot(s.x - x, s.y - y)));
        if (gap > best.gap) best = { x, y, gap };
    }
    return best;
};
const STICKER_KEY = 'about-stickers';
const MAX_STICKERS = 24;

// Stickers are kept per visitor, in this browser only
const readStickers = (): PlacedSticker[] => {
    try {
        const saved = localStorage.getItem(STICKER_KEY);
        if (!saved) return STARTER_STICKERS;
        const list = JSON.parse(saved);
        return Array.isArray(list) ? list.filter((s) => s && s.kind in STICKERS) : STARTER_STICKERS;
    } catch {
        return STARTER_STICKERS;
    }
};

// The visitor's stickers: kept in this browser, added from the sheet, moved
// and peeled off on the board
const useStickers = () => {
    const [stickers, setStickers] = useState<PlacedSticker[]>(readStickers);
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        try { localStorage.setItem(STICKER_KEY, JSON.stringify(stickers)); } catch {}
    }, [stickers]);

    const add = (kind: StickerKind) => {
        const id = `${kind}-${Date.now().toString(36)}`;
        const { x, y } = freeSpot(stickers);
        const placed = { id, kind, x, y, r: Math.round((Math.random() - 0.5) * 36) };
        setStickers((list) => [...list, placed].slice(-MAX_STICKERS));
        setSelected(id);
    };
    const move = (id: string, x: number, y: number) => setStickers((list) => list.map((s) => (s.id === id ? { ...s, x, y } : s)));
    const remove = (id: string) => setStickers((list) => list.filter((s) => s.id !== id));
    const clear = () => setStickers([]);

    return { stickers, selected, setSelected, add, move, remove, clear };
};

type BoardProps = Omit<ReturnType<typeof useStickers>, 'add' | 'clear'>;

// The pin board: the photo taped on, the paper pinned, the stickers stuck down
const Board = ({ stickers, selected, setSelected, move, remove }: BoardProps) => {
    const desk = useRef<HTMLDivElement>(null);
    // Pushing the paper around needs a mouse: on touch it would trap the page's
    // scroll. Stickers are small, so they can be dragged by touch too.
    const [draggable] = useState(() => window.matchMedia('(pointer: fine)').matches);
    const [order, setOrder] = useState(PIECES.map((p) => p.id));
    const lift = (id: string) => setOrder((o) => [...o.filter((x) => x !== id), id]);

    return (
        <div className="cork-frame flex h-full flex-col rounded-2xl p-2.5 sm:p-3">
            {/* a tap on the bare cork puts the selected sticker down */}
            <div ref={desk} onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)} className="cork-board relative h-[540px] rounded-lg sm:h-[600px] lg:h-auto lg:min-h-[600px] lg:flex-1">
                {/* The photo stays where it is */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: -4 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 1, ease }}
                    className="pointer-events-none absolute left-[5%] top-[5%] w-[200px] sm:left-[6%] sm:top-[7%] sm:w-[260px]"
                    style={{ zIndex: 1 }}
                >
                    <Polaroid />
                </motion.div>
                {PIECES.map((p, i) => (
                    <Piece
                        key={p.id}
                        rotate={p.rotate}
                        delay={0.2 + i * 0.12}
                        z={order.indexOf(p.id) + 2}
                        draggable={draggable}
                        bounds={desk}
                        onLift={() => lift(p.id)}
                        className={p.className}
                    >
                        <div className="relative">
                            {p.render}
                            <Pin color={p.pin} />
                        </div>
                    </Piece>
                ))}
                <AnimatePresence>
                    {stickers.map((s) => (
                        <DeskSticker
                            key={s.id}
                            sticker={s}
                            desk={desk}
                            selected={selected === s.id}
                            onSelect={() => setSelected(s.id)}
                            onMove={(x, y) => move(s.id, x, y)}
                            onRemove={() => remove(s.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const About = () => {
    const { add, clear, ...board } = useStickers();
    return (
        <section id="about" className="w-full px-5 sm:px-10 pt-20 pb-20 sm:pt-28 sm:pb-28">
            <div className="mx-auto max-w-[1360px]">
                <SectionHeading title={<>About <em>me</em></>} />

                {/* phones: board, sheet, story. Wide screens: the board on the left,
                    the story and the sheet stacked on the right */}
                <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
                    <div className="lg:col-span-5 lg:row-span-2">
                        <Board {...board} />
                    </div>

                    <div className="order-1 lg:order-none lg:col-span-7 lg:col-start-6 lg:row-start-2 lg:self-end">
                        <StickerSheet onAdd={add} onClear={clear} count={board.stickers.length} />
                    </div>

                    <div className="order-2 mt-6 lg:order-none lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:mt-0 lg:pt-6">
                        <motion.p {...reveal()} className="text-[clamp(1.5rem,2.5vw,2.375rem)] font-medium leading-[1.2] tracking-[-0.025em] text-fg">
                            I’m Antra, a software engineer and data scientist. I build full stack
                            products end to end and <em className="font-display font-normal text-accent">ship them to production.</em>
                        </motion.p>

                        <div className="mt-14 grid gap-12 sm:grid-cols-2 sm:gap-10">
                            {sides.map((side, i) => (
                                <motion.div key={side.title} {...reveal(0.1 + i * 0.1)}>
                                    <h3 className="font-display text-3xl italic leading-none text-accent">{side.title}</h3>
                                    <p className="mt-4 text-[15px] leading-relaxed text-fg/65">{side.body}</p>
                                    <ul className="mt-6 flex flex-wrap gap-2">
                                        {side.tools.map((tool) => (
                                            <li key={tool} className="rounded-full bg-fg/[0.07] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-fg/80">
                                                {tool}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
