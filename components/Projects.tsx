'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IoFolderOpenOutline, IoLogoGithub, IoOpenOutline } from 'react-icons/io5';

const projects = [
    {
        title: "AI Design System",
        desc: "Automated design token generation using neural networks.",
        tech: ["Python", "TensorFlow", "React"],
        github: "https://github.com"
    },
    {
        title: "Glassmorphic UI Kit",
        desc: "A premium library for building Apple-style web interfaces.",
        tech: ["TypeScript", "Tailwind", "Framer"],
        github: "https://github.com"
    },
    {
        title: "Sakura CMS",
        desc: "Lightweight content management system for creative portfolios.",
        tech: ["Next.js", "Prisma", "PostgreSQL"],
        github: "https://github.com"
    }
];

const Projects = () => {
    return (
        <section id="projects" className="w-full py-32 px-6 flex flex-col items-center">
            <div className="max-w-6xl w-full">
                <div className="flex items-center gap-4 mb-16 px-4">
                    <IoFolderOpenOutline className="text-3xl text-[#FFFDE7]/80" />
                    <h2 className="text-3xl font-black tracking-tight text-[#FFFDE7]">Projects</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass rounded-3xl p-8 hover:bg-white/10 transition-all flex flex-col h-full group"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <span className="text-[10px] font-bold px-3 py-1 bg-white/10 text-white/50 rounded-full font-mono">0{idx + 1}</span>
                                <div className="flex gap-4">
                                    <a href={project.github} target="_blank" className="p-2 border border-white/10 rounded-full hover:bg-white/20 transition-all">
                                        <IoLogoGithub className="text-xl text-[#FFFDE7]" />
                                    </a>
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-black mb-4 text-[#FFFDE7]">{project.title}</h3>
                            <p className="text-[#FFFDE7]/70 font-medium mb-12 flex-grow leading-relaxed">{project.desc}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-auto">
                                {project.tech.map(t => (
                                    <span key={t} className="text-[9px] font-bold px-2 py-1 bg-[#F2AEBC]/10 text-[#F2AEBC] border border-[#F2AEBC]/20 rounded-md uppercase">{t}</span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Projects;
