'use client';

import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionTemplate, useMotionValue, useTransform, type MotionValue } from 'framer-motion';

// The site's opening: a pitch-black room with a paper lantern hanging in it. A
// hand reaches in, takes the bead on the lantern's pull cord and tugs it; the
// lantern flickers on, and the page opens out from it: the dark draws back in a
// widening circle with a band of the lantern's light along its edge. The tug waits for the fonts and the hero's 3D branch.
// The hero mounts first, hidden under the dark, so its 3D sets up before anything moves.
// It plays on every load; there's a "Skip intro" button, and with reduced
// motion the lantern simply lights.

const MAX_WAIT = 6000; // ms: a slow connection never holds the tug longer than this

// The scene's coordinates (an SVG 400 wide, 600 tall): where the cord's bead hangs
const BEAD_X = 200;
const BEAD_Y = 370;
const PULL = 46; // how far the tug draws the cord down
// How far the thumb is swung away from the forefinger: open, and pinched on the bead
const OPEN = 28;
const PINCH = 0;

const STAGE_WAIT = 1800; // ms: how long the dark waits for the branch's code before mounting the hero anyway

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const frames = (n: number) => new Promise<void>((r) => {
    const tick = () => (--n <= 0 ? r() : requestAnimationFrame(tick));
    requestAnimationFrame(tick);
});

// The hand's way in: one sweep along a curve from off the lower right, easing
// onto the bead, rather than two moves with a stop between
const START = [660, 980];
const VIA = [300, 560]; // the curve's control point: it swings up from below the bead
const along = (t: number, a: number, b: number, c: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;

// The lantern's paper, ribs and caps, drawn in the hero lantern's own coordinates (64 × 104)
type Paper = { body: string; rib: string; mark: string; cap: string; tassel: string };
const LanternShape = ({ paper, bodyRef }: { paper: Paper; bodyRef?: React.Ref<SVGEllipseElement> }) => (
    <g transform="translate(129.6 100) scale(2.2)">
        <rect x="21" y="6" width="22" height="7" rx="2" fill={paper.cap} />
        <ellipse ref={bodyRef} cx="32" cy="48" rx="27" ry="36" fill={paper.body} />
        <g stroke={paper.rib} strokeWidth="0.9" fill="none" opacity="0.4">
            {[[20, 18], [27, 24], [34, 26.5], [41, 26.5], [48, 26.5], [55, 26.5], [62, 26.5], [69, 24], [76, 18]].map(([y, rx]) => (
                <path key={y} d={`M${32 - rx} ${y} Q32 ${y + 3.2} ${32 + rx} ${y}`} />
            ))}
        </g>
        <g transform="translate(32 48) scale(1.25)" fill={paper.mark}>
            {[0, 72, 144, 216, 288].map((r) => (
                <path key={r} d="M0 -1.5 C -3.6 -4 -4 -8.6 -1.4 -10.8 L 0 -9.4 L 1.4 -10.8 C 4 -8.6 3.6 -4 0 -1.5 Z" transform={`rotate(${r})`} />
            ))}
        </g>
        <rect x="21" y="83" width="22" height="7" rx="2" fill={paper.cap} />
    </g>
);

// The hand, seen from the forefinger's side and pointing up, the pinch point
// (where the thumb's pad meets the forefinger's) at the origin. The forefinger
// curls over, the other three fingers are tucked behind it, and the thumb swings
// in from the heel of the palm. The wrist runs down into a kimono sleeve.
type Skin = { skin: string; edge: string; shade: string; sleeve: string; cuff: string; flower: string };

// The thumb's outline, swung `open` degrees away from the forefinger about its root
const THUMB_ROOT = [18, 60];
const THUMB = [[[26, 60]], [[28, 30], [19, 9], [10, 0]], [[6, -5], [-3, -3], [-1, 5]], [[1, 14], [7, 32], [10, 60]]];
const thumbPath = (open: number) => {
    const r = (open * Math.PI) / 180;
    const [cx, cy] = THUMB_ROOT;
    const pt = ([x, y]: number[]) => {
        const dx = x - cx;
        const dy = y - cy;
        return `${(cx + dx * Math.cos(r) - dy * Math.sin(r)).toFixed(1)} ${(cy + dx * Math.sin(r) + dy * Math.cos(r)).toFixed(1)}`;
    };
    const [[start], ...curves] = THUMB;
    return `M${pt(start)} ${curves.map((c) => `C${c.map(pt).join(' ')}`).join(' ')} Z`;
};

const HandShape = ({ s, thumb }: { s: Skin; thumb: MotionValue<string> }) => (
    <g stroke={s.edge} strokeWidth="1.4" strokeLinejoin="round">
        {/* the sleeve, long enough to run off the screen, and its cuff */}
        <path d="M-34 104 L44 104 L150 560 L-190 560 Z" fill={s.sleeve} stroke="none" />
        {[[-10, 190], [50, 260], [-60, 330], [20, 410]].map(([x, y]) => (
            <g key={y} transform={`translate(${x} ${y}) scale(1.1)`} fill={s.flower} stroke="none">
                {[0, 72, 144, 216, 288].map((a) => (
                    <path key={a} d="M0 -1.5 C -3.6 -4 -4 -8.6 -1.4 -10.8 L 0 -9.4 L 1.4 -10.8 C 4 -8.6 3.6 -4 0 -1.5 Z" transform={`rotate(${a})`} />
                ))}
            </g>
        ))}
        <rect x="-36" y="98" width="82" height="14" rx="4" fill={s.cuff} stroke="none" />
        {/* the middle, ring and little fingers, curled behind */}
        <path d="M-10 30 C-26 26 -34 8 -26 -6 C-20 -14 -10 -10 -8 0 C-6 10 -4 22 -10 30 Z" fill={s.shade} />
        <path d="M-12 46 C-30 42 -36 24 -28 12 C-22 4 -12 8 -10 18 C-8 28 -6 40 -12 46 Z" fill={s.shade} />
        <path d="M-12 62 C-28 60 -32 44 -26 34 C-20 26 -12 30 -10 38 C-8 48 -6 58 -12 62 Z" fill={s.shade} />
        {/* the thumb (its root hides behind the palm) */}
        <motion.path d={thumb} fill={s.skin} />
        {/* palm and wrist */}
        <path d="M-22 104 C-24 84 -22 62 -16 44 C-12 30 -6 22 4 22 C18 22 30 36 30 58 C30 76 30 92 34 104 Z" fill={s.skin} />
        {/* the forefinger, curling over to meet the thumb, with its knuckle creases */}
        <path d="M-14 30 C-22 10 -18 -12 -10 -22 C-6 -27 2 -26 3 -19 C4 -12 0 -8 -3 -3 C-6 4 -4 16 2 26 Z" fill={s.skin} />
        <path d="M-9 -20 C-6 -23 -1 -23 1 -19" fill="none" strokeWidth="1" opacity="0.6" />
        <path d="M-15 6 C-12 4 -8 4 -6 6" fill="none" strokeWidth="1" opacity="0.5" />
    </g>
);

const DIM_SKIN: Skin = { skin: '#5E4C44', edge: '#7D685D', shade: '#4E3F38', sleeve: '#141B30', cuff: '#3E1E2A', flower: 'transparent' };
const LIT_SKIN: Skin = { skin: '#F2D6C6', edge: '#B98A74', shade: '#E2BBA6', sleeve: '#2B3D6B', cuff: '#C2577A', flower: 'rgba(242, 174, 188, 0.45)' };
const DIM_PAPER: Paper = { body: '#2B1C22', rib: '#5A3A44', mark: '#4A2A36', cap: '#140D0A', tassel: '#3A1C26' };
const LIT_NIGHT: Paper = { body: 'url(#intro-lit)', rib: '#3E7E99', mark: '#E58FA7', cap: '#2B1D14', tassel: '#6FA9C2' };
const LIT_DAY: Paper = { body: 'url(#intro-lit)', rib: '#9E4A60', mark: '#C2577A', cap: '#2B1D14', tassel: '#E0566F' };

export const Preloader = ({ onStage, onReveal, onDone }: { onStage: () => void; onReveal: () => void; onDone: () => void }) => {
    // the lantern's light: powder blue by night, warm pink by day, as on the hero's
    const [night] = useState(() => document.documentElement.dataset.theme !== 'light');
    const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const litPaper = night ? LIT_NIGHT : LIT_DAY;
    const tint = night ? '190, 230, 245' : '255, 208, 220'; // the lantern's light, as r, g, b

    const scene = useMotionValue(0); // the lantern, just visible in the dark
    const hx = useMotionValue(START[0]); // the hand's pinch point, in scene units (starts off the screen)
    const hy = useMotionValue(START[1]);
    const grip = useMotionValue(0); // how far the hand has drawn down with the cord
    const thumbAngle = useMotionValue(OPEN);
    const pull = useMotionValue(0); // how far the cord is drawn down
    const lit = useMotionValue(0);
    const reach = useMotionValue(-400); // how far the page has opened out from the lantern, px (shut: fully dark)
    const fade = useMotionValue(1); // the whole preloader (reduced motion fades it rather than opening it)
    const opening = useMotionValue(0); // 0 → 1 as the page opens: the lantern and the hand fade with it
    const cx = useMotionValue(0); // the lantern's centre on the screen, px
    const cy = useMotionValue(0);

    const handY = useTransform(() => hy.get() + grip.get());
    const thumb = useTransform(thumbAngle, thumbPath);
    const cordEnd = useTransform(pull, (p) => BEAD_Y - 8 + p);
    const bob = useTransform(pull, (p) => p * 0.14); // the lantern dips as the cord is drawn
    // The dark, with a hole the page shows through: soft-edged over FEATHER px
    const FEATHER = 110;
    const edge = useTransform(reach, (r) => r + FEATHER);
    const hole = useMotionTemplate`radial-gradient(circle at ${cx}px ${cy}px, transparent ${reach}px, #000 ${edge}px)`;
    // ...and the lantern's light riding that edge: brightest just inside it, gone a little way in and out
    const bandIn = useTransform(reach, (r) => Math.max(0, r - 160));
    const bandMid = useTransform(reach, (r) => r + FEATHER * 0.3);
    const band = useMotionTemplate`radial-gradient(circle at ${cx}px ${cy}px, rgba(${tint}, 0) ${bandIn}px, rgba(${tint}, 0.42) ${bandMid}px, rgba(${tint}, 0) ${edge}px)`;
    const sceneOpacity = useTransform(() => scene.get() * (1 - opening.get()));
    const bandOpacity = useTransform(opening, [0, 0.08, 0.75, 1], [0, 1, 1, 0]);
    const skipOpacity = useTransform(opening, [0, 0.2], [1, 0]);

    const body = useRef<SVGEllipseElement>(null);
    const run = useRef(0); // bumped to abandon a running sequence
    const latest = useRef({ onStage, onReveal, onDone });
    useEffect(() => {
        latest.current = { onStage, onReveal, onDone };
    });

    // nothing scrolls underneath while it's up
    useEffect(() => {
        const root = document.documentElement;
        const overflow = root.style.overflow;
        root.style.overflow = 'hidden';
        return () => {
            root.style.overflow = overflow;
        };
    }, []);

    // the page opens out from the lantern, the light at its edge, until the dark is gone
    const floodOut = async (id: number, quick: boolean) => {
        const r = body.current?.getBoundingClientRect();
        const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
        const y = r ? r.top + r.height / 2 : window.innerHeight / 2;
        cx.set(x);
        cy.set(y);
        // far enough to clear the farthest corner, soft edge and all
        const far = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + FEATHER;
        const duration = quick ? 0.8 : 1.6;
        reach.set(-FEATHER);
        latest.current.onReveal(); // the hero plays its entrance as it's uncovered
        animate(opening, 1, { duration, ease: 'linear' });
        await animate(reach, far, { duration, ease: [0.55, 0.05, 0.3, 1] });
        if (run.current === id && body.current) latest.current.onDone();
    };
    const floodRef = useRef(floodOut);
    useEffect(() => {
        floodRef.current = floodOut;
    });

    useEffect(() => {
        const id = ++run.current;
        let mounted = true;
        const live = () => mounted && run.current === id; // (a skip takes over by bumping run)
        const ready = Promise.race([Promise.all([document.fonts?.ready, import('./BlossomBranch').catch(() => null)]), sleep(MAX_WAIT)]);
        // Mount the hero under the dark once the branch's code is in, and give its
        // 3D a few frames to set up, so nothing stalls once things start moving
        const staged = Promise.race([ready, sleep(STAGE_WAIT)]).then(async () => {
            if (!live()) return;
            latest.current.onStage();
            await frames(4);
            await sleep(120);
        });

        (async () => {
            if (reduceMotion) {
                scene.set(1);
                lit.set(1);
                await Promise.all([ready, staged, sleep(500)]);
                if (!live()) return;
                latest.current.onReveal();
                await animate(fade, 0, { duration: 0.4 });
                if (live()) latest.current.onDone();
                return;
            }

            await Promise.all([staged, sleep(300)]);
            if (!live()) return;
            await animate(scene, 1, { duration: 0.9, ease: [0.4, 0, 0.2, 1] });
            if (!live()) return;
            {
                // the hand sweeps in from the lower right onto the bead, the thumb
                // closing as it arrives
                const REACH = 1.55;
                animate(thumbAngle, PINCH, { duration: 0.32, delay: REACH - 0.2, ease: [0.4, 0, 0.2, 1] });
                await animate(0, 1, {
                    duration: REACH,
                    ease: [0.3, 0.55, 0.25, 1],
                    onUpdate: (t) => {
                        hx.set(along(t, START[0], VIA[0], BEAD_X));
                        hy.set(along(t, START[1], VIA[1], BEAD_Y));
                    },
                });
                if (!live()) return;
                await sleep(140); // a beat to take hold
            }
            await ready;
            if (!live()) return;

            // the tug: a short draw down that eases in, as a wrist would
            await Promise.all([
                animate(pull, PULL, { duration: 0.3, ease: [0.5, 0, 0.75, 0.4] }),
                animate(grip, PULL, { duration: 0.3, ease: [0.5, 0, 0.75, 0.4] }),
            ]);
            if (!live()) return;

            // click: the lantern flickers on, the hand lets go and draws back
            animate(lit, [0, 1, 0.2, 1, 0.55, 1], { duration: 0.6, times: [0, 0.1, 0.22, 0.42, 0.58, 1] });
            {
                animate(pull, 0, { type: 'spring', stiffness: 260, damping: 12, mass: 0.9 });
                animate(thumbAngle, OPEN, { duration: 0.22, ease: [0, 0, 0.2, 1] });
                animate(grip, PULL * 0.6, { duration: 0.2, ease: 'easeOut' }); // the hand eases up a touch as it lets go
                animate(hx, 700, { duration: 1, delay: 0.18, ease: [0.45, 0, 0.7, 0.2] });
                animate(hy, 1000, { duration: 1, delay: 0.18, ease: [0.45, 0, 0.7, 0.2] });
            }
            await sleep(520); // (the flicker settling)
            if (live()) await floodRef.current(id, false);
        })();

        return () => {
            mounted = false;
        };
    }, [reduceMotion, scene, hx, hy, grip, thumbAngle, pull, lit, fade]);

    // Skip intro: the lantern comes on at once and the page opens out quickly
    const skip = () => {
        const id = ++run.current;
        latest.current.onStage();
        scene.set(1);
        lit.set(1);
        animate(hx, 700, { duration: 0.4 });
        animate(hy, 1000, { duration: 0.4 });
        animate(pull, 0, { duration: 0.2 });
        floodOut(id, true);
    };

    return (
        <motion.div role="status" aria-live="polite" aria-label="Loading Antra’s portfolio" style={{ opacity: fade }} className="fixed inset-0 z-[200] overflow-hidden">
            {/* the dark, opening out from the lantern onto the page */}
            <motion.div aria-hidden className="absolute inset-0 bg-black [contain:strict]" style={{ maskImage: hole, WebkitMaskImage: hole }} />
            {/* the lantern's light along the opening's edge */}
            <motion.div aria-hidden className="pointer-events-none absolute inset-0 [contain:strict]" style={{ background: band, opacity: bandOpacity }} />

            <motion.svg
                aria-hidden
                viewBox="0 0 400 600"
                style={{ opacity: sceneOpacity }}
                className="absolute left-1/2 top-1/2 h-[min(84svh,660px)] w-auto -translate-x-1/2 -translate-y-1/2 overflow-visible"
            >
                <defs>
                    <radialGradient id="intro-lit" cx="50%" cy="48%" r="60%">
                        <stop offset="0%" stopColor={night ? '#F4FCFF' : '#FFF8F4'} />
                        <stop offset="45%" stopColor={night ? '#BFE3EC' : '#FBD3DC'} />
                        <stop offset="100%" stopColor={night ? '#86BDD3' : '#EBA2B4'} />
                    </radialGradient>
                    <radialGradient id="intro-halo">
                        <stop offset="0%" stopColor={night ? 'rgba(200,235,248,0.55)' : 'rgba(255,214,222,0.6)'} />
                        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                    </radialGradient>
                </defs>

                {/* the lantern on its hanging cord */}
                <motion.g style={{ y: bob }}>
                    <line x1="200" y1="-700" x2="200" y2="114" stroke="#3A2C26" strokeWidth="2" />
                    <motion.circle cx="200" cy="205" r="230" fill="url(#intro-halo)" style={{ opacity: lit }} />
                    <LanternShape paper={DIM_PAPER} />
                    <motion.g style={{ opacity: lit }}>
                        <LanternShape paper={litPaper} bodyRef={body} />
                    </motion.g>
                </motion.g>
                {/* the pull cord and its bead */}
                <motion.line x1={BEAD_X} y1={298} x2={BEAD_X} y2={cordEnd} stroke="#5A463C" strokeWidth="1.6" />
                <motion.g style={{ y: pull }}>
                    <rect x={BEAD_X - 5} y={BEAD_Y - 9} width="10" height="18" rx="5" fill={DIM_PAPER.tassel} />
                    <motion.rect x={BEAD_X - 5} y={BEAD_Y - 9} width="10" height="18" rx="5" fill={litPaper.tassel} style={{ opacity: lit }} />
                </motion.g>

                {/* the hand */}
                <motion.g style={{ x: hx, y: handY }}>
                    <g transform="rotate(-32) scale(1.35)">
                        <HandShape s={DIM_SKIN} thumb={thumb} />
                        <motion.g style={{ opacity: lit }}>
                            <HandShape s={LIT_SKIN} thumb={thumb} />
                        </motion.g>
                    </g>
                </motion.g>
            </motion.svg>

            <motion.button
                type="button"
                onClick={skip}
                style={{ opacity: skipOpacity }}
                className="absolute bottom-5 right-5 min-h-11 cursor-pointer px-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/40 transition-colors hover:text-white/80 focus-visible:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/50"
            >
                Skip intro
            </motion.button>
        </motion.div>
    );
};
