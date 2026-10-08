'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

    return (
        <motion.div
            aria-hidden
            style={{ scaleX }}
            className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[60] bg-linear-to-r from-accent to-sky"
        />
    );
};

export default ScrollProgress;
