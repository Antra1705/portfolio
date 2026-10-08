'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';

const experienceData = [
    {
        title: "Full Stack Developer Intern",
        company: "SmartSkale",
        period: "May - Jul 2026",
        desc: "Built role-based access control across 2 production HRMS portals with React, TypeScript, and FastAPI, and shipped user management workflows for role activation, audit logging, and password reset."
    },
    {
        title: "Open Source Contributor",
        company: "GirlScript Summer of Code (GSSoC)",
        period: "May - Aug 2026",
        desc: "Merged 36 pull requests across 20 repositories in React, Next.js, Python, and FastAPI codebases, restored a deleted 454-line AuthService in story-spark-ai (1,000+ forks), and built NyayaVanni, an AI-powered legal document analysis Chrome extension."
    },
    {
        title: "Executive Co-Creative Head",
        company: "Indian Society for Technical Education",
        period: "2026 - Present",
        desc: "Spearheading creative strategy and design initiatives for technical and cultural events within the society."
    },
    {
        title: "Web Developer",
        company: "Mozilla Firefox Club",
        period: "2025 - Present",
        desc: "Developing community platforms with a focus on open-source web technologies and frontend performance."
    },
    {
        title: "Web Developer & Designer",
        company: "Indian Society for Technical Education",
        period: "2025 - Present",
        desc: "Leading technical implementation and creative direction for interactive web platforms."
    }
];

const Experience = () => {
    return (
        <section id="experience" className="w-full px-5 sm:px-10 py-28 sm:py-40">
            <div className="mx-auto max-w-[1360px]">
                <SectionHeading eyebrow="Where I've worked" title={<>Where I’ve <em>worked</em></>} />

                <ol className="border-t border-fg/15">
                    {experienceData.map((item, idx) => (
                        <motion.li
                            key={`${item.company}-${item.title}`}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
                            className="group relative grid gap-4 border-b border-fg/15 py-8 sm:py-10 md:grid-cols-12 md:gap-8"
                        >
                            {/* Pink rule that draws across on hover */}
                            <span aria-hidden className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />

                            <div className="md:col-span-3 flex items-center gap-4 md:flex-col md:items-start md:gap-2 font-mono text-[11px] uppercase tracking-[0.18em] md:pt-1.5">
                                <span className="text-accent">/{String(idx + 1).padStart(2, '0')}</span>
                                <span className="text-muted">{item.period}</span>
                            </div>
                            <div className="md:col-span-5">
                                <h3 className="text-2xl sm:text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-fg transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:group-hover:translate-x-3">
                                    {item.title}
                                </h3>
                                <p className="mt-1.5 font-display italic text-lg sm:text-xl text-accent">{item.company}</p>
                            </div>
                            <p className="md:col-span-4 text-base leading-relaxed text-fg/65 md:pt-1.5">{item.desc}</p>
                        </motion.li>
                    ))}
                </ol>
            </div>
        </section>
    );
};

export default Experience;
