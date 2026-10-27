'use client';

import React, { useRef } from 'react';
import {
    motion, useScroll, useVelocity, useSpring, useTransform,
    useMotionValue, useAnimationFrame, useReducedMotion,
} from 'framer-motion';
import Sakura from './Sakura';

const items = [
    "Software Engineer", "Data Scientist", "Patent Co-inventor",
    "Open Source", "Full Stack", "Machine Learning", "System Design",
];

const wrap = (min: number, max: number, v: number) => {
    const range = max - min;
    return ((((v - min) % range) + range) % range) + min;
};

// Ticker that drifts on its own, speeds up while you scroll, and reverses
// when you scroll back up. The row is rendered twice so it can loop at -50%.
const Marquee = () => {
    const reduceMotion = useReducedMotion();
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
    const boost = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
    const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
    const direction = useRef(1);

    useAnimationFrame((_, delta) => {
        if (reduceMotion) return;
        let moveBy = direction.current * -1.6 * (delta / 1000);
        if (boost.get() < 0) direction.current = -1;
        else if (boost.get() > 0) direction.current = 1;
        moveBy += direction.current * moveBy * boost.get();
        baseX.set(baseX.get() + moveBy);
    });

    const row = (
        <div className="flex shrink-0 items-center">
            {items.map((item, i) => (
                <React.Fragment key={item}>
                    <span
                        className={`whitespace-nowrap px-5 sm:px-8 leading-none ${i % 2
                            ? 'font-display italic text-4xl sm:text-5xl tracking-[-0.01em]'
                            : 'text-3xl sm:text-[2.75rem] font-black uppercase tracking-[-0.04em]'}`}
                    >
                        {item}
                    </span>
                    <Sakura className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
                </React.Fragment>
            ))}
        </div>
    );

    return (
        // clipped at the sides only, so the band's glow can fade out fully below it
        <div aria-hidden className="relative w-full overflow-x-clip py-10 sm:py-16">
            <div className="-rotate-2 scale-[1.04] bg-pink py-4 sm:py-5 text-ink shadow-[0_30px_60px_-30px_rgba(242,174,188,0.6)]">
                <motion.div style={{ x }} className="flex w-max">
                    {row}
                    {row}
                </motion.div>
            </div>
        </div>
    );
};

export default Marquee;
