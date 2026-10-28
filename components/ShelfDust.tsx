'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

// Petals drift down onto the toolkit's shelves while you're looking at them and
// pile up along the planks. A cotton tenugui hangs on a peg above: pick it up
// and rub it over the shelves to brush them off (or press Enter on it to dust
// every shelf at once). Shelves register a layer each; the cloth finds the
// petals it passes over by their place on the screen.

type Petal = {
    id: number;
    shelf: number;
    x: number; // where along the plank it lands, %
    rot: number;
    size: number;
    tint: number;
    sway: number; // how far it drifts side to side on the way down, px
    lift: number; // px above the plank's top edge (negative: lying on its face, seen from a little above)
    gone?: number; // brushed off: which way and how far it flies, px
};

const TINTS = ['#F2AEBC', '#E58FA7', '#F7B8CA', '#D9708D']; // deep enough to read on the pale wood
const PER_SHELF = 22;
const EVERY = 850; // ms between petals, across all shelves
const REACH = 38; // px: how close the cloth's centre must pass to catch a petal

type Dust = {
    petals: Petal[];
    register: (id: number, el: HTMLElement | null) => void;
    remove: (id: number) => void;
    reduce: boolean;
};
const DustContext = createContext<Dust | null>(null);

let nextId = 1;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export const ShelfDust = ({ shelves, children }: { shelves: number; children: React.ReactNode }) => {
    const reduce = !!useReducedMotion();
    const wrap = useRef<HTMLDivElement>(null);
    const inView = useInView(wrap, { amount: 0.15 });
    const [petals, setPetals] = useState<Petal[]>([]);
    const [held, setHeld] = useState(false);
    const els = useRef(new Map<number, HTMLElement>());

    // Petals fall while the shelves are on screen, until each plank is full
    useEffect(() => {
        if (!inView) return;
        const id = setInterval(() => {
            setPetals((ps) => {
                const counts = new Array(shelves).fill(0);
                for (const p of ps) if (p.gone === undefined) counts[p.shelf]++;
                const open = counts.map((n, i) => (n < PER_SHELF ? i : -1)).filter((i) => i >= 0);
                if (!open.length) return ps;
                const shelf = open[Math.floor(Math.random() * open.length)];
                return [...ps, { id: nextId++, shelf, x: rnd(3, 97), rot: rnd(-80, 80), size: rnd(0.85, 1.25), tint: Math.floor(Math.random() * TINTS.length), sway: rnd(14, 34) * (Math.random() < 0.5 ? -1 : 1), lift: rnd(-7, 1) }];
            });
        }, EVERY);
        return () => clearInterval(id);
    }, [inView, shelves]);

    const register = (id: number, el: HTMLElement | null) => {
        if (el) els.current.set(id, el);
        else els.current.delete(id);
    };
    const remove = (id: number) => setPetals((ps) => ps.filter((p) => p.id !== id));

    // Brush off every resting petal within reach of a point, flung the way the cloth is moving
    const brush = (x: number, y: number, dx: number) => {
        const hit = new Map<number, number>();
        for (const [id, el] of els.current) {
            const r = el.getBoundingClientRect();
            if (Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y) < REACH) {
                hit.set(id, (dx >= 0 ? 1 : -1) * rnd(70, 150));
            }
        }
        if (!hit.size) return;
        setPetals((ps) => ps.map((p) => (hit.has(p.id) && p.gone === undefined ? { ...p, gone: hit.get(p.id) } : p)));
    };

    // Enter on the cloth: a sweep along every shelf, left to right
    const dustAll = () => setPetals((ps) => ps.map((p) => (p.gone === undefined ? { ...p, gone: rnd(80, 160) } : p)));

    const resting = petals.filter((p) => p.gone === undefined).length;

    return (
        <DustContext.Provider value={{ petals, register, remove, reduce }}>
            <div ref={wrap} className={`relative ${held ? '[&_.dust-row]:touch-none' : ''}`}>
                <ClothPeg held={held} resting={resting} onTake={() => setHeld(true)} onHangBack={() => setHeld(false)} onDustAll={dustAll} />
                {children}
            </div>
            {held && <HeldCloth area={wrap} onBrush={brush} onPutDown={() => setHeld(false)} inView={inView} />}
        </DustContext.Provider>
    );
};

// One shelf's petals, laid along the top of its plank. Put it inside the row the books stand in.
export const ShelfPetals = ({ shelf }: { shelf: number }) => {
    const dust = useContext(DustContext);
    if (!dust) return null;
    const { petals, register, remove, reduce } = dust;
    return (
        <div aria-hidden className="pointer-events-none absolute inset-x-2 bottom-0 z-10 h-0">
            {petals.filter((p) => p.shelf === shelf).map((p) => (
                <motion.span
                    key={p.id}
                    ref={(el) => register(p.id, p.gone === undefined ? el : null)}
                    className="absolute bottom-0 block h-[13px] w-4 -translate-x-1/2"
                    style={{ left: `${p.x}%`, marginBottom: p.lift, color: TINTS[p.tint], scale: p.size }}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: -190, x: -p.sway, rotate: p.rot - 140, scaleY: 1 }}
                    animate={
                        p.gone !== undefined
                            ? reduce
                                ? { opacity: 0, transition: { duration: 0.3 } }
                                : {
                                      x: [0, p.gone * 0.6, p.gone],
                                      y: [0, -26, 40],
                                      rotate: p.rot + (p.gone > 0 ? 200 : -200),
                                      scaleY: 1,
                                      opacity: [1, 1, 0],
                                      transition: { duration: 0.75, ease: [0.25, 0.6, 0.4, 1], times: [0, 0.4, 1] },
                                  }
                            : reduce
                              ? { opacity: 1, transition: { duration: 0.6 } }
                              : {
                                    opacity: [0, 1, 1],
                                    y: [-190, -120, -50, 0],
                                    x: [-p.sway, p.sway, -p.sway * 0.4, 0],
                                    rotate: p.rot,
                                    scaleY: [1, 1, 0.9, 0.7], // settles flat on the plank
                                    transition: {
                                        duration: 3.4,
                                        opacity: { duration: 3.4, times: [0, 0.15, 1] },
                                        y: { duration: 3.4, ease: 'linear', times: [0, 0.33, 0.7, 1] },
                                        x: { duration: 3.4, ease: 'easeInOut', times: [0, 0.4, 0.75, 1] },
                                        rotate: { duration: 3.4, ease: [0.3, 0, 0.3, 1] },
                                        scaleY: { duration: 3.4, times: [0, 0.6, 0.9, 1] },
                                    },
                                }
                    }
                    onAnimationComplete={() => p.gone !== undefined && remove(p.id)}
                >
                    <svg viewBox="0 0 10 9" className="block h-full w-full drop-shadow-[0_1px_1px_rgba(90,30,50,0.35)]" fill="currentColor">
                        <path d="M5 0 C8.2 1.2 10 4.4 9.2 7.2 C8 8.8 6 8.6 5 7.4 C4 8.6 2 8.8 0.8 7.2 C0 4.4 1.8 1.2 5 0 Z" />
                    </svg>
                </motion.span>
            ))}
        </div>
    );
};

// The tenugui: indigo cotton printed with blossoms, folded over itself
const Cloth = ({ className = '' }: { className?: string }) => (
    <svg viewBox="0 0 48 62" aria-hidden className={className}>
        <path d="M4 4 h40 v50 c-6 3 -12 -2 -20 2 c-8 4 -14 -1 -20 2 z" fill="#2B3D6B" />
        <path d="M4 4 h40 v9 h-40 z" fill="#22325A" />
        {[[14, 24], [32, 30], [20, 42], [36, 48], [10, 50]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${i % 2 ? 0.5 : 0.62})`} fill="#F7C9D4" opacity="0.85">
                {[0, 72, 144, 216, 288].map((r) => (
                    <path key={r} d="M0 -1.5 C -3.6 -4 -4 -8.6 -1.4 -10.8 L 0 -9.4 L 1.4 -10.8 C 4 -8.6 3.6 -4 0 -1.5 Z" transform={`rotate(${r})`} />
                ))}
            </g>
        ))}
        <path d="M4 13 h40" stroke="#F7C9D4" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
);

// The peg above the shelves, with the cloth on it (or empty while you hold it)
const ClothPeg = ({ held, resting, onTake, onHangBack, onDustAll }: { held: boolean; resting: number; onTake: () => void; onHangBack: () => void; onDustAll: () => void }) => (
    <div className="mb-10 flex items-start justify-end gap-4 sm:-mt-6">
        <p className="mt-5 max-w-[15rem] text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-muted">
            <span className="tabular-nums text-fg">{resting}</span> {resting === 1 ? 'petal' : 'petals'} on the shelves
            <br />
            {held ? (
                <button type="button" onClick={onHangBack} className="cursor-pointer text-accent underline-offset-4 hover:underline">
                    rub the shelves · hang it back
                </button>
            ) : (
                <span className="text-muted/80">take the cloth to dust them</span>
            )}
        </p>
        <div className="relative flex w-14 flex-col items-center">
            <span aria-hidden className="h-3 w-3 rounded-full bg-[#C9A27A] shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
            <AnimatePresence initial={false}>
                {!held && (
                    <motion.button
                        type="button"
                        aria-label={`Dust the shelves: ${resting} petals have settled. Click to pick up the cloth and rub the shelves, or press Enter to dust them all`}
                        onClick={(e) => (e.detail === 0 ? onDustAll() : onTake())}
                        className="-mt-1.5 origin-top cursor-grab rounded-sm outline-offset-4"
                        initial={{ opacity: 0, y: -8, rotate: -6 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                        whileHover={{ rotate: [0, 4, -3, 1.5, 0], transition: { duration: 1.1, ease: 'easeInOut' } }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                    >
                        <Cloth className="block h-[62px] w-12 drop-shadow-[0_4px_5px_rgba(0,0,0,0.35)]" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    </div>
);

// The cloth in your hand: it follows the pointer (a touch eased, like fabric),
// tilts with the rubbing, and brushes off whatever petals it passes over
const HeldCloth = ({ area, onBrush, onPutDown, inView }: { area: React.RefObject<HTMLElement | null>; onBrush: (x: number, y: number, dx: number) => void; onPutDown: () => void; inView: boolean }) => {
    const x = useMotionValue(-200);
    const y = useMotionValue(-200);
    const vx = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 900, damping: 50, mass: 0.4 });
    const sy = useSpring(y, { stiffness: 900, damping: 50, mass: 0.4 });
    const tilt = useSpring(useTransform(vx, [-40, 40], [-18, 18], { clamp: true }), { stiffness: 300, damping: 20 });
    const latest = useRef({ onBrush, onPutDown });
    useEffect(() => {
        latest.current = { onBrush, onPutDown };
    });

    // scrolled away from the shelves: it goes back on its peg
    useEffect(() => {
        if (!inView) latest.current.onPutDown();
    }, [inView]);

    useEffect(() => {
        let last: number | null = null; // the previous x (touch reports no movementX)
        const move = (e: PointerEvent) => {
            if (last === null) {
                x.jump(e.clientX);
                y.jump(e.clientY);
            }
            const dx = last === null ? 0 : e.clientX - last;
            last = e.clientX;
            x.set(e.clientX);
            y.set(e.clientY);
            vx.set(dx);
            latest.current.onBrush(e.clientX, e.clientY, dx);
        };
        // a touch starts a fresh stroke where the finger lands
        const down = (e: PointerEvent) => {
            if (!area.current?.contains(e.target as Node)) latest.current.onPutDown(); // a click away from the shelves hangs it back
            else if (e.pointerType !== 'mouse') {
                last = null;
                move(e);
            }
        };
        const still = setInterval(() => vx.set(0), 120);
        const key = (e: KeyboardEvent) => e.key === 'Escape' && latest.current.onPutDown();
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerdown', down);
        window.addEventListener('keydown', key);
        document.documentElement.classList.add('cloth-held');
        return () => {
            clearInterval(still);
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerdown', down);
            window.removeEventListener('keydown', key);
            document.documentElement.classList.remove('cloth-held');
        };
    }, [x, y, vx, area]);

    return createPortal(
        <motion.div
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-[120] -ml-6 -mt-8"
            style={{ x: sx, y: sy, rotate: tilt }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <Cloth className="block h-[62px] w-12 drop-shadow-[0_8px_10px_rgba(0,0,0,0.4)]" />
        </motion.div>,
        document.body,
    );
};
