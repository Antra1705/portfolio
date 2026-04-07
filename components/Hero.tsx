'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IoLogoGithub, IoLogoLinkedin } from 'react-icons/io5';

const Hero = () => {
    return (
        <section id="home" className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
            <div className="relative z-10 text-center px-6">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
                    className="text-[120px] sm:text-[200px] font-black leading-none tracking-tighter text-[#FFFDE7]/90 drop-shadow-2xl"
                >
                    Antra
                </motion.h1>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="flex flex-col items-center gap-4 -mt-2"
                >
                    <p className="text-[14px] sm:text-[18px] uppercase tracking-[0.4em] font-medium text-[#FFFDE7]/50 max-w-lg text-center leading-relaxed">
                        Designer, Web Developer <br /> & AI Engineer
                    </p>
                    <div className="flex gap-6 mt-8">
                        <a href="https://github.com" className="text-2xl text-[#FFFDE7]/40 hover:text-[#FFFDE7] transition-all hover:scale-110">
                            <IoLogoGithub />
                        </a>
                        <a href="https://linkedin.com" className="text-2xl text-[#FFFDE7]/40 hover:text-[#FFFDE7] transition-all hover:scale-110">
                            <IoLogoLinkedin />
                        </a>
                    </div>
                </motion.div>

                <motion.a
                    href="/portfolio/Antra_Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="mt-16 px-10 py-3 rounded-full bg-[#F2AEBC]/30 border border-[#F2AEBC]/50 text-[#FFFDE7] font-bold text-[11px] uppercase tracking-widest hover:bg-[#F2AEBC] hover:border-transparent transition-all backdrop-blur-md inline-block shadow-lg active:scale-95"
                >
                    Resume
                </motion.a>
            </div>

        </section>
    );
};

export default Hero;
