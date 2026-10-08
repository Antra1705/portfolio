'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, animate, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { IoArrowForward } from 'react-icons/io5';

const NAME = "Antra";

const stats = [
    { value: 36, label: "PRs merged" },
    { value: 20, label: "Open-source repos" },
    { value: 1, label: "Published patent" },
    { value: 8.89, decimals: 2, label: "CGPA at VIT" },
];

const socials = [
    { href: "https://github.com/Antra1705", label: "GitHub" },
    { href: "https://www.linkedin.com/in/antra-dev", label: "LinkedIn" },
    { href: "https://leetcode.com/u/antra_1705/", label: "LeetCode" },
];

const ease = [0.16, 1, 0.3, 1] as const;

const Counter = ({ value, decimals = 0, delay = 0 }: { value: number; decimals?: number; delay?: number }) => {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            node.textContent = value.toFixed(decimals);
            return;
        }
        const controls = animate(0, value, {
            duration: 1.8,
            delay,
            ease,
            onUpdate: (v) => { node.textContent = v.toFixed(decimals); },
        });
        return () => controls.stop();
    }, [value, decimals, delay]);

    return <span ref={ref}>{(0).toFixed(decimals)}</span>;
};

// Live time in Vellore, so the page feels like it belongs to a real place
const LocalTime = () => {
    const [time, setTime] = useState('');

    useEffect(() => {
        const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
        const tick = () => setTime(fmt.format(new Date()));
        tick();
        const id = setInterval(tick, 10000);
        return () => clearInterval(id);
    }, []);

    return <span className="tabular-nums">{time}</span>;
};

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.9, ease },
});

const Hero = () => {
    const ref = useRef<HTMLElement>(null);
    const reduceMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    // Name and tagline drift apart as the hero scrolls away
    const nameX = useTransform(scrollYProgress, [0, 1], ['0%', '-14%']);
    const lineX = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
    const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <section
            ref={ref}
            id="home"
            className="relative w-full min-h-[100svh] flex flex-col px-5 sm:px-10 pt-24 sm:pt-28 pb-8 sm:pb-10 overflow-hidden"
        >
            {/* Soft blossom light behind the name */}
            <div aria-hidden className="pointer-events-none absolute -top-[20vmax] -right-[15vmax] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(242,174,188,0.16),transparent_60%)]" />

            {/* Masthead */}
            <motion.div
                {...fadeUp(0.1)}
                className="relative grid grid-cols-2 sm:grid-cols-3 gap-6 border-b border-fg/15 pb-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-muted"
            >
                <p>
                    Portfolio <span className="hidden sm:inline">· Ed. 2026</span><span className="sm:hidden">’26</span>
                </p>
                <p className="hidden sm:block text-center">B.Tech CSE (Data Science) · VIT</p>
                <p className="text-right">Vellore · <LocalTime /> IST</p>
            </motion.div>

            <motion.div style={reduceMotion ? undefined : { opacity: fade }} className="relative flex-1 flex flex-col justify-center py-10 sm:py-4">
                {/* Name: letters rise out of a mask; hover any letter */}
                <motion.h1
                    aria-label={NAME}
                    style={reduceMotion ? undefined : { x: nameX }}
                    className="flex -ml-[0.05em] text-[clamp(6rem,min(26vw,36svh),22rem)] font-black leading-[0.78] tracking-[-0.065em] text-fg"
                >
                    {NAME.split('').map((letter, i) => (
                        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.06em] pr-[0.02em]">
                            <motion.span
                                initial={{ y: '105%' }}
                                animate={{ y: 0 }}
                                transition={{ delay: 0.2 + i * 0.08, duration: 1.1, ease }}
                                className="inline-block"
                            >
                                <span className="hero-letter">{letter}</span>
                            </motion.span>
                        </span>
                    ))}
                </motion.h1>

                <motion.p
                    style={reduceMotion ? undefined : { x: lineX }}
                    className="mt-3 sm:mt-1 self-end text-right sm:mr-[4vw] font-display italic text-[clamp(1.75rem,min(4.6vw,6.5svh),4.25rem)] leading-[0.95] tracking-[-0.01em] text-fg"
                >
                    <motion.span {...fadeUp(0.75)} className="block">
                        Software engineer
                    </motion.span>
                    <motion.span {...fadeUp(0.85)} className="block">
                        <span className="text-accent">&amp;</span> data scientist.
                    </motion.span>
                </motion.p>
            </motion.div>

            {/* Lower band: intro + actions on the left, proof on the right */}
            <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
                <motion.div {...fadeUp(1)} className="lg:col-span-5">
                    <p className="max-w-md text-base leading-relaxed text-fg/70">
                        I build full stack products, real-time systems, and ML-powered apps,
                        and ship them to production.
                    </p>

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

                    <ul className="mt-6 flex gap-6 font-mono text-[11px] uppercase tracking-[0.18em]">
                        {socials.map((s) => (
                            <li key={s.label}>
                                <a
                                    href={s.href}
                                    data-track={`${s.label.toLowerCase()}-hero`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted transition-colors hover:text-accent"
                                >
                                    {s.label} <span aria-hidden>↗</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                <motion.dl {...fadeUp(1.15)} className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 border-t border-fg/15">
                    {stats.map((stat, i) => (
                        <div
                            key={stat.label}
                            className={`flex flex-col-reverse pt-4 pb-1 pr-4 ${i > 0 ? 'sm:border-l sm:border-fg/15 sm:pl-5' : ''} ${i % 2 === 1 ? 'border-l border-fg/15 pl-5' : ''} ${i >= 2 ? 'border-t border-fg/15 sm:border-t-0' : ''}`}
                        >
                            <dt className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{stat.label}</dt>
                            <dd className="font-display text-4xl sm:text-5xl leading-none text-fg tabular-nums">
                                <Counter value={stat.value} decimals={stat.decimals} delay={1.3 + i * 0.1} />
                            </dd>
                        </div>
                    ))}
                </motion.dl>
            </div>

        </section>
    );
};

export default Hero;
