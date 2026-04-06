'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IoCodeSlashOutline, IoLogoHtml5, IoLogoCss3 } from 'react-icons/io5';
import { 
    SiFigma, SiPython, SiBootstrap, 
    SiTailwindcss, SiJavascript, SiReact, SiNextdotjs,
    SiNodedotjs, SiExpress, SiMongodb, SiNumpy, SiPandas,
    SiMysql, SiTypescript, SiGit, SiCplusplus
} from 'react-icons/si';
import { FaJava, FaC } from 'react-icons/fa6';
import { TbChartDots } from 'react-icons/tb';
import { BsDatabase } from 'react-icons/bs';

const skills = [
    { name: "Figma", icon: SiFigma },
    { name: "Python", icon: SiPython },
    { name: "HTML", icon: IoLogoHtml5 },
    { name: "CSS", icon: IoLogoCss3 },
    { name: "Bootstrap", icon: SiBootstrap },
    { name: "Tailwind", icon: SiTailwindcss },
    { name: "Javascript", icon: SiJavascript },
    { name: "React", icon: SiReact },
    { name: "Next.js", icon: SiNextdotjs },
    { name: "Node.js", icon: SiNodedotjs },
    { name: "Express", icon: SiExpress },
    { name: "MongoDB", icon: SiMongodb },
    { name: "Java", icon: FaJava },
    { name: "C", icon: FaC },
    { name: "C++", icon: SiCplusplus },
    { name: "NumPy", icon: SiNumpy },
    { name: "Pandas", icon: SiPandas },
    { name: "SQL", icon: BsDatabase },
    { name: "MySQL", icon: SiMysql },
    { name: "Matplotlib", icon: TbChartDots },
    { name: "Typescript", icon: SiTypescript },
    { name: "git", icon: SiGit },
];

const Skills = () => {
    return (
        <section id="skills" className="w-full py-32 px-6 flex flex-col items-center">
            <div className="max-w-5xl w-full">
                <div className="flex items-center gap-2 mb-12">
                    <IoCodeSlashOutline className="text-2xl text-[#FFFDE7]/80" />
                    <h2 className="text-2xl font-bold tracking-tight text-[#FFFDE7]">Skills</h2>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {skills.map((skill, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.03 }}
                            className="group flex flex-col items-center gap-2"
                        >
                            <div className="w-full aspect-square flex items-center justify-center glass rounded-2xl group-hover:bg-[#F2AEBC]/20 transition-all duration-300 transform group-hover:-translate-y-1 cursor-pointer">
                                <skill.icon className="text-3xl sm:text-4xl text-[#FFFDE7]/80" />
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#FFFDE7]/50 leading-none text-center">{skill.name}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;
