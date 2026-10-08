'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import FallingPetals from './FallingPetals';

const EMAIL = "antra.1705@gmail.com";

const links = [
    { href: "https://linkedin.com/in/antra-dev", label: "LinkedIn" },
    { href: "https://github.com/Antra1705", label: "GitHub" },
    { href: "/portfolio/Antra_Resume.pdf", label: "Resume" },
];

const Heart = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="inline-block h-[0.75em] w-[0.75em] -translate-y-px align-baseline" role="img" aria-label="love">
        <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.2 1.8-2 3.3-3.2 5.4-3.2 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z" />
    </svg>
);

const Tree = ({ side }: { side: 'left' | 'right' }) => {
    const flip = side === 'left' ? -1 : 1;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 100 * flip, scaleX: flip }}
            whileInView={{ opacity: 1, scale: 1, x: 0, scaleX: flip }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute bottom-0 z-10 w-[42%] max-w-[380px] pointer-events-none"
            style={side === 'left' ? { left: '-1%' } : { right: '-1%' }}
        >
            {/* The PNG has ~5% transparent space under the trunk; shift it down so the roots meet the footer */}
            <img src="/portfolio/cherryblossom.png" alt="" className="block h-auto w-full translate-y-[5.2%] drop-shadow-2xl" />
        </motion.div>
    );
};

const Contact = () => {
    const [copied, setCopied] = useState(false);

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(EMAIL);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.location.href = `mailto:${EMAIL}`;
        }
    };

    return (
        <section id="contact" className="relative w-full overflow-hidden">
            {/* Content and trees share this block, so the trees' roots sit on the footer's top edge */}
            <div className="relative">
                <div className="relative z-20 mx-auto max-w-[1440px] px-5 sm:px-10 pt-28 sm:pt-40 pb-[min(66vw,560px)]">
                    <SectionHeading eyebrow="Say hello" title={<>Let’s build<br /><em>something.</em></>} />

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between"
                    >
                        <div className="min-w-0">
                            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Write to me</p>
                            <a
                                href={`mailto:${EMAIL}`}
                                data-track="email-contact"
                                className="link-underline mt-3 inline-block max-w-full [overflow-wrap:anywhere] font-display text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.1] text-fg hover:text-accent"
                            >
                                {EMAIL}
                            </a>
                            <div className="mt-5">
                                <button
                                    type="button"
                                    onClick={copyEmail}
                                    data-track="copy-email"
                                    className="inline-flex min-h-11 items-center rounded-full border border-fg/25 px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-fg/80 transition-colors hover:border-accent hover:text-accent"
                                >
                                    <span aria-live="polite">{copied ? 'Copied ✓' : 'Copy email'}</span>
                                </button>
                            </div>
                        </div>

                        <ul className="flex flex-wrap gap-x-8 gap-y-1 font-mono text-[12px] uppercase tracking-[0.18em]">
                            {links.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        data-track={`${link.label.toLowerCase()}-contact`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex min-h-11 items-center gap-1.5 text-muted transition-colors hover:text-accent"
                                    >
                                        {link.label} <span aria-hidden>↗</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                <Tree side="left" />
                <Tree side="right" />
            </div>

            {/* Footer: in normal flow so the trees stand on it and it never covers content.
                Mobile stacks the sign-off above the year/back-to-top row. */}
            <footer className="relative z-20 grid grid-cols-2 items-center gap-x-4 gap-y-1 bg-pink px-5 sm:px-10 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-ink sm:grid-cols-3">
                <p className="col-span-2 text-center font-display italic text-xl leading-tight sm:order-2 sm:col-span-1 sm:text-2xl">
                    made with <Heart /> by Antra
                </p>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] sm:order-1">
                    © {new Date().getFullYear()} Antra
                </span>
                <a
                    href="#home"
                    className="group -mr-3 inline-flex min-h-11 items-center gap-2 justify-self-end rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-ink/10 sm:order-3"
                >
                    Back to top
                    <span aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5">↑</span>
                </a>
            </footer>

            {/* Tiny falling petals */}
            <FallingPetals variant="contained" count={14} mobileCount={8} minSize={6} maxSize={10} maxOpacity={0.5} />
        </section>
    );
};

export default Contact;
