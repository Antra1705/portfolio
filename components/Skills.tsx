'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IoLogoHtml5, IoLogoCss3 } from 'react-icons/io5';
import {
    SiFigma, SiPython, SiBootstrap,
    SiTailwindcss, SiJavascript, SiReact, SiNextdotjs,
    SiNodedotjs, SiExpress, SiMongodb, SiNumpy, SiPandas,
    SiMysql, SiTypescript, SiGit, SiCplusplus,
    SiFastapi, SiFlask, SiPostgresql, SiSocketdotio, SiVite,
    SiShadcnui, SiZod, SiJsonwebtokens, SiScikitlearn, SiOpencv,
    SiMediapipe, SiStreamlit, SiGooglegemini, SiDiscorddotjs,
    SiVercel, SiRender, SiGithubactions, SiPostman
} from 'react-icons/si';
import { FaJava, FaC } from 'react-icons/fa6';
import { TbChartDots, TbBrain, TbWaveSine } from 'react-icons/tb';
import { BsDatabase } from 'react-icons/bs';
import SectionHeading from './SectionHeading';

const groups = [
    {
        name: "Languages",
        items: [
            { name: "Python", icon: SiPython },
            { name: "JavaScript", icon: SiJavascript },
            { name: "TypeScript", icon: SiTypescript },
            { name: "Java", icon: FaJava },
            { name: "C", icon: FaC },
            { name: "C++", icon: SiCplusplus },
            { name: "SQL", icon: BsDatabase },
        ],
    },
    {
        name: "Frontend",
        items: [
            { name: "React", icon: SiReact },
            { name: "Next.js", icon: SiNextdotjs },
            { name: "Vite", icon: SiVite },
            { name: "Tailwind", icon: SiTailwindcss },
            { name: "shadcn/ui", icon: SiShadcnui },
            { name: "Zod", icon: SiZod },
            { name: "Bootstrap", icon: SiBootstrap },
            { name: "HTML", icon: IoLogoHtml5 },
            { name: "CSS", icon: IoLogoCss3 },
        ],
    },
    {
        name: "Backend",
        items: [
            { name: "Node.js", icon: SiNodedotjs },
            { name: "Express", icon: SiExpress },
            { name: "FastAPI", icon: SiFastapi },
            { name: "Flask", icon: SiFlask },
            { name: "Socket.io", icon: SiSocketdotio },
            { name: "JWT", icon: SiJsonwebtokens },
            { name: "Discord.js", icon: SiDiscorddotjs },
        ],
    },
    {
        name: "Databases",
        items: [
            { name: "PostgreSQL", icon: SiPostgresql },
            { name: "MongoDB", icon: SiMongodb },
            { name: "MySQL", icon: SiMysql },
        ],
    },
    {
        name: "Data & ML",
        items: [
            { name: "NumPy", icon: SiNumpy },
            { name: "Pandas", icon: SiPandas },
            { name: "Matplotlib", icon: TbChartDots },
            { name: "Scikit-learn", icon: SiScikitlearn },
            { name: "OpenCV", icon: SiOpencv },
            { name: "MediaPipe", icon: SiMediapipe },
            { name: "Librosa", icon: TbWaveSine },
            { name: "Streamlit", icon: SiStreamlit },
        ],
    },
    {
        name: "AI & LLMs",
        items: [
            { name: "Gemini", icon: SiGooglegemini },
            { name: "Groq", icon: TbBrain },
        ],
    },
    {
        name: "Tools",
        items: [
            { name: "Git", icon: SiGit },
            { name: "GitHub Actions", icon: SiGithubactions },
            { name: "Vercel", icon: SiVercel },
            { name: "Render", icon: SiRender },
            { name: "Postman", icon: SiPostman },
            { name: "Figma", icon: SiFigma },
        ],
    },
];

const Skills = () => {
    return (
        <section id="skills" className="w-full px-5 sm:px-10 py-28 sm:py-40">
            <div className="mx-auto max-w-[1360px]">
                <SectionHeading eyebrow="What I work with" title={<>The <em>toolkit</em></>} />

                <div className="border-t border-fg/15">
                    {groups.map((group, idx) => (
                        <motion.div
                            key={group.name}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
                            className="group/row grid gap-5 border-b border-fg/15 py-6 sm:py-8 md:grid-cols-12 md:gap-8"
                        >
                            <div className="md:col-span-4 flex items-baseline gap-4">
                                <span className="font-mono text-[11px] tracking-[0.18em] text-muted">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <h3 className="font-display italic text-2xl sm:text-3xl text-fg transition-colors duration-300 group-hover/row:text-accent">
                                    {group.name}
                                </h3>
                                <span className="font-mono text-[11px] text-fg/35">({group.items.length})</span>
                            </div>
                            <ul className="md:col-span-8 flex flex-wrap gap-x-6 gap-y-3 sm:gap-x-8 md:pt-2">
                                {group.items.map((skill) => (
                                    <li
                                        key={skill.name}
                                        className="group/skill inline-flex items-center gap-2.5 text-base sm:text-lg font-semibold tracking-[-0.01em] text-fg/80 transition-colors duration-200 hover:text-accent"
                                    >
                                        <skill.icon aria-hidden className="text-sm sm:text-base text-muted transition-all duration-300 group-hover/skill:text-accent group-hover/skill:-rotate-12" />
                                        {skill.name}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;
