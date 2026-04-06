'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    IoLogoJavascript, IoLogoPython, IoLogoReact, IoLogoNodejs, 
    IoLogoDocker, IoCubeOutline, IoCloudDoneOutline, IoShieldCheckmarkOutline,
    IoInfiniteOutline, IoBrowsersOutline, IoColorPaletteOutline, IoCodeSlashOutline,
    IoServerOutline, IoGitBranchOutline, IoTerminalOutline,
    IoSparklesOutline, IoHardwareChipOutline, IoLayersOutline, IoFlaskOutline
} from 'react-icons/io5';
import { FaDatabase } from 'react-icons/fa6';

const skills = [
    { name: "Python", icon: IoLogoPython },
    { name: "JavaScript", icon: IoLogoJavascript },
    { name: "React", icon: IoLogoReact },
    { name: "Node.js", icon: IoLogoNodejs },
    { name: "Docker", icon: IoLogoDocker },
    { name: "Kubernetes", icon: IoCubeOutline },
    { name: "AWS", icon: IoCloudDoneOutline },
    { name: "Terraform", icon: IoInfiniteOutline },
    { name: "Next.js", icon: IoBrowsersOutline },
    { name: "Tailwind", icon: IoColorPaletteOutline },
    { name: "DevOps", icon: IoGitBranchOutline },
    { name: "Microservices", icon: IoLayersOutline },
    { name: "Security", icon: IoShieldCheckmarkOutline },
    { name: "CI/CD", icon: IoGitBranchOutline },
    { name: "NoSQL", icon: FaDatabase },
    { name: "PostgreSQL", icon: IoServerOutline },
    { name: "AI/ML", icon: IoSparklesOutline },
    { name: "Generative AI", icon: IoHardwareChipOutline },
    { name: "Prototyping", icon: IoCodeSlashOutline },
    { name: "Webhooks", icon: IoTerminalOutline }
];

const Skills = () => {
    return (
        <section id="skills" className="w-full py-32 px-6 flex flex-col items-center">
            <h2 className="text-3xl font-black mb-16 tracking-tight text-[#FFFDE7] text-center">Skills</h2>
            <div className="max-w-6xl w-full grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-x-4 gap-y-12">
                {skills.map((skill, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="group flex flex-col items-center gap-3"
                    >
                        <div className="p-4 glass rounded-2xl group-hover:bg-[#F2AEBC]/20 transition-all duration-300 transform group-hover:-translate-y-1">
                            <skill.icon className="text-3xl text-[#FFFDE7]/80 cursor-pointer" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFFDE7]/40 leading-none text-center">{skill.name}</span>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Skills;
