'use client';

import React from 'react';
import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

// Editorial heading: "Eyebrow ————" over a big title.
// Wrap a word of the title in <em> to set it in the italic serif.
const SectionHeading = ({ eyebrow, title }: { eyebrow: string; title: React.ReactNode }) => (
    <div className="mb-12 sm:mb-16">
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted"
        >
            <span className="text-accent">{eyebrow}</span>
            <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1.2, ease, delay: 0.1 }}
                className="h-px flex-1 origin-left bg-fg/15"
            />
        </motion.div>
        {/* Observe the h2, not the clipped span inside it, or a fully hidden title never triggers */}
        <motion.h2
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-6 overflow-hidden pb-[0.08em] text-[clamp(2.5rem,5.6vw,5rem)] font-black leading-[0.92] tracking-[-0.045em] text-fg [&_em]:font-display [&_em]:font-normal [&_em]:tracking-[-0.01em] [&_em]:text-accent"
        >
            <motion.span
                variants={{ hidden: { y: '105%' }, shown: { y: 0 } }}
                transition={{ duration: 1, ease }}
                className="block"
            >
                {title}
            </motion.span>
        </motion.h2>
    </div>
);

export default SectionHeading;
