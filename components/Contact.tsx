'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { IoLogoLinkedin, IoLogoGithub, IoDocumentTextOutline } from 'react-icons/io5';
import { SiLeetcode } from 'react-icons/si';
import SectionHeading from './SectionHeading';
import Sakura from './Sakura';
import { hasWebGL } from '../lib/gardenColors';

// The 3D tree needs three.js, so it loads only as the section comes near
const ContactTree = dynamic(() => import('./ContactTree'), { ssr: false });

const EMAIL = "antra.1705@gmail.com";
const ease = [0.16, 1, 0.3, 1] as const;

// Each place to find me is a postage stamp
const STAMPS = [
    { href: "https://www.linkedin.com/in/antra-dev", label: "LinkedIn", handle: "antra-dev", icon: IoLogoLinkedin, ink: '#2F6FA8', paper: '#D6EAF6', tilt: -4 },
    { href: "https://github.com/Antra1705", label: "GitHub", handle: "Antra1705", icon: IoLogoGithub, ink: '#021D38', paper: '#E9E4F7', tilt: 3 },
    { href: "https://leetcode.com/u/antra_1705/", label: "LeetCode", handle: "antra_1705", icon: SiLeetcode, ink: '#B5641A', paper: '#FBE6C8', tilt: -2 },
    { href: "/portfolio/Antra_Resume.pdf", label: "Resume", handle: "PDF", icon: IoDocumentTextOutline, ink: '#B8365E', paper: '#FBDCE5', tilt: 5 },
];

const Heart = ({ className = '' }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`inline-block h-[0.75em] w-[0.75em] -translate-y-px align-baseline ${className}`} role="img" aria-label="love">
        <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.2 1.8-2 3.3-3.2 5.4-3.2 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z" />
    </svg>
);

// Without WebGL, the old illustrated tree stands in for the 3D one
const FallbackTree = () => (
    // eslint-disable-next-line @next/next/no-img-element -- static export with images.unoptimized: next/image would add nothing here
    <img src="/portfolio/cherryblossom.png" alt="" className="mx-auto block h-full w-auto translate-y-[5.2%] object-contain lg:mr-[6%]" />
);

const TreeScene = () => {
    const holder = useRef<HTMLDivElement>(null);
    const [near, setNear] = useState(false);
    const [webgl] = useState(hasWebGL);
    // Desktop: the scene spans the section behind the postcard; the tree keeps to the
    // open space right of it (the postcard covers roughly the left 48%)
    const [wide] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
    useEffect(() => {
        const el = holder.current;
        if (!el) return;
        const observer = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                setNear(true);
                observer.disconnect();
            }
        }, { rootMargin: '800px 0px' });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return <div ref={holder} className="h-full w-full">{near && (webgl ? <ContactTree region={wide ? [0.5, 0.975] : [0.03, 0.97]} /> : <FallbackTree />)}</div>;
};

// A postmark: today's date and place inside a double ring, with wavy cancel lines
const Postmark = ({ date }: { date: string }) => (
    <svg viewBox="0 0 170 80" aria-hidden className="h-16 w-36 text-ink/35">
        <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="40" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
        <text x="40" y="37" textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="currentColor" letterSpacing="1">VELLORE</text>
        <text x="40" y="49" textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fill="currentColor">{date}</text>
        {[22, 34, 46, 58].map((y) => (
            <path key={y} d={`M78 ${y} q 11 -6 22 0 t 22 0 t 22 0 t 22 0`} fill="none" stroke="currentColor" strokeWidth="1.4" />
        ))}
    </svg>
);

const Postcard = () => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState(false);
    const [date] = useState(() => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase());

    const subject = name.trim() ? `Hello from ${name.trim()}` : 'Hello from your portfolio';
    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

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
        <motion.div
            initial={{ opacity: 0, y: 40, rotate: -4 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1.2 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease }}
            className="postcard relative bg-card text-ink shadow-paper"
        >
            <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1.25fr_auto_1fr] md:gap-7">
                {/* Writing side */}
                <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">Postcard · write to me</p>
                    <label className="mt-5 flex flex-wrap items-baseline gap-x-2 font-display text-2xl sm:text-[1.75rem] leading-tight">
                        <span className="italic">Hi Antra, I’m</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="your name"
                            autoComplete="name"
                            className="min-w-0 flex-1 border-b border-dashed border-ink/35 bg-transparent px-1 font-display italic text-accent placeholder:text-ink/30 focus:border-accent focus:outline-none"
                        />
                    </label>
                    <label className="mt-4 block">
                        <span className="sr-only">Your message</span>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            placeholder="Tell me about your idea, a role, or just say hi…"
                            className="postcard-lines block w-full resize-none bg-transparent font-display italic text-xl leading-8 text-ink placeholder:text-ink/30 focus:outline-none"
                        />
                    </label>
                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <a
                            href={mailto}
                            data-track="postcard-send"
                            className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-ink pl-5 pr-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-cream transition-transform hover:-translate-y-0.5 active:scale-95"
                        >
                            Send postcard
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-pink text-ink transition-transform duration-500 group-hover:-rotate-45">→</span>
                        </a>
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">Opens your email app</span>
                    </div>
                </div>

                {/* Fold line */}
                <span aria-hidden className="hidden w-px bg-[repeating-linear-gradient(to_bottom,currentColor_0_6px,transparent_6px_12px)] text-ink/20 md:block" />

                {/* Address side */}
                <div className="relative flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-3">
                        <Postmark date={date} />
                        {/* sakura postage stamp */}
                        <div className="stamp-edge shrink-0 rotate-6" style={{ '--stamp-paper': '#FFF7F9' } as React.CSSProperties}>
                            <div className="grid h-20 w-16 place-items-center bg-pink/90 text-ink">
                                <div className="flex flex-col items-center gap-1">
                                    <Sakura className="h-8 w-8" />
                                    <span className="font-mono text-[7px] uppercase tracking-[0.18em]">Sakura</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">To</p>
                        <p className="border-b border-ink/15 pb-1.5 font-display text-2xl leading-none">Antra</p>
                        <a
                            href={`mailto:${EMAIL}`}
                            data-track="email-contact"
                            className="block border-b border-ink/15 pb-1.5 font-display text-lg sm:text-xl leading-tight [overflow-wrap:anywhere] transition-colors hover:text-accent"
                        >
                            {EMAIL}
                        </a>
                        <p className="border-b border-ink/15 pb-1.5 font-display text-lg sm:text-xl leading-tight">Vellore, India</p>
                    </div>
                    <button
                        type="button"
                        onClick={copyEmail}
                        data-track="copy-email"
                        className="mt-4 inline-flex min-h-11 items-center gap-2 self-start font-mono text-[10px] uppercase tracking-[0.18em] text-ink/60 transition-colors hover:text-accent"
                    >
                        <span aria-live="polite">{copied ? 'Copied ✓' : 'Copy address'}</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// The other places, as a strip of postage stamps
const Stamps = () => (
    <div className="mt-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Or find me at</p>
        <ul className="mt-5 flex flex-wrap gap-5 sm:gap-6">
            {STAMPS.map((s, i) => (
                <motion.li
                    key={s.label}
                    initial={{ opacity: 0, y: 24, rotate: 0 }}
                    whileInView={{ opacity: 1, y: 0, rotate: s.tilt }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.08 }}
                >
                    <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track={`${s.label.toLowerCase()}-contact`}
                        aria-label={`${s.label}: ${s.handle}`}
                        className="stamp-edge group block transition-transform duration-300 hover:-translate-y-1.5 hover:rotate-[-1deg]"
                        style={{ '--stamp-paper': '#FFFCF4' } as React.CSSProperties}
                    >
                        <span className="flex h-28 w-24 flex-col justify-between p-2.5" style={{ background: s.paper, color: s.ink }}>
                            <span className="flex items-start justify-between">
                                <s.icon className="text-2xl" aria-hidden />
                                <span aria-hidden className="text-sm transition-transform duration-300 group-hover:-rotate-45">↗</span>
                            </span>
                            <span>
                                <span className="block text-[15px] font-bold leading-tight tracking-tight">{s.label}</span>
                                <span className="block truncate font-mono text-[8px] uppercase tracking-[0.12em] opacity-75">{s.handle}</span>
                            </span>
                        </span>
                    </a>
                </motion.li>
            ))}
        </ul>
    </div>
);

const EXPLORE = [
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Experience', href: '#experience' },
    { name: 'Patents', href: '#patents' },
    { name: 'Projects', href: '#projects' },
];

const FooterLink = ({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) => (
    <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group inline-flex min-h-10 items-center gap-2 text-lg font-semibold tracking-[-0.01em] text-fg/80 transition-colors hover:text-accent"
    >
        <span aria-hidden className="h-px w-0 bg-accent transition-[width] duration-300 ease-out group-hover:w-4" />
        {children}
        {external && <span aria-hidden className="text-sm text-muted transition-transform duration-300 group-hover:-rotate-45 group-hover:text-accent">↗</span>}
    </a>
);

// The footer is part of the page, not a bar under it: a sign-off, ways around,
// and the name again, huge, its letters rising in the way the hero's do
const Footer = () => (
    <footer className="relative px-5 sm:px-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-[1440px] pt-12 sm:pt-16">
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12 md:gap-8">
                <div className="col-span-2 md:col-span-6">
                    <p className="font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] text-fg">
                        Thanks for scrolling<br />all the way <em className="text-accent">down here.</em>
                    </p>
                </div>

                <nav aria-label="Footer" className="md:col-span-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Explore</p>
                    <ul className="mt-4 space-y-0.5">
                        {EXPLORE.map((l) => <li key={l.name}><FooterLink href={l.href}>{l.name}</FooterLink></li>)}
                    </ul>
                </nav>

                <div className="md:col-span-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Elsewhere</p>
                    <ul className="mt-4 space-y-0.5">
                        {STAMPS.map((l) => <li key={l.label}><FooterLink href={l.href} external>{l.label}</FooterLink></li>)}
                    </ul>
                </div>
            </div>

            {/* Sign-off row: copyright and credit sit either side of the name */}
            <div className="mt-12 flex flex-col items-center gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
                <span className="order-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted lg:order-1 lg:mb-[1.4vw] lg:flex-1 lg:whitespace-nowrap">
                    © {new Date().getFullYear()} Antra · All rights reserved
                </span>

                {/* The name, huge, in sakura pink fading into the page; letters rise in one by one.
                    The line (not the clipped letters) watches for the viewport, so it can trigger */}
                <motion.p
                    aria-hidden
                    initial="hidden"
                    whileInView="shown"
                    viewport={{ once: true, amount: 0.2 }}
                    className="footer-wordmark order-1 pointer-events-none -mb-[0.2em] flex select-none justify-center text-[clamp(5.5rem,21vw,19rem)] font-black leading-[0.8] tracking-[-0.065em] lg:order-2"
                >
                    {'Antra'.split('').map((letter, i) => (
                        <span key={i} className="inline-block overflow-hidden pb-[0.04em]">
                            <motion.span
                                variants={{ hidden: { y: '100%' }, shown: { y: 0 } }}
                                transition={{ duration: 1.1, ease, delay: i * 0.07 }}
                                className="inline-block"
                            >
                                {letter}
                            </motion.span>
                        </span>
                    ))}
                </motion.p>

                <span className="order-3 font-display text-lg italic text-fg/80 lg:mb-[1.2vw] lg:flex-1 lg:whitespace-nowrap lg:text-right">
                    made with <Heart className="text-accent" /> by Antra
                </span>
            </div>
        </div>
    </footer>
);

const Contact = () => (
    <section id="contact" className="relative w-full overflow-hidden">
        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-10 pt-16 sm:pt-20">
            <SectionHeading title={<>Let’s build <em>something.</em></>} />

            <div className="relative grid lg:grid-cols-12 lg:gap-12">
                {/* The postcard and its stamps */}
                <div className="relative z-10 lg:col-span-6 lg:pb-24">
                    <Postcard />
                    <Stamps />
                </div>

                {/* The tree. Desktop: one canvas behind the whole row, bleeding to the
                    screen's right edge, so the crown's top lines up with the postcard's
                    top and the lawn fades out with nothing cutting it. Phones: its own
                    block under the stamps. */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 1.2 }}
                    className="relative -mx-5 mt-8 -mb-6 h-[440px] sm:-mx-10 sm:h-[540px] lg:absolute lg:top-0 lg:-bottom-6 lg:left-0 lg:-right-10 lg:m-0 lg:h-auto"
                >
                    {/* Soft edges, so the lawn fades rather than ends */}
                    <div
                        className="absolute inset-0"
                        style={{
                            maskImage: 'linear-gradient(to bottom, #000 90%, transparent), linear-gradient(to right, transparent, #000 8%, #000 94%, transparent)',
                            maskComposite: 'intersect',
                            WebkitMaskComposite: 'source-in',
                        }}
                    >
                        <TreeScene />
                    </div>
                </motion.div>
            </div>
        </div>

        <Footer />
    </section>
);

export default Contact;
