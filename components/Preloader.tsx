'use client';

import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionTemplate, useMotionValue, useTransform, type MotionValue } from 'framer-motion';

// The site's opening: a pitch-black room with a paper lantern hanging in it. A
// hand reaches in, takes the bead on the lantern's pull cord and tugs it; the
// lantern flickers on, and the page opens out from it: the dark draws back in a
// widening circle with a band of the lantern's light along its edge. The tug waits for the fonts and the hero's 3D branch.
// The hand plays once a visit (later loads just light the lantern), there's a
// "Skip intro" button, and with reduced motion the lantern simply lights.

const SEEN = 'intro-seen';
const MAX_WAIT = 6000; // ms: a slow connection never holds the tug longer than this

// The scene's coordinates (an SVG 400 wide, 600 tall): where the cord's bead hangs
const BEAD_X = 200;
const BEAD_Y = 370;
const PULL = 46; // how far the tug draws the cord down
// The thumb's angle: open, and pinched against the forefinger
const OPEN = 12;
const PINCH = 24.6;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

// The hand, pointing left with its forefinger and thumb meeting at the origin,
// the wrist and a kimono sleeve trailing off to the right. Drawn as rounded strokes.
type Skin = { skin: string; edge: string; sleeve: string; cuff: string; flower: string };
const Finger = ({ x1, y1, x2, y2, w, s }: { x1: number; y1: number; x2: number; y2: number; w: number; s: Skin }) => (
    <>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={s.edge} strokeWidth={w + 2} strokeLinecap="round" />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={s.skin} strokeWidth={w} strokeLinecap="round" />
    </>
);

const HandShape = ({ s, thumbX, thumbY }: { s: Skin; thumbX: MotionValue<number>; thumbY: MotionValue<number> }) => (
    <g transform="translate(-6 1)">
        {/* the sleeve, long enough to run off the screen */}
        <path d="M120 -26 L760 -150 L760 240 L120 52 Z" fill={s.sleeve} />
        {[[230, 10], [330, 40], [420, -20], [520, 60]].map(([x, y]) => (
            <g key={x} transform={`translate(${x} ${y}) scale(0.9)`} fill={s.flower}>
                {[0, 72, 144, 216, 288].map((r) => (
                    <path key={r} d="M0 -1.5 C -3.6 -4 -4 -8.6 -1.4 -10.8 L 0 -9.4 L 1.4 -10.8 C 4 -8.6 3.6 -4 0 -1.5 Z" transform={`rotate(${r})`} />
                ))}
            </g>
        ))}
        <rect x="112" y="-28" width="14" height="82" rx="4" fill={s.cuff} />
        {/* wrist and palm */}
        <rect x="86" y="-11" width="32" height="40" rx="10" fill={s.skin} stroke={s.edge} strokeWidth="1" />
        <rect x="38" y="-16" width="56" height="48" rx="18" fill={s.skin} stroke={s.edge} strokeWidth="1" />
        {/* three fingers curled into the palm, then the forefinger reaching out */}
        <Finger x1={46} y1={4} x2={58} y2={4} w={12} s={s} />
        <Finger x1={49} y1={14} x2={60} y2={14} w={11} s={s} />
        <Finger x1={52} y1={23} x2={62} y2={23} w={10} s={s} />
        <Finger x1={6} y1={-7} x2={46} y2={-7} w={12} s={s} />
        {/* the thumb, swinging in to pinch */}
        <motion.line x1={52} y1={24} x2={thumbX} y2={thumbY} stroke={s.edge} strokeWidth={15} strokeLinecap="round" />
        <motion.line x1={52} y1={24} x2={thumbX} y2={thumbY} stroke={s.skin} strokeWidth={13} strokeLinecap="round" />
    </g>
);

const DIM_SKIN: Skin = { skin: '#5E4C44', edge: '#7D685D', sleeve: '#141B30', cuff: '#3E1E2A', flower: 'transparent' };
const LIT_SKIN: Skin = { skin: '#F2D6C6', edge: '#C9A08C', sleeve: '#2B3D6B', cuff: '#C2577A', flower: 'rgba(242, 174, 188, 0.45)' };
const DIM_PAPER: Paper = { body: '#2B1C22', rib: '#5A3A44', mark: '#4A2A36', cap: '#140D0A', tassel: '#3A1C26' };
const LIT_NIGHT: Paper = { body: 'url(#intro-lit)', rib: '#3E7E99', mark: '#E58FA7', cap: '#2B1D14', tassel: '#6FA9C2' };
const LIT_DAY: Paper = { body: 'url(#intro-lit)', rib: '#9E4A60', mark: '#C2577A', cap: '#2B1D14', tassel: '#E0566F' };

export const Preloader = ({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) => {
    // the lantern's light: powder blue by night, warm pink by day, as on the hero's
    const [night] = useState(() => document.documentElement.dataset.theme !== 'light');
    const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [seen] = useState(() => {
        try {
            return sessionStorage.getItem(SEEN) === '1';
        } catch {
            return false;
        }
    });
    const litPaper = night ? LIT_NIGHT : LIT_DAY;
    const tint = night ? '190, 230, 245' : '255, 208, 220'; // the lantern's light, as r, g, b

    const scene = useMotionValue(0); // the lantern, just visible in the dark
    const hx = useMotionValue(660); // the hand's pinch point, in scene units (starts off the screen)
    const hy = useMotionValue(980);
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
    const thumbX = useTransform(thumbAngle, (a) => 52 - 48 * Math.cos((a * Math.PI) / 180));
    const thumbY = useTransform(thumbAngle, (a) => 24 - 48 * Math.sin((a * Math.PI) / 180));
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
    const latest = useRef({ onReveal, onDone });
    useEffect(() => {
        latest.current = { onReveal, onDone };
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
        try {
            sessionStorage.setItem(SEEN, '1');
        } catch {
            // no storage: the hand just plays again next time
        }
        // far enough to clear the farthest corner, soft edge and all
        const far = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + FEATHER;
        const duration = quick ? 0.8 : 1.5;
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

        (async () => {
            if (reduceMotion) {
                scene.set(1);
                lit.set(1);
                await Promise.all([ready, sleep(500)]);
                if (!live()) return;
                latest.current.onReveal();
                await animate(fade, 0, { duration: 0.4 });
                if (live()) latest.current.onDone();
                return;
            }

            await animate(scene, 1, { duration: 0.9, delay: 0.3 });
            if (!live()) return;
            if (!seen) {
                // the hand reaches in from the lower right, then takes the bead
                await Promise.all([
                    animate(hx, 262, { duration: 1.15, ease: [0.2, 0.7, 0.3, 1] }),
                    animate(hy, 452, { duration: 1.15, ease: [0.2, 0.7, 0.3, 1] }),
                ]);
                if (!live()) return;
                await Promise.all([animate(hx, BEAD_X + 3, { duration: 0.38, ease: 'easeInOut' }), animate(hy, BEAD_Y + 1, { duration: 0.38, ease: 'easeInOut' })]);
                if (!live()) return;
                await animate(thumbAngle, PINCH, { duration: 0.18 });
            }
            await ready;
            if (!live()) return;

            // the tug
            if (!seen) {
                await Promise.all([animate(pull, PULL, { duration: 0.26, ease: 'easeIn' }), animate(grip, PULL, { duration: 0.26, ease: 'easeIn' })]);
                if (!live()) return;
            } else await sleep(250);

            // click: the lantern flickers on, the hand lets go and draws back
            animate(lit, [0, 1, 0.2, 1, 0.55, 1], { duration: 0.6, times: [0, 0.1, 0.22, 0.42, 0.58, 1] });
            if (!seen) {
                animate(pull, 0, { type: 'spring', stiffness: 320, damping: 11 });
                animate(thumbAngle, OPEN, { duration: 0.15 });
                animate(hx, 700, { duration: 0.9, delay: 0.15, ease: [0.5, 0, 0.75, 0] });
                animate(hy, 1000, { duration: 0.9, delay: 0.15, ease: [0.5, 0, 0.75, 0] });
            }
            await sleep(seen ? 380 : 520); // (the flicker settling)
            if (live()) await floodRef.current(id, false);
        })();

        return () => {
            mounted = false;
        };
    }, [reduceMotion, seen, scene, hx, hy, grip, thumbAngle, pull, lit, fade]);

    // Skip intro: the lantern comes on at once and the page opens out quickly
    const skip = () => {
        const id = ++run.current;
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
            <motion.div aria-hidden className="absolute inset-0 bg-black" style={{ maskImage: hole, WebkitMaskImage: hole }} />
            {/* the lantern's light along the opening's edge */}
            <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: band, opacity: bandOpacity }} />

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
                    <g transform="rotate(30)">
                        <HandShape s={DIM_SKIN} thumbX={thumbX} thumbY={thumbY} />
                        <motion.g style={{ opacity: lit }}>
                            <HandShape s={LIT_SKIN} thumbX={thumbX} thumbY={thumbY} />
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
