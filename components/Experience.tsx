'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IoBriefcaseOutline } from 'react-icons/io5';

const experienceData = [
    {
        title: "Senior AI Engineer",
        company: "Innovation Hub",
        period: "2024 - Present",
        desc: "Leading a team of engineers to build scalable AI/ML pipelines and generative design tools.",
        tags: ["Python", "PyTorch", "Kubernetes"]
    },
    {
        title: "Full Stack Designer",
        company: "Creatives Lab",
        period: "2023 - 2024",
        desc: "Designed and implemented high-fidelity user experiences for consumer-facing web applications.",
        tags: ["React", "Figma", "Node.js"]
    }
];

const Experience = () => {
    return (
        <section id="experience" className="w-full py-32 px-6 flex flex-col items-center">
            <div className="max-w-4xl w-full">
                <div className="flex items-center gap-4 mb-16">
                    <IoBriefcaseOutline className="text-3xl text-[#FFFDE7]/80" />
                    <h2 className="text-3xl font-black tracking-tight text-[#FFFDE7]">Experience</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {experienceData.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="glass rounded-3xl p-8 hover:bg-white/10 transition-all group"
                        >
                            <span className="text-[10px] font-bold text-[#FFFDE7]/30 uppercase tracking-[0.2em] block mb-2">{item.period}</span>
                            <h3 className="text-2xl font-black mb-1 text-[#FFFDE7]">{item.title}</h3>
                            <p className="text-sm font-bold text-[#FFFDE7]/50 mb-4">{item.company}</p>
                            <p className="text-[#FFFDE7]/70 font-medium mb-6 leading-relaxed">{item.desc}</p>
                            <div className="flex flex-wrap gap-2">
                                {item.tags.map(tag => (
                                    <span key={tag} className="text-[10px] px-3 py-1 bg-[#F2AEBC]/10 border border-[#F2AEBC]/20 rounded-full text-[#F2AEBC] font-bold uppercase">{tag}</span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;
