'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sakura from './Sakura';

const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Experience', href: '#experience' },
    { name: 'Patents', href: '#patents' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
];

const ease = [0.16, 1, 0.3, 1] as const;

// The theme is switched by the lantern on the hero branch, not from here
const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [active, setActive] = useState('');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Highlight the link for whichever section crosses the middle of the screen
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { rootMargin: '-45% 0px -50% 0px' }
        );
        document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    // Lock page scroll and listen for Escape while the mobile menu is open
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <header className="fixed inset-x-0 top-0 z-50">
            <div
                className={`relative z-50 flex items-center justify-between px-5 sm:px-10 transition-all duration-500 ${scrolled && !open ? 'py-3 bg-(--background)/75 backdrop-blur-xl border-b border-transparent' : 'py-5 border-b border-transparent'}`}
            >
                <a href="#home" aria-label="Antra, back to top" className="group flex items-center gap-2 text-fg" onClick={() => setOpen(false)}>
                    <Sakura className="h-5 w-5 text-accent transition-transform duration-700 group-hover:rotate-[72deg]" />
                    <span className="font-display italic text-2xl leading-none">Antra</span>
                </a>

                <nav aria-label="Primary" className="hidden lg:block">
                    <ul className="flex items-center gap-7 font-mono text-[11px] uppercase tracking-[0.16em]">
                        {navLinks.map((link) => {
                            const isActive = active === link.href.slice(1);
                            return (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        aria-current={isActive ? 'true' : undefined}
                                        className={`relative flex items-center py-2 transition-colors ${isActive ? 'text-fg' : 'text-muted hover:text-fg'}`}
                                    >
                                        {link.name}
                                        {isActive && (
                                            <motion.span
                                                layoutId="nav-active"
                                                className="absolute -bottom-0.5 left-0 right-0 h-px bg-accent"
                                                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                            />
                                        )}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="flex items-center gap-3">
                    <a
                        href="/portfolio/Antra_Resume.pdf"
                        data-track="resume-nav"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-fg/25 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fg transition-colors hover:border-pink hover:bg-pink hover:text-ink"
                    >
                        Resume <span aria-hidden>↗</span>
                    </a>

                    <button
                        type="button"
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        onClick={() => setOpen((v) => !v)}
                        className="lg:hidden relative grid h-11 w-11 place-items-center rounded-full border border-fg/25 text-fg"
                    >
                        <span className={`absolute h-px w-4 bg-current transition-transform duration-300 ${open ? 'rotate-45' : '-translate-y-[3px]'}`} />
                        <span className={`absolute h-px w-4 bg-current transition-transform duration-300 ${open ? '-rotate-45' : 'translate-y-[3px]'}`} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        id="mobile-menu"
                        initial={{ clipPath: 'inset(0 0 100% 0)' }}
                        animate={{ clipPath: 'inset(0 0 0% 0)' }}
                        exit={{ clipPath: 'inset(0 0 100% 0)' }}
                        transition={{ duration: 0.6, ease }}
                        className="lg:hidden fixed inset-0 z-40 flex flex-col justify-between bg-(--background) px-5 sm:px-10 pt-28 pb-10"
                    >
                        <nav aria-label="Mobile">
                            <ul className="flex flex-col gap-1">
                                {navLinks.map((link, i) => (
                                    <li key={link.name} className="overflow-hidden">
                                        <motion.a
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            initial={{ y: '100%' }}
                                            animate={{ y: 0 }}
                                            transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease }}
                                            className="block py-1 text-fg"
                                        >
                                            <span className={`text-4xl sm:text-5xl tracking-[-0.03em] ${i % 2 ? 'font-display italic' : 'font-black'}`}>{link.name}</span>
                                        </motion.a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <a
                            href="/portfolio/Antra_Resume.pdf"
                            data-track="resume-menu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="self-start rounded-full bg-pink px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-ink"
                        >
                            View resume <span aria-hidden>↗</span>
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
