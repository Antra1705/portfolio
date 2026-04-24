'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IoBriefcaseOutline, IoCodeOutline, IoLaptopOutline, IoTerminalOutline, IoColorPaletteOutline } from 'react-icons/io5';

const experienceData = [
    {
        title: "Executive Co-Creative Head",
        company: "Indian Society for Technical Education",
        period: "2026 - Present",
        desc: "Spearheading creative strategy and design initiatives for technical and cultural events within the society.",
        icon: <IoColorPaletteOutline />
    },
    {
        title: "Web Developer",
        company: "Mozilla Firefox Club",
        period: "2025 - Present",
        desc: "Developing community platforms with a focus on open-source web technologies and frontend performance.",
        icon: <IoLaptopOutline />
    },
    {
        title: "Web Developer & Designer",
        company: "Indian Society for Technical Education",
        period: "2025 - Present",
        desc: "Leading technical implementation and creative direction for interactive web platforms.",
        icon: <IoCodeOutline />
    }
];

const Experience = ({ theme = 'light' }: { theme?: 'light' | 'dark' }) => {
    return (
        <section id="experience" className="w-full py-32 px-6 flex flex-col items-center">
            <div className="max-w-6xl w-full">
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-20 md:justify-center">
                    <IoBriefcaseOutline className="text-3xl text-[#FFFDE7]/80" />
                    <h2 className="text-3xl font-black tracking-tight text-[#FFFDE7]">Experience</h2>
                </div>

                {/* Timeline Container */}
                <div className="relative">
                    {/* Central Line (Desktop) */}
                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-[#FFFDE7]/10" />

                    <div className="space-y-12 md:space-y-0">
                        {experienceData.map((item, idx) => {
                            const isOdd = idx % 2 !== 0;

                            return (
                                <div key={idx} className="relative md:flex md:justify-between md:items-center w-full">
                                    {/* Content Card */}
                                    <motion.div
                                        initial={{ opacity: 0, x: isOdd ? 50 : -50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                                        className={`md:w-[45%] ${isOdd ? 'md:ml-auto' : 'md:mr-auto'}`}
                                    >
                                        <div className="glass rounded-3xl p-8 hover:bg-[#FFFDE7]/10 transition-all group relative">
                                            {/* Date Badge */}
                                            <div className="absolute top-8 right-8 text-[10px] font-bold py-1 px-3 bg-[#FFFDE7]/10 text-[#FFFDE7]/60 rounded-full uppercase tracking-widest">
                                                {item.period}
                                            </div>
                                            
                                            <h3 className="text-2xl font-black mb-1 text-[#FFFDE7]">{item.title}</h3>
                                            <p className="text-sm font-bold text-[#F2AEBC] mb-6">{item.company}</p>
                                            <p className="text-[#FFFDE7]/70 font-medium leading-relaxed italic">
                                                "{item.desc}"
                                            </p>
                                        </div>
                                    </motion.div>

                                    {/* Timeline Marker (Desktop Only) */}
                                    <div className={`hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full border-4 items-center justify-center text-xl z-10 shadow-xl transition-all duration-500 ${
                                        theme === 'dark' 
                                        ? 'bg-[#F2AEBC]/20 border-[#F2AEBC]/40 text-[#F2AEBC] shadow-[0_0_15px_rgba(242,174,188,0.2)]' 
                                        : 'bg-[#9BD0ED] border-[#FFFDE7]/10 text-[#FFFDE7]'
                                    }`}>
                                        {item.icon}
                                    </div>
                                    
                                    {/* Mobile Marker */}
                                    <div className="md:hidden flex items-center gap-4 mb-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                                            theme === 'dark' 
                                            ? 'bg-[#F2AEBC]/20 text-[#F2AEBC] border border-[#F2AEBC]/30' 
                                            : 'bg-[#9BD0ED] text-[#FFFDE7]'
                                        }`}>
                                            {item.icon}
                                        </div>
                                        <div className="h-0.5 flex-grow bg-[#FFFDE7]/10" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Experience;
