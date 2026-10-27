'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Experience from '../components/Experience';
import Skills from '../components/Skills';
import Patents from '../components/Patents';
import Projects from '../components/Projects';
import CodingActivity from '../components/CodingActivity';
import Contact from '../components/Contact';
import FallingPetals from '../components/FallingPetals';
import CursorGlow from '../components/CursorGlow';
import ScrollProgress from '../components/ScrollProgress';
import Marquee from '../components/Marquee';
import Analytics from '../components/Analytics';
import { MotionConfig } from 'framer-motion';
import { Preloader } from '../components/Preloader';

type Theme = 'light' | 'dark';

// The saved theme, read once on the client (the page renders nothing on the server)
const readSavedTheme = (): Theme => {
    if (typeof window === 'undefined') return 'dark';
    try {
        const saved = localStorage.getItem('theme');
        return saved === 'light' ? 'light' : 'dark';
    } catch {
        return 'dark';
    }
};

// false while prerendering and hydrating, true once running in the browser.
// Many sections read window/matchMedia as they set up, so the page waits for this.
const noopSubscribe = () => () => {};
const useIsClient = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

export default function Home() {
    const mounted = useIsClient();
    const [theme, setTheme] = useState<Theme>(readSavedTheme);
    // the opening: the lantern is lit, its light fades onto the page, then it's gone
    const [revealed, setRevealed] = useState(false); // the light has started to fade: the hero plays its entrance
    const [intro, setIntro] = useState(true); // the preloader is up

    // Once it's gone, go to the section the link named, if any (the page opens at the top)
    const finishIntro = () => {
        setIntro(false);
        const target = window.location.hash && document.querySelector(window.location.hash);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    };

    const applyTheme = (next: Theme) => {
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem('theme', next); } catch {}
    };

    // `origin` is the point the new theme grows out of (the toggle button);
    // without it, or without View Transitions, the theme just swaps.
    const toggleTheme = (origin?: { x: number; y: number }) => {
        const next = theme === 'light' ? 'dark' : 'light';
        const swap = () => {
            applyTheme(next);
            flushSync(() => setTheme(next));
        };
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!document.startViewTransition || reduced) {
            swap();
            return;
        }
        const x = origin?.x ?? window.innerWidth / 2;
        const y = origin?.y ?? window.innerHeight / 2;
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        document.startViewTransition(swap).ready.then(() => {
            document.documentElement.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' }
            );
        });
    };

    // Keep the page's theme attribute in step with the state (the CSS keys off it)
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    // Always open at the top, not wherever the browser restored the scroll to
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Until the scripts run, the page is its background colour, already in the visitor's theme
    if (!mounted) return <div className="fixed inset-0 bg-(--background)" />;

    return (
        <MotionConfig reducedMotion="user">
            <div className="relative min-h-screen bg-(--background) text-fg overflow-x-clip">
                {/* Background Animations */}
                <FallingPetals />
                <CursorGlow />
                <ScrollProgress />
                <Analytics />
                
                {/* Main Content */}
                <Navbar />
                <main className="relative z-10 flex flex-col items-center w-full">
                    {/* the hero waits for the preloader, so its entrance plays as the light fades */}
                    {revealed ? <Hero theme={theme} onToggleTheme={toggleTheme} /> : <div className="min-h-[100svh] w-full" />}
                    <Marquee />
                    <About />
                    <Skills />
                    <Experience />
                    <Patents />
                    <Projects />
                    <CodingActivity />
                    <Contact />
                </main>

                {intro && <Preloader onReveal={() => setRevealed(true)} onDone={finishIntro} />}

                {/* Paper grain over everything */}
                <div aria-hidden className="grain" />
            </div>
        </MotionConfig>
    );
}
