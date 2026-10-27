'use client';

import React from 'react';
import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

// Editorial section heading: one big title.
// Wrap a word of the title in <em> to set it in the italic serif.
const SectionHeading = ({ title }: { title: React.ReactNode }) => (
    <div className="mb-12 sm:mb-16">
        {/* Observe the h2, not the clipped span inside it, or a fully hidden title never triggers */}
        <motion.h2
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, margin: '-80px' }}
            className="overflow-hidden pb-[0.08em] text-[clamp(2.5rem,5.6vw,5rem)] font-black leading-[0.92] tracking-[-0.045em] text-fg [&_em]:font-display [&_em]:font-normal [&_em]:tracking-[-0.01em] [&_em]:text-accent"
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
