'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Terminal from '../components/Terminal';
import About from '../components/About';
import Experience from '../components/Experience';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import FallingPetals from '../components/FallingPetals';

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const root = document.documentElement;
        const color = theme === 'light' ? '#9BD0ED' : '#021D38';
        root.style.setProperty('--background', color);
    }, [theme]);

    useEffect(() => {
        setMounted(true);
        window.scrollTo(0, 0);
    }, []);

    if (!mounted) return null;

    return (
        <div 
            className="relative min-h-screen transition-colors duration-700 text-[#FFFDE7] overflow-x-hidden"
            style={{ backgroundColor: theme === 'light' ? '#9BD0ED' : '#021D38' }}
        >
            {/* Background Animations */}
            <FallingPetals />
            
            {/* Main Content */}
            <Navbar />
            <main className="relative z-10 flex flex-col items-center w-full">
                <Hero />
                <Terminal onToggleTheme={toggleTheme} currentTheme={theme} />
                <About />
                <Skills />
                <Experience theme={theme} />
                <Projects />
                <Contact />
            </main>

            {/* Bottom Accent Decor */}
            <div className="fixed bottom-0 left-0 w-full h-1 bg-[#F2AEBC] z-50 pointer-events-none opacity-50" />
        </div>
    );
}
