'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import Sakura from './Sakura';

// Stickers for the About desk: a sheet to pick from, and the stickers on the
// desk, which can be dragged around and peeled off. Every design gets a white
// die-cut edge and a soft shadow from the same filter.

export const STICKER_EDGE =
    'drop-shadow(2.5px 0 0 #fff) drop-shadow(-2.5px 0 0 #fff) drop-shadow(0 2.5px 0 #fff) drop-shadow(0 -2.5px 0 #fff) drop-shadow(0 6px 6px rgba(0,0,0,0.3))';

export type StickerKind = 'sakura' | 'hello' | 'star' | 'heart' | 'code' | 'coffee' | 'ship' | 'lgtm';

// w: each design's width in px, used to shrink it to an even size on the sheet
export const STICKERS: Record<StickerKind, { label: string; w: number; art: React.ReactNode }> = {
    sakura: { label: 'Sakura', w: 64, art: <Sakura className="h-16 w-16 text-[#F27DA2]" /> },
    hello: {
        label: 'Hello', w: 96,
        art: <span className="grid h-14 w-24 place-items-center rounded-[45%_45%_45%_10%] bg-pink font-display text-3xl italic text-ink">hello!</span>,
    },
    star: {
        label: 'Star', w: 64,
        art: (
            <svg viewBox="0 0 24 24" className="h-16 w-16">
                <path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z" fill="#FFD66B" />
            </svg>
        ),
    },
    heart: {
        label: 'Heart', w: 56,
        art: (
            <svg viewBox="0 0 24 24" className="h-14 w-14">
                <path d="M12 21s-7.5-4.6-9.6-9.4C.9 8 3 4 6.8 4c2.2 0 3.7 1.2 5.2 3 1.5-1.8 3-3 5.2-3C21 4 23.1 8 21.6 11.6 19.5 16.4 12 21 12 21z" fill="#F27DA2" />
            </svg>
        ),
    },
    code: {
        label: 'Code', w: 64,
        art: <span className="grid h-12 w-16 place-items-center rounded-xl bg-ink font-mono text-lg font-bold text-pink">&lt;/&gt;</span>,
    },
    coffee: {
        label: 'Coffee', w: 64,
        art: (
            <svg viewBox="0 0 32 32" className="h-16 w-16">
                <path d="M11 3c-1.5 2 1.5 3 0 5M16 2c-1.5 2 1.5 3 0 5M21 3c-1.5 2 1.5 3 0 5" stroke="#C9B8A6" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <path d="M23 14h2.5a3.5 3.5 0 010 7H22" stroke="#8A5A1E" strokeWidth="2.2" fill="none" />
                <path d="M6 11h18v9a8 8 0 01-8 8h-2a8 8 0 01-8-8z" fill="#FFF6E5" />
                <path d="M6 11h18v3H6z" fill="#8A5A1E" />
                <circle cx="15" cy="21" r="2.4" fill="#F27DA2" />
            </svg>
        ),
    },
    ship: {
        label: 'Ship it', w: 80,
        art: (
            <span className="grid h-20 w-20 place-items-center rounded-full bg-[#BDE7D2] text-center text-[#1F5C45]">
                <span className="font-mono text-[11px] font-bold uppercase leading-tight tracking-[0.12em]">ship<br />it ↗</span>
            </span>
        ),
    },
    lgtm: {
        label: 'LGTM', w: 80,
        art: <span className="grid h-11 w-20 place-items-center rounded-md bg-[#D6EAF6] font-mono text-sm font-bold tracking-[0.12em] text-[#2F6FA8]">LGTM ✓</span>,
    },
};

export const KINDS = Object.keys(STICKERS) as StickerKind[];

// A sticker as it is stored: its design, where its centre sits on the desk
// (as fractions of the desk's width and height), and its tilt
export type PlacedSticker = { id: string; kind: StickerKind; x: number; y: number; r: number };

type DeskStickerProps = {
    sticker: PlacedSticker;
    desk: React.RefObject<HTMLDivElement | null>;
    selected: boolean;
    onSelect: () => void;
    onMove: (x: number, y: number) => void;
    onRemove: () => void;
};

export const DeskSticker = ({ sticker, desk, selected, onSelect, onMove, onRemove }: DeskStickerProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const { label, art } = STICKERS[sticker.kind];

    // After a drop the new spot is saved as left/top; clear the drag offset in the same frame
    useLayoutEffect(() => {
        x.set(0);
        y.set(0);
    }, [sticker.x, sticker.y, x, y]);

    const settle = () => {
        const el = ref.current?.getBoundingClientRect();
        const d = desk.current?.getBoundingClientRect();
        if (!el || !d) return;
        onMove((el.left + el.width / 2 - d.left) / d.width, (el.top + el.height / 2 - d.top) / d.height);
    };

    // Keyboard: arrows nudge it, Delete or Backspace peels it off
    const onKeyDown = (e: React.KeyboardEvent) => {
        const step = e.shiftKey ? 0.06 : 0.02;
        const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            onRemove();
        } else if (moves[e.key]) {
            e.preventDefault();
            const [dx, dy] = moves[e.key];
            onMove(Math.min(Math.max(sticker.x + dx, 0.05), 0.95), Math.min(Math.max(sticker.y + dy, 0.05), 0.95));
        }
    };

    return (
        <motion.div
            ref={ref}
            role="button"
            tabIndex={0}
            aria-label={`${label} sticker. Drag or use the arrow keys to move it, Delete to peel it off.`}
            drag
            dragConstraints={desk}
            dragElastic={0.05}
            dragMomentum={false}
            onDragStart={onSelect}
            onDragEnd={settle}
            onTap={onSelect}
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, scale: 1.6, rotate: sticker.r - 25 }}
            animate={{ opacity: 1, scale: 1, rotate: sticker.r }}
            exit={{ opacity: 0, scale: 0.6, rotate: sticker.r + 30, transition: { duration: 0.25 } }}
            whileHover={{ scale: 1.06 }}
            whileDrag={{ scale: 1.12, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            style={{ x, y, left: `${sticker.x * 100}%`, top: `${sticker.y * 100}%`, zIndex: selected ? 31 : 30, touchAction: 'none' }}
            className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-grab select-none outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
        >
            <div style={{ filter: STICKER_EDGE }}>{art}</div>
            <button
                type="button"
                aria-label={`Peel off the ${label} sticker`}
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                onPointerDown={(e) => e.stopPropagation()}
                // (shown on hover, when picked, or while the sticker has keyboard focus; the 28px dot has a 44px hit area)
                className={`absolute -right-3 -top-3 grid h-7 w-7 place-items-center rounded-full bg-ink text-sm text-pink shadow-md transition-opacity duration-200 before:absolute before:-inset-2 before:content-[''] group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(pointer:fine)]:group-hover:opacity-100 ${selected ? 'opacity-100' : 'pointer-events-none opacity-0 [@media(pointer:fine)]:group-hover:pointer-events-auto'}`}
            >
                <IoClose />
            </button>
        </motion.div>
    );
};

// The sheet the stickers are picked from: backing paper taped down with
// washi, each sticker in its dashed cut line, lifting at the corner when
// hovered as if about to be peeled, and the sheet's own corner curling up
export const StickerSheet = ({ onAdd, onClear, count }: { onAdd: (kind: StickerKind) => void; onClear: () => void; count: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 24, rotate: 0 }}
        whileInView={{ opacity: 1, y: 0, rotate: -1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
    >
        <span aria-hidden className="absolute -top-3 left-10 z-10 h-6 w-20 -rotate-6 bg-pink/80" />
        <span aria-hidden className="absolute -top-3 right-12 z-10 h-6 w-16 rotate-[5deg] bg-[#9BD0ED]/75" />
        <div className="relative overflow-hidden rounded-md bg-[#FCF8F0] px-5 pb-7 pt-6 text-ink shadow-paper sm:px-7">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50">Sticker sheet · No. 01</p>
                    <p className="mt-1.5 font-display text-xl italic leading-none sm:text-[1.75rem]">stick something on my board</p>
                </div>
                {count > 0 && (
                    <button type="button" onClick={onClear} className="min-h-11 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50 transition-colors hover:text-[#B8365E]">
                        Peel all off
                    </button>
                )}
            </div>
            <ul className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-8">
                {KINDS.map((kind) => (
                    <li key={kind}>
                        <motion.button
                            type="button"
                            aria-label={`Add a ${STICKERS[kind].label} sticker`}
                            onClick={() => onAdd(kind)}
                            initial="rest"
                            whileHover="peel"
                            whileTap={{ scale: 0.9 }}
                            className="grid h-20 w-full place-items-center rounded-2xl outline-1 -outline-offset-4 outline-ink/20 outline-dashed"
                        >
                            {/* every design shrunk to the same footprint, so the sheet reads as an even grid */}
                            <span style={{ filter: STICKER_EDGE, scale: Math.min(0.85, 54 / STICKERS[kind].w) }}>
                                <motion.span
                                    variants={{ rest: { y: 0, rotate: 0 }, peel: { y: -5, rotate: -8 } }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                    className="block"
                                >
                                    {STICKERS[kind].art}
                                </motion.span>
                            </span>
                        </motion.button>
                    </li>
                ))}
            </ul>
            {/* the corner curling up */}
            <span
                aria-hidden
                className="absolute bottom-0 right-0 h-9 w-9 drop-shadow-[-2px_-2px_2px_rgba(0,0,0,0.12)]"
                style={{ background: 'linear-gradient(315deg, var(--background) 0 50%, #E9DEC9 50% 100%)' }}
            />
        </div>
    </motion.div>
);
