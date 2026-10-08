'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import Sakura from './Sakura';

// A 720px WebP of public/antra.png (2.6 MB) so the polaroid loads quickly.
// If it ever fails to load, a monogram is shown in its place.
const PHOTO_SRC: string | null = '/portfolio/antra.webp';

const ease = [0.16, 1, 0.3, 1] as const;

const facts = [
    { label: "Based in", value: "Vellore, India" },
    { label: "Studying", value: "B.Tech CSE (Data Science), VIT · 2024 – 2028" },
    { label: "Focus", value: "Full stack, machine learning, system design" },
    { label: "Open source", value: "36 merged PRs across 20 repositories" },
];

// A taped-on polaroid that straightens up when you hover it
const Portrait = () => {
    const [failed, setFailed] = useState(false);
    const showPhoto = PHOTO_SRC && !failed;

    return (
        <motion.figure
            initial={{ opacity: 0, y: 40, rotate: -9 }}
            whileInView={{ opacity: 1, y: 0, rotate: -4 }}
            whileHover={{ rotate: 0, scale: 1.02 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease }}
            className="relative mx-auto w-64 sm:w-72 md:w-full max-w-[320px] bg-card p-3 pb-16 shadow-paper"
        >
            <span aria-hidden className="absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 rotate-[3deg] bg-pink/75" />

            {/* Blossom backdrop behind the cut-out photo (or the monogram): navy in dark mode, pink in light */}
            <div className="portrait-bg relative aspect-[4/5] overflow-hidden">
                {showPhoto ? (
                    <img
                        src={PHOTO_SRC}
                        alt="Portrait of Antra"
                        loading="lazy"
                        decoding="async"
                        onError={() => setFailed(true)}
                        className="relative h-full w-full object-cover object-top"
                    />
                ) : (
                    <div className="relative grid h-full w-full place-items-center">
                        <span className="font-display italic text-[9rem] leading-none text-panel-fg">A</span>
                    </div>
                )}
            </div>

            <figcaption className="absolute inset-x-4 bottom-4 flex items-baseline justify-between text-ink">
                <span className="font-display italic text-2xl">Antra, ’26</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">Fig. 01</span>
            </figcaption>

            {/* Sticker */}
            <div className="absolute -right-6 -bottom-6 grid h-24 w-24 rotate-12 place-items-center rounded-full bg-pink text-center text-ink shadow-xl">
                <div className="flex flex-col items-center gap-1">
                    <Sakura className="h-4 w-4" />
                    <span className="font-mono text-[9px] font-medium uppercase leading-tight tracking-[0.14em]">Patent<br />co-inventor</span>
                </div>
            </div>
        </motion.figure>
    );
};

const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.9, ease, delay },
});

const About = () => {
    return (
        <section id="about" className="w-full px-5 sm:px-10 pt-20 pb-28 sm:pt-28 sm:pb-40">
            <div className="mx-auto max-w-[1360px]">
                <SectionHeading eyebrow="Who I am" title={<>About <em>me</em></>} />

                <div className="grid gap-20 md:grid-cols-12 md:gap-10">
                    <div className="md:col-span-4 md:pt-4">
                        <Portrait />
                    </div>

                    <div className="md:col-span-8 md:pl-8">
                        <motion.p {...reveal()} className="text-[clamp(1.375rem,2.1vw,1.875rem)] font-medium leading-[1.3] tracking-[-0.02em] text-fg">
                            I’m Antra, a software engineer and data scientist. I build full stack
                            products end to end and <em className="font-display font-normal text-accent">ship them to production.</em>
                        </motion.p>

                        <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-10 text-base leading-relaxed text-fg/65">
                            <motion.p {...reveal(0.1)}>
                                I’m pursuing Computer Science and Engineering with a specialisation in Data Science at VIT,
                                working from React and Next.js interfaces to FastAPI and Node.js backends. I enjoy thinking
                                in terms of <span className="text-fg">system design</span>: clean API contracts,
                                role-based access control, real-time pipelines over WebSockets, caching, and data models
                                that stay maintainable as a product grows.
                            </motion.p>
                            <motion.p {...reveal(0.2)}>
                                On the data side, I use Python, Pandas, and Scikit-learn to build and evaluate models, and
                                bring computer vision and audio ML into real applications.{' '}
                                <span className="text-fg">Competitive programming</span> keeps my problem-solving sharp:
                                I regularly solve data structures and algorithms problems on LeetCode, and contribute to open
                                source.
                            </motion.p>
                        </div>

                        <motion.dl {...reveal(0.25)} className="mt-14 border-t border-fg/15">
                            {facts.map((fact) => (
                                <div key={fact.label} className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[10rem_1fr] gap-4 border-b border-fg/15 py-4">
                                    <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted pt-0.5">{fact.label}</dt>
                                    <dd className="text-base font-medium text-fg/85">{fact.value}</dd>
                                </div>
                            ))}
                        </motion.dl>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
