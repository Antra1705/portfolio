'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { IoArrowForward } from 'react-icons/io5';
import { RisingName, socials, fadeUp, STATS } from './heroShared';
import { hasWebGL } from '../lib/gardenColors';
import type { ThemeSwitch } from './BlossomBranch';
import { ThemeLantern } from './HeroLantern';

// The 3D branch needs three.js; it loads on its own after the text
const BlossomBranch = dynamic(() => import('./BlossomBranch'), { ssr: false });

// The branch canvas and the layer its stat tags hang in share this box
const BRANCH_BOX = 'pointer-events-none absolute right-0 top-14 h-[44svh] w-full sm:top-16 lg:top-10 lg:h-[76svh] lg:w-[54%]';

// Hero: the name in solid type, with a 3D cherry-blossom branch reaching in from
// the right edge above it, dropping petals. The numbers hang from its twigs as
// small paper tags (tanzaku). Below, the intro and the ways to reach me.
// Without WebGL the hero is type, and the numbers sit under the intro instead.
// `play` starts the entrance: the hero mounts early, hidden under the preloader's
// dark (so its 3D branch sets up there), and plays as the light opens onto it
const Hero = ({ theme, onToggleTheme, play = true }: ThemeSwitch & { play?: boolean }) => {
    const ref = useRef<HTMLElement>(null);
    const tagLayer = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    const [webgl] = useState(hasWebGL);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
    const fadeStyle = reduceMotion ? undefined : { opacity: fade };

    return (
        <section ref={ref} id="home" className="relative w-full min-h-[100svh] outline-none overflow-hidden px-5 sm:px-10 pt-24 sm:pt-28 pb-10 sm:pb-12 flex flex-col">
            {/* The branch: fixed in place top right, behind the content, past the right edge */}
            {webgl && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: play ? 1 : 0 }}
                        transition={{ delay: 0.4, duration: 1.6, ease: [0.25, 0.1, 0.25, 1] }}
                        className={`${BRANCH_BOX} z-0`}
                    >
                        <motion.div style={fadeStyle} className="h-full w-full">
                            <BlossomBranch tagLayer={tagLayer} themeSwitch={{ theme, onToggleTheme }} />
                        </motion.div>
                    </motion.div>
                    {/* above the text, so the tags can be hovered wherever they hang */}
                    <motion.div ref={tagLayer} style={fadeStyle} className={`${BRANCH_BOX} z-20`} />
                </>
            )}
            {/* no branch without WebGL, so the lantern (the theme switch) hangs from the top instead */}
            {!webgl && (
                <div className="absolute right-[18%] top-0 z-20 sm:right-[22%]">
                    <ThemeLantern theme={theme} onToggle={onToggleTheme} cord={150} />
                </div>
            )}

            <motion.div style={fadeStyle} className="relative z-10 flex flex-1 flex-col justify-end pt-[30svh] lg:justify-center lg:pt-0">
                <RisingName play={play} className="-ml-[0.05em] text-[clamp(6rem,min(24vw,34svh),21rem)] font-black leading-[0.78] tracking-[-0.065em] text-fg" />
                <motion.p {...fadeUp(0.75, play)} className="mt-5 font-display italic text-[clamp(1.75rem,3.8vw,3.5rem)] leading-[1] text-fg">
                    Software engineer <span className="text-accent">&amp;</span> data scientist.
                </motion.p>
            </motion.div>

            {/* Lower band: the intro and the ways to reach me */}
            <motion.div {...fadeUp(1, play)} className="relative z-10 mt-14 max-w-xl">
                <p className="text-[clamp(1.125rem,1.6vw,1.375rem)] leading-relaxed text-fg/80">
                    I build full stack and ML products, and ship them to production.
                </p>
                {!webgl && (
                    <dl className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                        {STATS.map((s, i) => (
                            <React.Fragment key={s.label}>
                                {i > 0 && <span aria-hidden className="text-accent/70">✿</span>}
                                <div className="flex items-baseline gap-2">
                                    <dd className="font-display text-2xl normal-case tracking-normal text-accent tabular-nums">{s.value.toFixed(s.decimals ?? 0)}</dd>
                                    <dt>{s.label}</dt>
                                </div>
                            </React.Fragment>
                        ))}
                    </dl>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-4">
                    <a
                        href="/portfolio/Antra_Resume.pdf"
                        data-track="resume-hero"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 rounded-full bg-pink pl-6 pr-2 py-2 text-[13px] font-bold uppercase tracking-[0.12em] text-ink transition-transform duration-300 hover:-translate-y-0.5 active:scale-95"
                    >
                        View resume
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-pink transition-transform duration-500 group-hover:-rotate-45">
                            <IoArrowForward />
                        </span>
                    </a>
                    <a href="#contact" data-track="get-in-touch-hero" className="link-underline pb-0.5 text-[13px] font-bold uppercase tracking-[0.12em] text-fg hover:text-accent">
                        Get in touch
                    </a>
                </div>
                <ul className="mt-3 flex gap-6 font-mono text-[11px] uppercase tracking-[0.18em]">
                    {socials.map((s) => (
                        <li key={s.label}>
                            <a
                                href={s.href}
                                data-track={`${s.label.toLowerCase()}-hero`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-11 items-center text-muted transition-colors hover:text-accent"
                            >
                                {s.label} <span aria-hidden className="ml-1">↗</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </motion.div>
        </section>
    );
};

export default Hero;
