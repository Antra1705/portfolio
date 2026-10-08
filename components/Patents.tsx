'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import Sakura from './Sakura';

const patentsData = [
    {
        title: "Microcontroller Synchronised Access Protocol via Fixed-Lattice Input with Coupled Electromechanical and Lumino-Acoustic Feedback",
        role: "Co-Inventor",
        office: "Indian Patent Office",
        number: "IN202641047706",
        status: "Published",
        date: "April 2026",
    }
];

// Round "published" seal whose text ring turns slowly
const Stamp = ({ id, label }: { id: string; label: string }) => (
    <div className="relative grid h-28 w-28 sm:h-36 sm:w-36 place-items-center rounded-full bg-pink text-ink shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
        <svg viewBox="0 0 100 100" aria-hidden className="stamp-spin absolute inset-0 h-full w-full">
            <defs>
                <path id={id} d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
            </defs>
            <text fontSize="8" fontFamily="var(--font-mono)" fill="currentColor" letterSpacing="1.5">
                <textPath href={`#${id}`} textLength="230" lengthAdjust="spacing">{label}</textPath>
            </text>
        </svg>
        <Sakura className="h-8 w-8 sm:h-10 sm:w-10" />
    </div>
);

const Patents = () => {
    return (
        <section id="patents" className="w-full px-5 sm:px-10 py-28 sm:py-40">
            <div className="mx-auto max-w-[1360px]">
                <SectionHeading eyebrow="What I've invented" title={<>Patent<em>ed</em></>} />

                {patentsData.map((item) => (
                    <motion.article
                        key={item.number}
                        initial={{ opacity: 0, y: 50, rotate: 1.5 }}
                        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="relative bg-card text-ink p-6 pt-10 sm:p-12 md:p-14 shadow-paper"
                    >
                        <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-b border-ink/15 pb-5 pr-24 sm:pr-36 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-ink/60">
                            <span>{item.office}</span>
                            <span>Application No. <span className="text-ink">{item.number}</span></span>
                        </div>

                        <h3 className="mt-8 sm:mt-12 max-w-4xl font-display text-[clamp(1.5rem,2.8vw,2.5rem)] leading-[1.15] tracking-[-0.01em]">
                            {item.title}
                        </h3>

                        <dl className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-3 gap-6 border-t border-ink/15 pt-6">
                            {[
                                { label: "Role", value: item.role },
                                { label: "Status", value: item.status },
                                { label: "Date", value: item.date },
                            ].map((field) => (
                                <div key={field.label}>
                                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50">{field.label}</dt>
                                    <dd className="mt-1.5 text-lg font-bold tracking-tight">{field.value}</dd>
                                </div>
                            ))}
                        </dl>

                        <motion.div
                            initial={{ scale: 1.6, opacity: 0, rotate: -30 }}
                            whileInView={{ scale: 1, opacity: 1, rotate: -12 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 18 }}
                            className="absolute -top-10 right-4 sm:-top-14 sm:right-12"
                        >
                            <Stamp id={`stamp-${item.number}`} label={`${item.status} · ${item.date} · India · `} />
                        </motion.div>
                    </motion.article>
                ))}
            </div>
        </section>
    );
};

export default Patents;
