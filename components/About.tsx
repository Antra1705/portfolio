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
                        I’m Antra, a web developer and designer focused on creating modern, responsive, and visually engaging web applications. I blend design thinking with development skills to deliver seamless user experiences.
                    </p>
                    <p className="text-lg leading-relaxed font-medium text-[#FFFDE7]/70 mb-6">
                        I’m also expanding my skill set in AI/ML and data science at a foundational level, with an interest in integrating intelligent features into web-based products.
                    </p>
                    <p className="text-lg leading-relaxed font-medium text-[#FFFDE7]/70">
                        Driven by curiosity and continuous learning, I strive to build solutions that are both practical and forward-looking.
                    </p>
                </div>
            </motion.div>
        </section>
    );
};

export default About;
