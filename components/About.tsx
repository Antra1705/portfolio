'use client';

import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <section id="about" className="w-full py-32 px-6 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl glass rounded-3xl p-12 relative overflow-hidden"
            >
                <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-8 tracking-tight text-[#FFFDE7]">About Me</h2>
                    <p className="text-lg leading-relaxed font-medium text-[#FFFDE7]/70 mb-6">
                        I am Antra, a designer who specializes in blending high-fidelity aesthetics with complex engineering workflows. My passion lies at the intersection of <span className="text-[#FFFDE7] font-bold">visual design</span> and <span className="text-[#FFFDE7] font-bold">AI engineering</span>.
                    </p>
                    <p className="text-lg leading-relaxed font-medium text-[#FFFDE7]/70">
                        Whether architecture-level systems or pixel-perfect interfaces, I believe in building technology that feels as natural as nature itself. My work is inspired by minimalist structures and the efficiency of automated processes.
                    </p>
                </div>
            </motion.div>
        </section>
    );
};

export default About;
