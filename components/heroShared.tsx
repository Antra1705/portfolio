'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Hero building blocks: the rising name, stats, social links and motion presets

export const NAME = "Antra";
export const ease = [0.16, 1, 0.3, 1] as const;

export const socials = [
    { href: "https://github.com/Antra1705", label: "GitHub" },
    { href: "https://www.linkedin.com/in/antra-dev", label: "LinkedIn" },
    { href: "https://leetcode.com/u/antra_1705/", label: "LeetCode" },
];

export const STATS = [
    { value: 36, label: 'PRs merged' },
    { value: 20, label: 'Open-source repos' },
    { value: 1, label: 'Published patent' },
    { value: 8.89, decimals: 2, label: 'CGPA at VIT' },
];

export const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.9, ease },
});

// The name, letters rising out of a mask; hover any letter for the outline
export const RisingName = ({ className, delay = 0.2 }: { className: string; delay?: number }) => (
    <h1 aria-label={NAME} className={`flex ${className}`}>
        {NAME.split('').map((letter, i) => (
            <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.06em] pr-[0.02em]">
                <motion.span
                    initial={{ y: '105%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: delay + i * 0.08, duration: 1.1, ease }}
                    className="inline-block"
                >
                    <span className="hero-letter">{letter}</span>
                </motion.span>
            </span>
        ))}
    </h1>
);
