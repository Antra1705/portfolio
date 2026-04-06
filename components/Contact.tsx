'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IoMailOutline, IoLogoLinkedin, IoLogoGithub } from 'react-icons/io5';

const Contact = () => {
    return (
        <section id="contact" className="relative w-full min-h-[85vh] flex flex-col justify-center overflow-hidden">
            
            {/* MAIN FLEX CONTAINER for the Card */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex items-center justify-start pt-20 pb-40 overflow-visible">
                
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

            {/* TREE - Pushed further right and anchored to absolute bottom */}
            <motion.div
                initial={{ opacity: 0, scale: 1, x: 100 }}
                whileInView={{ opacity: 1, scale: 1.1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute bottom-0 right-[-3%] md:right-[-1%] w-full max-w-[850px] pointer-events-none z-0"
            >
                <img 
                    src="/cherryblossom.png" 
                    alt="Cherry Blossom Tree" 
                    className="w-full h-auto drop-shadow-2xl translate-y-[15px]" 
                />
            </motion.div>

            {/* Pink Footer Bar - High z-index to overlap bottom of tree perfectly */}
            <div className="absolute bottom-0 left-0 w-full bg-[#F2AEBC] py-2.5 flex justify-center items-center z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.08)]">
                <p className="text-white font-semibold text-xl tracking-tight drop-shadow-sm">
                    made with &lt;3 by Antra
                </p>
            </div>
            
            {/* Tiny falling petals */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.img
                        key={i}
                        src="/petal.png"
                        initial={{ 
                            top: `${Math.random() * 80}%`, 
                            left: `${Math.random() * 100}%`,
                            opacity: 0,
                            rotate: 0
                        }}
                        animate={{ 
                            left: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                            top: `${95 + Math.random() * 5}%`,
                            opacity: [0, 0.4, 0],
                            rotate: 360
                        }}
                        transition={{ 
                            duration: 6 + Math.random() * 8, 
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 10
                        }}
                        className="absolute w-2"
                    />
                ))}
            </div>
        </section>
    );
};

export default Contact;