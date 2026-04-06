'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Experience from '../components/Experience';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import FallingPetals from '../components/FallingPetals';

export default function Home() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        window.scrollTo(0, 0);
    }, []);

    if (!mounted) return null;

    return (
        <div className="relative min-h-screen bg-[#9BD0ED] text-[#FFFDE7] overflow-x-hidden">
            {/* Background Animations */}
            <FallingPetals />
            
            {/* Main Content */}
            <Navbar />
            <main className="relative z-10 flex flex-col items-center w-full">
                <Hero />
                <About />
                <Skills />
                <Experience />
                <Projects />
                <Contact />
            </main>

            {/* Bottom Accent Decor */}
            <div className="fixed bottom-0 left-0 w-full h-1 bg-[#F2AEBC] z-50 pointer-events-none opacity-50" />
        </div>
    );
}
