'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoMailOutline, IoLogoLinkedin, IoLogoGithub } from 'react-icons/io5';

const Contact = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const contactPetals = useMemo(() => {
        if (!mounted) return [];
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            startTop: Math.random() * 80,
            startLeft: Math.random() * 100,
            endLeft1: Math.random() * 100,
            endLeft2: Math.random() * 100,
            endTop: 95 + Math.random() * 5,
            duration: 6 + Math.random() * 8,
            delay: Math.random() * 10,
        }));
    }, [mounted]);

    return (
        <section id="contact" className="relative w-full min-h-[85vh] flex flex-col justify-center overflow-hidden">
            
            {/* MAIN FLEX CONTAINER for the Card */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex items-center justify-center pt-20 pb-40 overflow-visible">
                
                {/* Contact Card */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="w-full max-w-md glass rounded-[32px] p-10 border-white/30 backdrop-blur-3xl shadow-xl space-y-10"
                >
                    <div className="flex items-center gap-4">
                        <IoMailOutline className="text-3xl text-white" />
                        <h2 className="text-2xl font-semibold tracking-tight text-white">Contact</h2>
                    </div>

                    <div className="space-y-6">
                        <a href="mailto:antra.1705@gmail.com" className="flex items-center gap-4 group">
                            <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all">
                                <IoMailOutline className="text-xl text-white/90" />
                            </div>
                            <span className="text-[15px] font-medium text-white/70 group-hover:text-white transition-colors">
                                antra.1705@gmail.com
                            </span>
                        </a>

                        <a href="https://linkedin.com/in/antra-dev" target="_blank" className="flex items-center gap-4 group">
                            <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all">
                                <IoLogoLinkedin className="text-xl text-white/90" />
                            </div>
                            <span className="text-[15px] font-medium text-white/70 group-hover:text-white transition-colors">
                                www.linkedin.com/in/antra-dev
                            </span>
                        </a>

                        <a href="https://github.com/Antra1705" target="_blank" className="flex items-center gap-4 group">
                            <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all">
                                <IoLogoGithub className="text-xl text-white/90" />
                            </div>
                            <span className="text-[15px] font-medium text-white/70 group-hover:text-white transition-colors">
                                https://github.com/Antra1705
                            </span>
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* CHERRY BLOSSOM TREE - LEFT (flipped horizontally) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, x: -100, scaleX: -1 }}
                whileInView={{ opacity: 1, scale: 1, x: 0, scaleX: -1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute pointer-events-none z-10"
                style={{
                    bottom: '16px',
                    left: '-1%',
                    width: '50%',
                    maxWidth: '380px',
                }}
            >
                <img 
                    src="/cherryblossom.png" 
                    alt="Cherry Blossom Tree" 
                    className="w-full h-auto drop-shadow-2xl" 
                    style={{ display: 'block' }}
                />
            </motion.div>

            {/* CHERRY BLOSSOM TREE - RIGHT */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, x: 100 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute pointer-events-none z-10"
                style={{
                    bottom: '16px',
                    right: '-1%',
                    width: '50%',
                    maxWidth: '380px',
                }}
            >
                <img 
                    src="/cherryblossom.png" 
                    alt="Cherry Blossom Tree" 
                    className="w-full h-auto drop-shadow-2xl" 
                    style={{ display: 'block' }}
                />
            </motion.div>

            {/* Pink Footer Bar */}
            <div className="absolute bottom-0 left-0 w-full bg-[#F2AEBC] py-2.5 flex justify-center items-center z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.08)]">
                <p className="text-white font-semibold text-xl tracking-tight drop-shadow-sm">
                    made with &lt;3 by Antra
                </p>
            </div>
            
            {/* Tiny falling petals */}
            {mounted && (
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    {contactPetals.map((petal) => (
                        <motion.img
                            key={petal.id}
                            src="/petal.png"
                            initial={{ 
                                top: `${petal.startTop}%`, 
                                left: `${petal.startLeft}%`,
                                opacity: 0,
                                rotate: 0
                            }}
                            animate={{ 
                                left: [`${petal.endLeft1}%`, `${petal.endLeft2}%`],
                                top: `${petal.endTop}%`,
                                opacity: [0, 0.4, 0],
                                rotate: 360
                            }}
                            transition={{ 
                                duration: petal.duration, 
                                repeat: Infinity,
                                ease: "linear",
                                delay: petal.delay
                            }}
                            className="absolute w-2"
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default Contact;