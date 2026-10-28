'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControlsWithThen, type MotionStyle, type MotionValue } from 'framer-motion';
import { IoArrowBack, IoArrowForward, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import Sakura from './Sakura';
import { roles, type Role } from './experienceData';

// Where I've worked, as a hardcover book. It waits closed, its cover reading
// "Experience", until the reader opens it: the inside cover on the left,
// the contents on the right. Each role is a chapter of two pages. A page turns
// with a tap or a drag anywhere on it (it bends as it goes over), its folded
// corner, a sideways trackpad swipe, or the arrow keys. The cover is turned the
// same way, open or shut. Shut, its cover lifts at the edge to show it opens:
// once as it comes into view, and whenever it's pointed at. With reduced motion
// it turns quicker and doesn't lift.
// The reader can lay the ribbon in any page; its tail then sticks out of the
// book and leads back there.
//
// Every page has an index, a "face": 0 is the inside of the front cover (drawn
// by the cover), 1 the contents, then each chapter's opening and story pages.
// Wide screens show two faces at a time (a spread); phones show one.

const ease = [0.16, 1, 0.3, 1] as const;

const NUMERAL = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const WORD = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
const LAST = roles.length * 2 + 1; // the last chapter's story page
const opening = (k: number) => k * 2 + 2;

const MARK_KEY = 'experience-bookmark';
const readMark = () => {
    try {
        const n = Number(localStorage.getItem(MARK_KEY) ?? NaN);
        return Number.isInteger(n) && n >= 1 && n <= LAST ? n : null;
    } catch {
        return null;
    }
};
const saveMark = (face: number | null) => {
    try {
        if (face === null) localStorage.removeItem(MARK_KEY);
        else localStorage.setItem(MARK_KEY, String(face));
    } catch {
        // nowhere to keep it; the ribbon still works for this visit
    }
};

const WIDE = '(min-width: 768px)';
const subscribe = (onChange: () => void) => {
    const m = window.matchMedia(WIDE);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
};
const useWide = () => useSyncExternalStore(subscribe, () => window.matchMedia(WIDE).matches, () => true);

// Where the pages lie inside the boards: the right page (or a phone's only page), and the left page
const RIGHT = 'absolute top-3 bottom-4 left-2 right-3 md:top-3.5 md:bottom-5 md:left-1/2 md:right-3.5';
const LEFT = 'absolute top-3.5 bottom-5 left-3.5 right-1/2';

// ---------------------------------------------------------------------------
// The pages

const Ornament = ({ className = '' }: { className?: string }) => (
    <div aria-hidden className={`flex items-center gap-3 text-[#C2577A] ${className}`}>
        <span className="h-px w-10 bg-[#2A211B]/20" />
        <Sakura className="h-3.5 w-3.5" />
        <span className="h-px w-10 bg-[#2A211B]/20" />
    </div>
);

const RunningHead = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
    <p aria-hidden className={`font-book text-[12px] uppercase tracking-[0.24em] text-[#2A211B]/50 ${right ? 'text-right' : ''}`}>{children}</p>
);

const Folio = ({ n, right }: { n: number; right?: boolean }) => (
    <p aria-hidden className={`font-book text-[15px] text-[#2A211B]/50 ${right ? 'text-right' : ''}`}>{n}</p>
);

const SmallCaps = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <p className={`font-book text-[12px] uppercase tracking-[0.24em] text-[#2A211B]/55 ${className}`}>{children}</p>
);

type ContentsProps = { intro: boolean; play: boolean; onJump?: (k: number) => void; onDone?: () => void };

// The contents write themselves in, line by line, as the book first opens
const Contents = ({ intro, play, onJump, onDone }: ContentsProps) => {
    const lines = roles.length + 3;
    const line = (i: number) =>
        intro
            ? {
                  initial: { opacity: 0, y: 8 },
                  animate: play ? { opacity: 1, y: 0 } : undefined,
                  transition: { delay: 0.9 + i * 0.16, duration: 0.6, ease },
                  onAnimationComplete: i === lines - 1 ? onDone : undefined,
              }
            : {};
    return (
        <>
            <RunningHead right>Experience</RunningHead>
            <div className="flex min-h-0 flex-1 flex-col pt-7 md:pt-10">
                <motion.h3 {...line(0)} className="font-display text-[2.6rem] leading-none text-[#2A211B] md:text-[3rem]">Contents</motion.h3>
                <motion.div {...line(1)}><Ornament className="mt-4 [&>span:first-child]:hidden" /></motion.div>
                <ol className="mt-6 space-y-3.5 md:mt-8 md:space-y-4">
                    {roles.map((r, k) => (
                        <motion.li key={r.short} {...line(k + 2)}>
                            <button
                                type="button"
                                tabIndex={onJump ? undefined : -1}
                                onClick={() => onJump?.(k)}
                                className="group block w-full cursor-pointer rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-[#A3324F]/50"
                            >
                                <span className="flex items-baseline gap-3 font-book text-[17px] leading-snug text-[#2A211B]">
                                    <span className="w-7 shrink-0 font-display text-lg italic text-[#A3324F]">{NUMERAL[k]}</span>
                                    <span className="min-w-0 transition-colors group-hover:text-[#A3324F]">{r.company}</span>
                                    <span aria-hidden className="mb-1 min-w-4 flex-1 border-b border-dotted border-[#2A211B]/35" />
                                    <span className="tabular-nums text-[#2A211B]/65">{opening(k)}</span>
                                </span>
                                <span className="block pl-10 font-book text-[15px] italic text-[#2A211B]/60">{r.title}</span>
                            </button>
                        </motion.li>
                    ))}
                </ol>
                <motion.p {...line(lines - 1)} className="mt-auto pt-5 font-book text-[15px] italic leading-snug text-[#2A211B]/55">
                    Tap a page, or drag it, to turn it.
                </motion.p>
            </div>
        </>
    );
};

// A chapter's first page: its number, the place, and what happens in it
const Opening = ({ role, k }: { role: Role; k: number }) => (
    <>
        <RunningHead>Experience</RunningHead>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
            <SmallCaps>Chapter {WORD[k]}</SmallCaps>
            <Ornament className="mt-4" />
            <h3 className="mt-5 max-w-[14ch] text-balance font-display text-[2.4rem] leading-[1.02] text-[#2A211B] md:text-[clamp(2.4rem,3.4vw,3.2rem)]">{role.company}</h3>
            <p className="mt-3 font-book text-xl italic text-[#A3324F]">{role.title}</p>
            <SmallCaps className="mt-2">{role.kind} · {role.period}</SmallCaps>
            <p className="mt-8 max-w-[30ch] border-t border-[#2A211B]/15 pt-6 font-book text-[17px] italic leading-snug text-[#2A211B]/75">{role.summary}</p>
        </div>
        <Folio n={opening(k)} />
    </>
);

// A chapter's second page: what I did, in prose, then the numbers and the tools
const Story = ({ role, k }: { role: Role; k: number }) => (
    <>
        <RunningHead right>Chapter {NUMERAL[k]} · {role.short}</RunningHead>
        <div className="min-h-0 flex-1 pt-6 md:pt-9">
            <p className="hyphens-auto text-justify font-book text-[16.5px] leading-[1.6] text-[#2A211B]/90 md:text-[17.5px] first-letter:float-left first-letter:mr-2.5 first-letter:mt-[0.08em] first-letter:font-display first-letter:text-[4.1rem] first-letter:leading-[0.78] first-letter:text-[#A3324F]">
                {role.desc}
            </p>
            {role.highlights.length > 0 && (
                <>
                    <SmallCaps className="mt-7">By the numbers</SmallCaps>
                    <dl className="mt-2.5 space-y-1.5">
                        {role.highlights.map((h) => (
                            <div key={h.label} className="flex flex-row-reverse items-baseline justify-end gap-4">
                                <dt className="font-book text-[17px] italic text-[#2A211B]/80">{h.label}</dt>
                                <dd className="w-14 shrink-0 text-right font-display text-[2rem] leading-none text-[#A3324F]">{h.value}</dd>
                            </div>
                        ))}
                    </dl>
                </>
            )}
            {role.stack.length > 0 && (
                <>
                    <SmallCaps className="mt-6">Tools of the trade</SmallCaps>
                    <p className="mt-1 font-book text-[17px] italic text-[#2A211B]/80">{role.stack.join(' · ')}</p>
                </>
            )}
            <Ornament className="mt-7 justify-center" />
        </div>
        {/* a short chapter leaves room for a blossom pressed between the pages */}
        {role.highlights.length === 0 && (
            <div aria-hidden className="mb-4 flex justify-end pr-6 text-[#D98BA3] opacity-45">
                <Sakura className="h-20 w-20 rotate-[18deg]" />
                <Sakura className="-ml-6 mt-10 h-12 w-12 -rotate-12" />
            </div>
        )}
        <Folio n={opening(k) + 1} right />
    </>
);

// Any face of the book on its sheet of paper; side is where the spine is not
const Page = ({ face, side, contents }: { face: number; side: 'left' | 'right'; contents?: ContentsProps }) => {
    const k = Math.floor((face - 2) / 2);
    return (
        <div className={`book-paper ${side === 'left' ? 'book-paper-left md:px-12' : 'book-paper-right pl-11 md:px-12'} absolute inset-0 flex flex-col overflow-hidden py-6 pr-7 pl-7 md:py-9`}>
            {face === 1 && <Contents {...(contents ?? { intro: false, play: true })} />}
            {face >= 2 && (face % 2 === 0 ? <Opening role={roles[k]} k={k} /> : <Story role={roles[k]} k={k} />)}
        </div>
    );
};

// ---------------------------------------------------------------------------
// The turning leaf: a sheet cut into upright strips, each hinged to the last,
// so it can bend. It turns about the spine; past halfway it shows its back.

const STRIPS = 12;
const BEND = (STRIPS * (STRIPS - 1)) / 2;
const CURL = 40; // how far the free edge leads the spine side, mid-turn, in degrees

const LeafFace = ({ i, back, children }: { i: number; back?: boolean; children: React.ReactNode }) => {
    const slice = back ? STRIPS - 1 - i : i;
    const shade = back ? 0.9 - (0.5 * i) / (STRIPS - 1) : 0.35 + (0.65 * i) / (STRIPS - 1);
    return (
        <div className="absolute inset-y-0 left-0 w-[calc(100%+1px)] overflow-hidden [backface-visibility:hidden]" style={back ? { transform: 'rotateY(180deg)' } : undefined}>
            {/* the whole page, shifted so this strip shows its own slice (1px of overlap hides the seams) */}
            <div className="absolute inset-y-0" style={{ width: `calc(${STRIPS} * (100% - 1px))`, left: `calc(${-slice} * (100% - 1px))` }}>
                {children}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[#1B1208]" style={{ opacity: `calc(var(--shade) * ${shade.toFixed(3)})` }} />
        </div>
    );
};

const Strip = ({ i, front, back }: { i: number; front: React.ReactNode; back: React.ReactNode }) => (
    <div
        className={`absolute inset-y-0 ${i === 0 ? 'left-0' : 'left-full w-full'}`}
        style={{
            width: i === 0 ? `${100 / STRIPS}%` : undefined,
            transformStyle: 'preserve-3d',
            transformOrigin: '0 50%',
            transform: i === 0 ? 'rotateY(calc(var(--turn) * 1deg))' : `rotateY(calc(var(--bend) * ${(i / BEND).toFixed(4)} * 1deg))`,
        }}
    >
        <LeafFace i={i}>{front}</LeafFace>
        <LeafFace i={i} back>{back}</LeafFace>
        {i < STRIPS - 1 && <Strip i={i + 1} front={front} back={back} />}
    </div>
);

// t runs 0 → 1 as the turn completes; forward turns go right to left
const Leaf = ({ t, forward, front, back }: { t: MotionValue<number>; forward: boolean; front: React.ReactNode; back: React.ReactNode }) => {
    const over = useTransform(t, (v) => (forward ? v : 1 - v)); // 0 lying on the right, 1 on the left
    const turn = useTransform(over, (v) => -180 * v);
    const bend = useTransform(over, (v) => (forward ? -1 : 1) * CURL * Math.sin(Math.PI * v));
    const shade = useTransform(over, (v) => 0.3 * Math.sin(Math.PI * v));
    return (
        <motion.div aria-hidden inert className={`${RIGHT} pointer-events-none z-30`} style={{ transformStyle: 'preserve-3d', '--turn': turn, '--bend': bend, '--shade': shade } as MotionStyle}>
            <Strip i={0} front={front} back={back} />
        </motion.div>
    );
};

// ---------------------------------------------------------------------------
// The book

type Turn = { from: number; to: number };
// A press on a page: it becomes a turn once it moves sideways, or stays a tap
type Press = { x: number; span: number; tap: 1 | -1; may: (1 | -1)[]; onControl: boolean; dir: 0 | 1 | -1; base: number; lastX: number; lastT: number; v: number; cover: boolean };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// A folded page corner with an arrow on its flap: the page's own turn button
const Corner = ({ side, label, faded, onClick }: { side: 'left' | 'right'; label: string; faded: boolean; onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className={`group/corner absolute bottom-0 z-10 h-14 w-14 cursor-pointer outline-none transition-opacity duration-200 ${side === 'right' ? 'right-0' : 'left-0'} ${faded ? 'opacity-0' : ''}`}
    >
        <span
            aria-hidden
            className={`absolute bottom-0 h-10 w-10 transition-[width,height] duration-300 group-hover/corner:h-14 group-hover/corner:w-14 group-focus-visible/corner:h-14 group-focus-visible/corner:w-14 group-focus-visible/corner:ring-2 group-focus-visible/corner:ring-[#A3324F]/50 ${side === 'right' ? 'book-ear-right right-0' : 'book-ear-left left-0'}`}
        >
            {side === 'right' ? (
                <IoChevronForward className="absolute left-[14%] top-[14%] h-3.5 w-3.5 text-[#8A6F55]" />
            ) : (
                <IoChevronBack className="absolute right-[14%] top-[14%] h-3.5 w-3.5 text-[#8A6F55]" />
            )}
        </span>
    </button>
);

export const Book = () => {
    const reduceMotion = !!useReducedMotion();
    const wide = useWide();

    const [face, setFace] = useState(1);
    const [turn, setTurnState] = useState<Turn | null>(null);
    const [open, setOpen] = useState(false); // the cover is open or opening
    const [ready, setReady] = useState(false); // the cover has finished opening
    const [introDone, setIntroDone] = useState(false);
    const [mark, setMark] = useState<number | null>(readMark);
    const [backShut, setBackShut] = useState(false); // read to the end and closed from the back

    const t = useMotionValue(0);
    const cover = useMotionValue(0); // 0 shut, 1 open
    const coverTurn = useTransform(cover, (v) => -180 * v);
    const coverFade = useTransform(cover, [0, 0.5, 0.75], [1, 1, 0]); // phones: the cover swings off the screen
    const backCover = useMotionValue(0); // the back cover: 0 lying open, 1 closed over the last page
    const backTurn = useTransform(backCover, (v) => -180 * v); // wide: it swings over the spine onto the left
    const backIn = useTransform(backCover, (v) => -180 * (1 - v)); // phones: it swings in from the left, over the page
    const backFade = useTransform(backCover, [0.25, 0.5], [0, 1]);
    // wide: the shut book sits in the middle; it moves aside as the front cover opens (not while it only
    // lifts), and back to the middle as the back cover closes
    const shift = useTransform(() => {
        const c = cover.get();
        return `${(c < 0.12 ? -25 : -25 + ((c - 0.12) / 0.88) * 25) + 25 * backCover.get()}%`;
    });
    const sheen = useTransform(t, (v) => 0.22 * Math.sin(Math.PI * v));

    const bookRef = useRef<HTMLDivElement>(null);
    const faceRef = useRef(1); // handlers read the page from here, so quick taps stack up correctly
    const turnRef = useRef<Turn | null>(null);
    const anim = useRef<AnimationPlaybackControlsWithThen | null>(null);
    const token = useRef(0);
    const coverAnim = useRef<AnimationPlaybackControlsWithThen | null>(null);
    const coverToken = useRef(0);
    const committing = useRef(false);
    const held = useRef<Press | null>(null);
    const openRef = useRef(false);
    const swipe = useRef<(dir: 1 | -1) => void>(() => {});

    // views: spreads on wide screens, single pages on phones
    const views = wide ? roles.length + 1 : LAST;
    const viewOf = (f: number) => (wide ? Math.floor(f / 2) : Math.max(0, f - 1));
    const faceOf = (v: number) => (wide ? v * 2 + 1 : v + 1);
    const view = viewOf(face);
    const now = () => viewOf(faceRef.current);

    const moveTo = (f: number) => {
        faceRef.current = f;
        setFace(f);
    };
    const setTurn = (next: Turn | null) => {
        turnRef.current = next;
        setTurnState(next);
    };
    const startTurn = (to: number) => {
        const from = now();
        if (to < 0 || to >= views || to === from) return false;
        setTurn({ from, to });
        return true;
    };
    const settle = (tr: Turn, done: boolean) => {
        committing.current = false;
        if (done) moveTo(faceOf(tr.to));
        setTurn(null);
        t.jump(0);
    };

    // carry the turn in hand through to the end (1) or let it fall back (0)
    const run = (target: 0 | 1) => {
        const tr = turnRef.current;
        if (!tr) return;
        anim.current?.stop();
        const id = ++token.current;
        committing.current = target === 1;
        const left = target === 1 ? 1 - t.get() : t.get();
        // (with reduced motion the page still turns, just quicker)
        const duration = reduceMotion ? 0.4 : target === 1 ? 0.3 + 0.6 * left : 0.2 + 0.4 * left;
        anim.current = animate(t, target, { duration, ease: [0.33, 0.1, 0.25, 1] });
        anim.current.then(() => {
            if (token.current === id) settle(tr, target === 1);
        });
    };

    // a page still in the air lands at once (or drops back), so the next turn can begin
    const finish = () => {
        const tr = turnRef.current;
        if (!tr) return;
        anim.current?.stop();
        token.current++;
        settle(tr, committing.current);
    };

    const go = (to: number) => {
        if (committing.current) finish();
        // back past the contents is the front cover: the book shuts
        if (to === -1 && now() === 0) {
            finish();
            swing(0);
            return;
        }
        // on past the last page is the back cover: the book shuts
        if (to === views && now() === views - 1) {
            finish();
            closeBack();
            return;
        }
        if (to < 0 || to >= views || to === now()) return;
        if (turnRef.current && turnRef.current.to !== to) finish(); // lifted the other way
        if (turnRef.current || startTurn(to)) run(1);
    };

    // a page lifts a little at its edge when pointed at, and once by itself when the book first opens
    const peek = (to: number) => {
        if (reduceMotion || turnRef.current || held.current || !startTurn(to)) return;
        token.current++;
        anim.current = animate(t, 0.08, { duration: 0.35, ease: 'easeOut' });
    };
    const unpeek = () => {
        if (!held.current && !committing.current && turnRef.current) run(0);
    };
    const hint = () => {
        if (reduceMotion || turnRef.current || held.current || !startTurn(now() + 1)) return;
        const tr = turnRef.current as Turn | null;
        const id = ++token.current;
        anim.current = animate(t, [0, 0.14, 0], { duration: 1.6, ease: 'easeInOut' });
        anim.current.then(() => {
            if (token.current === id && tr) settle(tr, false);
        });
    };

    // The front cover is a board on a hinge. It swings open (1) or shut (0) from wherever it is,
    // and can be tapped or dragged over like a page.
    const swing = (to: 0 | 1) => {
        coverAnim.current?.stop();
        const id = ++coverToken.current;
        openRef.current = to === 1;
        if (to === 1) setOpen(true);
        else setReady(false);
        const left = Math.abs(to - cover.get());
        coverAnim.current = animate(cover, to, { duration: reduceMotion ? 0.45 : 0.35 + 1.25 * left, ease: [0.6, 0.02, 0.25, 1] });
        return coverAnim.current.then(() => {
            if (coverToken.current !== id) return;
            if (to === 1) setReady(true);
            else setOpen(false);
        });
    };
    // The back cover, at the end: it swings over the last page and the book shuts, back cover up.
    // Tapped, it opens again onto the last spread.
    const backAnim = useRef<AnimationPlaybackControlsWithThen | null>(null);
    const closeBack = () => {
        backAnim.current?.stop();
        setReady(false);
        setBackShut(true);
        backAnim.current = animate(backCover, 1, { duration: reduceMotion ? 0.45 : 1.5, ease: [0.6, 0.02, 0.25, 1] });
    };
    const openBack = () => {
        backAnim.current?.stop();
        backAnim.current = animate(backCover, 0, { duration: reduceMotion ? 0.45 : 1.4, ease: [0.6, 0.02, 0.25, 1] });
        backAnim.current.then(() => {
            if (backCover.get() !== 0) return;
            setBackShut(false);
            setReady(true);
        });
    };

    const holdCover = (p: Press) => {
        coverAnim.current?.stop();
        coverToken.current++;
        p.cover = true;
        p.base = cover.get();
    };
    const moveCover = (p: Press, e: React.PointerEvent) => {
        const dx = e.clientX - p.x;
        if (p.dir === 0) {
            if (Math.abs(dx) < 6) return;
            p.dir = dx < 0 ? 1 : -1;
        }
        const dt = e.timeStamp - p.lastT;
        if (dt > 0) p.v = (p.lastX - e.clientX) / dt; // towards open
        p.lastX = e.clientX;
        p.lastT = e.timeStamp;
        cover.set(clamp01(p.base - dx / p.span));
    };
    const releaseCover = (p: Press) => {
        if (p.dir === 0) return swing(p.base < 0.5 ? 1 : 0);
        const c = cover.get();
        // like a page: a fifth of the way over, or a flick, and it goes
        if (p.base < 0.5) swing(c > 0.2 || p.v > 0.3 ? 1 : 0);
        else swing(c < 0.8 || p.v < -0.3 ? 0 : 1);
    };
    // the shut cover lifts a little at its edge, to show it opens
    const lift = (keyframes: number[], duration: number, delay = 0) => {
        if (openRef.current || held.current || reduceMotion) return;
        coverAnim.current?.stop();
        coverToken.current++;
        coverAnim.current = animate(cover, keyframes, { duration, delay, ease: 'easeInOut' });
    };
    const coverEvents = {
        onPointerEnter: (e: React.PointerEvent<HTMLDivElement>) => e.pointerType === 'mouse' && lift([cover.get(), 0.07], 0.35),
        onPointerLeave: () => cover.get() < 0.12 && lift([cover.get(), 0], 0.3),
        onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
            if (e.button !== 0 || turnRef.current) return;
            const p: Press = { x: e.clientX, span: (bookRef.current?.offsetWidth ?? 1000) * (wide ? 0.45 : 0.8), tap: 1, may: [1, -1], onControl: false, dir: 0, base: 0, lastX: e.clientX, lastT: e.timeStamp, v: 0, cover: true };
            holdCover(p);
            held.current = p;
            e.currentTarget.setPointerCapture(e.pointerId);
        },
        onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => held.current?.cover && moveCover(held.current, e),
        onPointerUp: () => {
            const p = held.current;
            held.current = null;
            if (p) releaseCover(p);
        },
        onPointerCancel: () => {
            held.current = null;
            swing(cover.get() > 0.5 ? 1 : 0);
        },
    };

    // Tap or drag anywhere on a page. On a spread the right page goes forward and the left page
    // back; a phone's single page goes either way (tap its left side to go back).
    const pageEvents = (side: 'left' | 'right') => {
        const may: (1 | -1)[] = wide ? [side === 'right' ? 1 : -1] : [1, -1];
        return {
            onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
                if (!ready || e.button !== 0) return;
                if (committing.current) finish();
                const r = e.currentTarget.getBoundingClientRect();
                const tap: 1 | -1 = wide ? may[0] : e.clientX - r.left > r.width * 0.35 ? 1 : -1;
                const onControl = !!(e.target as Element).closest('button, a');
                held.current = { x: e.clientX, span: r.width * 0.8, tap, may, onControl, dir: 0, base: 0, lastX: e.clientX, lastT: e.timeStamp, v: 0, cover: false };
                if (!onControl) e.currentTarget.setPointerCapture(e.pointerId);
            },
            onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
                const p = held.current;
                if (!p) {
                    if (!ready || !wide || e.pointerType !== 'mouse') return;
                    const r = e.currentTarget.getBoundingClientRect();
                    const nearEdge = side === 'right' ? e.clientX > r.right - r.width * 0.25 : e.clientX < r.left + r.width * 0.25;
                    if (nearEdge) peek(now() + may[0]);
                    else unpeek();
                    return;
                }
                if (p.cover) return moveCover(p, e);
                const dx = e.clientX - p.x;
                if (p.dir === 0) {
                    if (Math.abs(dx) < 6) return;
                    const want: 1 | -1 = dx < 0 ? 1 : -1;
                    if (!p.may.includes(want)) return;
                    // a phone's contents page pulled back brings the cover over it
                    if (want === -1 && now() === 0) {
                        if (p.onControl) e.currentTarget.setPointerCapture(e.pointerId);
                        holdCover(p);
                        p.dir = -1;
                        return moveCover(p, e);
                    }
                    if (turnRef.current && turnRef.current.to !== now() + want) finish();
                    if (!turnRef.current && !startTurn(now() + want)) return;
                    anim.current?.stop();
                    token.current++;
                    p.dir = want;
                    p.base = t.get();
                    if (p.onControl) e.currentTarget.setPointerCapture(e.pointerId);
                }
                const dt = e.timeStamp - p.lastT;
                if (dt > 0) p.v = ((p.lastX - e.clientX) * p.dir) / dt;
                p.lastX = e.clientX;
                p.lastT = e.timeStamp;
                t.set(clamp01(p.base + (-dx * p.dir) / p.span));
            },
            onPointerUp: () => {
                const p = held.current;
                held.current = null;
                if (!p) return;
                if (p.cover) return releaseCover(p);
                // a tap turns the page (a link or button on it does its own thing instead)
                if (p.dir === 0) {
                    if (!p.onControl) go(now() + p.tap);
                    return;
                }
                // a drag turns it once pulled a fifth of the way over, or flicked
                run(t.get() > 0.2 || p.v > 0.3 ? 1 : 0);
            },
            onPointerCancel: () => {
                const p = held.current;
                held.current = null;
                if (p?.cover) swing(cover.get() > 0.5 ? 1 : 0);
                else if (!committing.current) run(0);
            },
            onPointerLeave: () => {
                if (!held.current) unpeek();
            },
        };
    };

    // a sideways swipe on a trackpad turns one page (its trailing events land while that page is still turning)
    useEffect(() => {
        swipe.current = (dir) => ready && !committing.current && go(now() + dir);
    });
    useEffect(() => {
        const el = bookRef.current;
        if (!el) return;
        let sum = 0;
        let last = 0;
        let locked = false;
        const onWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
            e.preventDefault(); // (or the browser takes it as "back")
            const quiet = e.timeStamp - last > 300;
            last = e.timeStamp;
            if (quiet) {
                sum = 0;
                locked = false;
            }
            if (locked) return;
            sum += e.deltaX;
            if (Math.abs(sum) > 24) {
                locked = true;
                swipe.current(sum > 0 ? 1 : -1);
            }
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    const placeMark = (f: number | null) => {
        setMark(f);
        saveMark(f);
    };

    // which faces lie flat, and which one is turning
    let left = 0;
    let right: number;
    let front = 0;
    let back = 0;
    const forward = turn ? turn.to > turn.from : true;
    if (wide) {
        if (!turn) [left, right] = [view * 2, view * 2 + 1];
        else if (forward) [left, right, front, back] = [turn.from * 2, turn.to * 2 + 1, turn.from * 2 + 1, turn.to * 2];
        else [left, right, front, back] = [turn.to * 2, turn.from * 2 + 1, turn.to * 2 + 1, turn.from * 2];
    } else {
        if (!turn) right = view + 1;
        else if (forward) [right, front] = [turn.to + 1, turn.from + 1];
        else [right, front] = [turn.from + 1, turn.to + 1];
    }

    const contents: ContentsProps = {
        intro: !introDone,
        play: open,
        onJump: (k) => go(viewOf(opening(k))),
        onDone: () => {
            setIntroDone(true);
            hint();
        },
    };
    const markView = mark === null ? null : viewOf(mark);
    const markName = mark === null ? '' : mark < 2 ? 'the contents' : `chapter ${WORD[Math.floor((mark - 2) / 2)].toLowerCase()}`;
    const here = (() => {
        if (!open) return 'The book is closed. Its cover reads Experience.';
        if (backShut) return 'The book is closed: you read it to the end. Its back cover says thank you for reading.';
        const f = faceOf(view);
        if (f < 2) return 'Contents';
        const k = Math.floor((f - 2) / 2);
        return `Chapter ${WORD[k]}: ${roles[k].title}, ${roles[k].company}`;
    })();
    const ribbonX = (onLeft: boolean) => (onLeft ? 'left-[22px] md:left-[calc(50%-38px)]' : 'left-[22px] md:left-[calc(50%+22px)]');
    const hasNext = view < views - 1;
    const atEnd = !hasNext; // the next turn closes the book
    const hasPrev = view > 0;
    const sideArrow = 'absolute top-[320px] hidden h-12 w-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-fg/20 text-fg/70 transition-colors hover:border-accent hover:text-accent disabled:cursor-default disabled:opacity-25 disabled:hover:border-fg/20 disabled:hover:text-fg/70 min-[1340px]:grid';

    return (
        <div className="exp-book relative mx-auto max-w-[1080px] pb-14">
            <p className="sr-only" aria-live="polite">{here}</p>
            {/* on wide screens, plain arrows either side of the book as well */}
            {ready && wide && (
                <>
                    <button type="button" onClick={() => go(now() - 1)} aria-label={hasPrev ? 'Previous page' : 'Close the book'} title={hasPrev ? undefined : 'Close the book'} className={`${sideArrow} -left-20`}>
                        <IoArrowBack />
                    </button>
                    <button type="button" onClick={() => go(now() + 1)} aria-label={atEnd ? 'Close the book' : 'Next page'} title={atEnd ? 'Close the book' : undefined} className={`${sideArrow} -right-20`}>
                        <IoArrowForward />
                    </button>
                </>
            )}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.8, ease }}
                // it stays shut for the reader to open; coming into view, its cover lifts once to show it can
                onViewportEnter={() => lift([0, 0.1, 0], 1.4, 0.9)}
            >
                <motion.div
                    ref={bookRef}
                    role="group"
                    aria-roledescription="book"
                    aria-label="Experience"
                    onKeyDown={(e) => {
                        if (!ready) return;
                        if (e.key === 'ArrowRight') go(now() + 1);
                        if (e.key === 'ArrowLeft') go(now() - 1);
                    }}
                    style={{ x: wide ? shift : 0 }}
                    className="relative h-[760px] [perspective:2600px] md:h-[640px]"
                >
                    {/* the back board, under the block of pages */}
                    {!(wide && backShut) && (
                        <div aria-hidden className="book-cloth absolute inset-0 rounded-l-sm rounded-r-lg shadow-[0_30px_50px_-25px_rgba(0,0,0,0.6)] md:left-1/2 md:rounded-l-none" />
                    )}

                    {/* the pages lying open: tap or drag one to turn it */}
                    <div inert={!ready}>
                        {wide && left > 0 && (
                            <div {...pageEvents('left')} className={`${LEFT} book-stack-left z-[25] cursor-pointer touch-pan-y select-none`}>
                                <Page face={left} side="left" />
                                <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black to-transparent to-40%" style={{ opacity: sheen }} />
                                <Corner side="left" label="Previous page" faded={!!turn} onClick={() => go(now() - 1)} />
                            </div>
                        )}
                        <div {...pageEvents('right')} className={`${RIGHT} book-stack-right z-10 cursor-pointer touch-pan-y select-none ${wide && backShut ? 'invisible' : ''}`}>
                            <Page face={right} side="right" contents={right === 1 ? contents : undefined} />
                            <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black to-transparent to-40%" style={{ opacity: sheen }} />
                            <Corner side="right" label={atEnd ? 'Close the book' : 'Next page'} faded={!!turn} onClick={() => go(now() + 1)} />
                            {!wide && <Corner side="left" label={hasPrev ? 'Previous page' : 'Close the book'} faded={!!turn} onClick={() => go(now() - 1)} />}
                        </div>
                    </div>

                    {turn && (
                        <Leaf
                            key={`${turn.from}-${turn.to}`}
                            t={t}
                            forward={forward}
                            front={<Page face={front} side="right" />}
                            back={wide ? <Page face={back} side="left" /> : <div className="book-paper book-paper-left absolute inset-0" />}
                        />
                    )}

                    {/* the front cover: its outside, then the inside of the board with the endpaper */}
                    <motion.div
                        {...coverEvents}
                        className="absolute inset-0 z-20 cursor-pointer touch-pan-y select-none md:left-1/2"
                        style={{ transformStyle: 'preserve-3d', originX: 0, rotateY: coverTurn }}
                    >
                        {/* (each face fades on its own: fading the hinged board would flatten it) */}
                        <motion.button
                            type="button"
                            style={{ opacity: wide ? 1 : coverFade }}
                            onClick={(e) => e.detail === 0 && swing(1)} // keyboards; a pointer is handled by the board
                            tabIndex={open ? -1 : undefined}
                            aria-label="Open the book"
                            className="book-cloth absolute inset-0 cursor-pointer overflow-hidden rounded-l-sm rounded-r-lg shadow-[0_30px_50px_-25px_rgba(0,0,0,0.6)] outline-none [backface-visibility:hidden] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
                        >
                            <span aria-hidden className="absolute inset-y-0 left-0 w-7 bg-gradient-to-r from-black/25 to-transparent" />
                            <span aria-hidden className="absolute inset-y-0 left-7 w-[2px] bg-black/15 shadow-[1px_0_0_rgba(255,255,255,0.2)]" />
                            <span aria-hidden className="book-foil absolute inset-x-10 inset-y-8 border border-current opacity-40" />
                            <span aria-hidden className="book-foil absolute inset-x-12 inset-y-10 border border-current opacity-25" />
                            <span className="book-foil absolute inset-0 flex flex-col items-center justify-center gap-5 px-14 text-center">
                                <Sakura className="h-8 w-8 opacity-80" />
                                <span className="font-display text-[clamp(3.2rem,6vw,4.8rem)] leading-none">Experience</span>
                                <span aria-hidden className="h-px w-16 bg-current opacity-50" />
                                <span className="font-book text-lg italic opacity-85">{WORD[roles.length - 1]} chapters · 2025 – 2026</span>
                            </span>
                            <span aria-hidden className="book-foil absolute inset-x-0 bottom-16 text-center font-book text-sm uppercase tracking-[0.45em] opacity-80">Antra</span>
                        </motion.button>
                        <motion.div aria-hidden style={{ opacity: wide ? 1 : coverFade, rotateY: 180 }} className="book-cloth absolute inset-0 rounded-l-lg rounded-r-sm [backface-visibility:hidden]">
                            <div className="book-endpaper absolute bottom-5 left-3.5 right-0 top-3.5 overflow-hidden">
                                <svg className="absolute inset-0 h-full w-full">
                                    <defs>
                                        <pattern id="book-endpaper" width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(14)">
                                            {[[12, 12, 0.55, 1], [35, 35, 0.4, 0.6]].map(([x, y, s, o]) => (
                                                <g key={x} transform={`translate(${x} ${y}) scale(${s})`} fill="currentColor" opacity={o}>
                                                    {[0, 72, 144, 216, 288].map((r) => (
                                                        <path key={r} d="M0 -1.5 C -3.6 -4 -4 -8.6 -1.4 -10.8 L 0 -9.4 L 1.4 -10.8 C 4 -8.6 3.6 -4 0 -1.5 Z" transform={`rotate(${r})`} />
                                                    ))}
                                                </g>
                                            ))}
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#book-endpaper)" />
                                </svg>
                                <span className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/15 to-transparent" />
                                {/* the bookplate */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={open ? { opacity: 1, y: 0 } : undefined}
                                    transition={{ delay: 1.1, duration: 0.7, ease }}
                                    className="absolute left-1/2 top-1/2 w-[58%] max-w-[250px] -translate-x-1/2 -translate-y-1/2 bg-[#FBF7EE] p-2 shadow-[0_6px_16px_-8px_rgba(0,0,0,0.35)]"
                                >
                                    <div className="flex flex-col items-center gap-2 border border-[#A3324F]/40 px-4 py-6 text-center">
                                        <SmallCaps>Ex libris</SmallCaps>
                                        <Sakura className="h-5 w-5 text-[#C2577A]" />
                                        <p className="font-display text-[2.4rem] italic leading-none text-[#2A211B]">Antra</p>
                                        <p className="font-book text-[15px] italic leading-snug text-[#2A211B]/65">Software engineer &amp; data scientist</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* the back cover, closing at the end. Wide: the board and the last page on it swing over
                        the spine together, landing back cover up. Phones: it swings in over the page. */}
                    {backShut && (
                        <motion.div
                            className="absolute inset-0 z-[35] cursor-pointer select-none md:left-1/2"
                            style={{ transformStyle: 'preserve-3d', originX: 0, rotateY: wide ? backTurn : backIn }}
                            onClick={openBack}
                        >
                            {wide && (
                                <div aria-hidden className="book-cloth absolute inset-0 rounded-r-lg [backface-visibility:hidden]">
                                    <div className="absolute bottom-5 left-0 right-3.5 top-3.5">
                                        <Page face={right} side="right" />
                                    </div>
                                </div>
                            )}
                            <motion.button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openBack();
                                }}
                                aria-label="Open the book again, at the last page"
                                style={wide ? { rotateY: 180 } : { opacity: backFade }}
                                className="book-cloth absolute inset-0 cursor-pointer overflow-hidden rounded-l-lg rounded-r-sm outline-none [backface-visibility:hidden] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-transparent max-md:rounded-l-sm max-md:rounded-r-lg"
                            >
                                <span aria-hidden className="absolute inset-y-0 right-0 w-7 bg-gradient-to-l from-black/25 to-transparent max-md:left-0 max-md:right-auto max-md:bg-gradient-to-r" />
                                <span aria-hidden className="book-foil absolute inset-x-10 inset-y-8 border border-current opacity-40" />
                                <span className="book-foil absolute inset-0 flex flex-col items-center justify-center gap-4 px-14 text-center">
                                    <Sakura className="h-7 w-7 opacity-80" />
                                    <span className="font-display text-[clamp(2.8rem,5vw,4rem)] italic leading-none">Fin.</span>
                                    <span aria-hidden className="h-px w-14 bg-current opacity-50" />
                                    <span className="font-book text-lg italic opacity-85">Thank you for reading</span>
                                </span>
                                <span aria-hidden className="book-foil absolute inset-x-0 bottom-16 text-center font-book text-sm uppercase tracking-[0.45em] opacity-70">Antra · 2026</span>
                            </motion.button>
                        </motion.div>
                    )}

                    {/* the ribbon: laid in this page, or sticking out of the book where it was left */}
                    {ready && !turn && (
                        <>
                            {markView === view ? (
                                <button
                                    type="button"
                                    onClick={() => placeMark(null)}
                                    aria-label="Remove the bookmark"
                                    title="Remove the bookmark"
                                    className={`book-ribbon absolute top-0 z-[45] h-[calc(100%+40px)] w-4 cursor-pointer drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] ${ribbonX(false)}`}
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => placeMark(faceOf(view))}
                                    aria-label="Bookmark this page"
                                    className={`group absolute -top-3 z-[45] flex h-12 w-24 cursor-pointer items-start outline-none ${ribbonX(false)}`}
                                >
                                    <span aria-hidden className="book-ribbon block h-8 w-4 opacity-60 transition-[height,opacity] duration-300 group-hover:h-12 group-hover:opacity-100 group-focus-visible:h-12 group-focus-visible:opacity-100" />
                                    <span className="ml-2 mt-4 whitespace-nowrap font-book text-[13px] italic text-[#2A211B]/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Bookmark this page</span>
                                </button>
                            )}
                            {markView !== null && markView !== view && (
                                <button
                                    type="button"
                                    onClick={() => go(markView)}
                                    aria-label={`Go to the bookmark, at ${markName}`}
                                    title={`Bookmark: ${markName}`}
                                    className={`book-ribbon absolute top-[calc(100%-6px)] z-[45] h-12 w-4 cursor-pointer transition-[height] hover:h-14 ${ribbonX(wide && markView < view)}`}
                                />
                            )}
                        </>
                    )}
                    {!open && mark !== null && (
                        <button
                            type="button"
                            onClick={() => swing(1).then(() => go(viewOf(mark)))}
                            aria-label={`Open the book at the bookmark, at ${markName}`}
                            title={`Bookmark: ${markName}`}
                            className={`book-ribbon absolute top-[calc(100%-6px)] z-[45] h-12 w-4 cursor-pointer transition-[height] hover:h-14 ${ribbonX(false)}`}
                        />
                    )}
                </motion.div>
            </motion.div>

            {/* shut, it asks to be opened */}
            <AnimatePresence>
                {(!open || backShut) && (
                    <motion.p
                        key={backShut ? 'back' : 'front'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.8 } }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted"
                    >
                        <Sakura className="h-3 w-3 text-accent" /> {wide ? 'Click' : 'Tap'} the cover to {backShut ? 'open it again' : 'open'}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};
