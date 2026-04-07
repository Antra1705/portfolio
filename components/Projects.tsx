'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IoFolderOpenOutline, IoLogoGithub, IoOpenOutline } from 'react-icons/io5';

const projects = [
    {
        title: "CSS-Lab",
        desc: "An interactive environment for experimenting with advanced CSS layouts, animations, and modern UI components.",
        tech: ["React", "Tailwind", "CSS3", "Vercel"],
        link: "https://css-lab-pi.vercel.app/",
        github: "https://github.com/shivamsaini124/CSS-Lab"
    },
    {
        title: "AlgoRacer",
        desc: "A high-performance algorithm visualizer featuring real-time racing simulations for sorting and pathfinding algorithms.",
        tech: ["Vite", "React", "Tailwind", "Algorithms"],
        link: "https://antra1705.github.io/AlgoRacer/",
        github: "https://github.com/Antra1705/AlgoRacer"
    },
    {
        title: "ZerodhaClone",
        desc: "A high-fidelity clone of the Zerodha trading platform, featuring interactive dashboards, real-time charts, and order placement logic.",
        tech: ["React", "Express", "Node.js", "Socket.io"],
        link: "https://zerodha-clone-antra.vercel.app/",
        github: "https://github.com/Antra1705/ZerodhaClone"
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
                            className="glass rounded-3xl p-8 hover:bg-[#FFFDE7]/10 transition-all flex flex-col h-full group"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <span className="text-[10px] font-bold px-3 py-1 bg-[#FFFDE7]/10 text-[#FFFDE7]/50 rounded-full">0{idx + 1}</span>
                                <div className="flex gap-4">
                                    {project.github && (
                                        <a href={project.github} target="_blank" className="p-2 border border-[#FFFDE7]/10 rounded-full hover:bg-[#FFFDE7]/20 transition-all">
                                            <IoLogoGithub className="text-xl text-[#FFFDE7]" />
                                        </a>
                                    )}
                                    {project.link && (
                                        <a href={project.link} target="_blank" className="p-2 border border-[#FFFDE7]/10 rounded-full hover:bg-[#FFFDE7]/20 transition-all">
                                            <IoOpenOutline className="text-xl text-[#FFFDE7]" />
                                        </a>
                                    )}
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
