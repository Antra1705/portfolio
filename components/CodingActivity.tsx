'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import ContributionGrid from './ContributionGrid';
import type { GardenDay, GardenWeek, HoverInfo } from './ContributionGarden';
import { hasWebGL, useGardenColors } from '../lib/gardenColors';
import { GITHUB_URL, contributionStats, fetchContributions, formatDay, toWeeks, type Day } from '../lib/github';
import { LEETCODE_URL, fetchLeetCode, type LeetCodeData } from '../lib/leetcode';

// three.js is ~600 KB, so the garden is its own chunk, fetched only when this section is near
const ContributionGarden = dynamic(() => import('./ContributionGarden'), { ssr: false });

type Load<T> = { status: 'pending' } | { status: 'ready'; data: T } | { status: 'error' };

const plural = (n: number, word: string) => `${n || 'No'} ${word}${n === 1 ? '' : 's'}`;

// One garden day per date: GitHub's calendar sets the dates, LeetCode's counts are matched by date
const toGardenWeeks = (github: Day[] | null, leetcode: Day[] | null): GardenWeek[] => {
    const base = github ?? leetcode;
    if (!base) return [];
    const lcByDate = new Map((leetcode ?? []).map((d) => [d.date, d]));
    const ghByDate = new Map((github ?? []).map((d) => [d.date, d]));
    return toWeeks(base).map((week) => week.map((d): GardenDay | null => d && ({
        date: d.date,
        github: ghByDate.get(d.date) ?? null,
        leetcode: lcByDate.get(d.date) ?? null,
    })));
};


// Loads a source once the section is near, then keeps it
const useLazyData = <T,>(enabled: boolean, load: () => Promise<T>) => {
    const [state, setState] = useState<Load<T>>({ status: 'pending' });
    const started = useRef(false);
    useEffect(() => {
        if (!enabled || started.current) return;
        started.current = true;
        load().then((data) => setState({ status: 'ready', data })).catch(() => setState({ status: 'error' }));
    }, [enabled, load]);
    return state;
};

// Header over each calendar, like GitHub's "N contributions in the last year"
const GridHeader = ({ title, summary, detail, href, handle, track }: { title: string; summary: React.ReactNode; detail: React.ReactNode; href: string; handle: string; track: string }) => (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-xl sm:text-2xl tracking-[-0.02em] text-fg">
            <span className="font-bold">{title}</span>
            <span className="font-display text-fg/70"> · {summary}</span>
        </h3>
        <div className="flex flex-wrap items-center gap-x-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            <span>{detail}</span>
            <a href={href} target="_blank" rel="noopener noreferrer" data-track={track} className="inline-flex min-h-11 items-center gap-1.5 text-fg transition-colors hover:text-accent">
                {handle} <span aria-hidden>↗</span>
            </a>
        </div>
    </div>
);

const Unavailable = ({ label, href }: { label: string; href: string }) => (
    <div className="grid h-36 place-items-center rounded-2xl border border-dashed border-fg/20 px-6 text-center">
        <p className="text-base text-fg/70">
            Couldn’t load {label} activity right now.{' '}
            <a href={href} target="_blank" rel="noopener noreferrer" className="link-underline text-fg hover:text-accent">See it on {label} ↗</a>
        </p>
    </div>
);

const Placeholder = ({ className }: { className: string }) => <div className={`animate-pulse rounded-2xl bg-fg/5 ${className}`} />;

const CodingActivity = () => {
    const reduceMotion = useReducedMotion();
    const colors = useGardenColors();
    const section = useRef<HTMLElement>(null);
    const [near, setNear] = useState(false); // within reach: start loading
    const [onScreen, setOnScreen] = useState(false); // visible: keep the 3D scene rendering
    const [webgl] = useState(hasWebGL);
    const [narrow] = useState(() => window.matchMedia('(max-width: 767px)').matches);
    const [finePointer] = useState(() => window.matchMedia('(pointer: fine)').matches);
    const [hover, setHover] = useState<HoverInfo | null>(null);

    useEffect(() => {
        const el = section.current;
        if (!el) return;
        const nearObserver = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '600px 0px' });
        const visibleObserver = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
        nearObserver.observe(el);
        visibleObserver.observe(el);
        return () => {
            nearObserver.disconnect();
            visibleObserver.disconnect();
        };
    }, []);

    const github = useLazyData(near, fetchContributions);
    const leetcode = useLazyData<LeetCodeData>(near, fetchLeetCode);

    const githubWeeks = useMemo(() => (github.status === 'ready' ? toWeeks(github.data.days) : []), [github]);
    const leetcodeWeeks = useMemo(() => (leetcode.status === 'ready' ? toWeeks(leetcode.data.days) : []), [leetcode]);
    const githubStats = useMemo(() => (github.status === 'ready' ? contributionStats(github.data.days) : null), [github]);
    const leetcodeStats = useMemo(() => {
        if (leetcode.status !== 'ready') return null;
        const days = leetcode.data.days;
        return { ...contributionStats(days), submissions: days.reduce((n, d) => n + d.count, 0) };
    }, [leetcode]);

    // The garden waits for both sources to settle, then plants whatever loaded
    const settledBoth = github.status !== 'pending' && leetcode.status !== 'pending';
    const gardenAllWeeks = useMemo(() => toGardenWeeks(
        github.status === 'ready' ? github.data.days : null,
        leetcode.status === 'ready' ? leetcode.data.days : null,
    ), [github, leetcode]);
    // On phones the full year makes trees too small to read in 3D, so plant the last ~6 months
    const gardenWeeks = useMemo(() => (narrow ? gardenAllWeeks.slice(-26) : gardenAllWeeks), [gardenAllWeeks, narrow]);

    return (
        <section ref={section} id="activity" className="w-full px-5 sm:px-10 pt-28 sm:pt-40 pb-6 sm:pb-8">
            <div className="mx-auto max-w-[1360px]">
                <SectionHeading title={<>Built in <em>public</em></>} />

                {/* The garden: GitHub cherries and LeetCode jacarandas in one bed */}
                {webgl && (
                    <>
                        <div className="relative z-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                            <p>{narrow ? 'Last 6 months' : 'Last 12 months'} · busier days, fuller blossoms</p>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-hidden>
                                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: 'var(--garden-leaf-3)' }} />GitHub</span>
                                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: 'var(--garden-lc-3)' }} />LeetCode</span>
                                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--garden-fruit)' }} />Cherries = busiest days</span>
                                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-3.5 rounded-full" style={{ background: 'var(--garden-water)' }} />Pond = quiet stretch</span>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            className="relative -mx-5 sm:-mx-10"
                        >
                            {!settledBoth ? (
                                <div className="px-5 sm:px-10 py-6"><Placeholder className="h-[460px] sm:h-[600px]" /></div>
                            ) : gardenWeeks.length === 0 ? (
                                <div className="px-5 sm:px-10 py-8"><Unavailable label="GitHub" href={GITHUB_URL} /></div>
                            ) : (
                                <div
                                    role="img"
                                    aria-label="3D garden of the last year: each day is a spot in the bed; GitHub activity grows pink cherry trees and LeetCode activity grows periwinkle trees, bigger and fuller on busier days"
                                    // All four edges fade out so the scene never ends in a hard line against the page
                                    style={{
                                        maskImage: 'linear-gradient(to bottom, transparent, #000 7%, #000 92%, transparent), linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)',
                                        maskComposite: 'intersect',
                                        WebkitMaskComposite: 'source-in',
                                    }}
                                    data-cursor="none"
                                    className={`relative -my-6 sm:-my-14 h-[460px] sm:h-[700px] ${finePointer ? 'cursor-none' : ''}`}
                                >
                                    <ContributionGarden
                                        weeks={gardenWeeks}
                                        colors={colors}
                                        animate={!reduceMotion}
                                        cursorBird={finePointer}
                                        active={onScreen}
                                        onHover={setHover}
                                    />
                                    {hover && (
                                        <div
                                            className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg bg-ink px-3 py-2 text-xs text-cream shadow-xl"
                                            style={{ left: hover.x + 30, top: hover.y - 84 }}
                                        >
                                            {hover.quiet ? (
                                                // A pond: a stretch of days with nothing on either side
                                                <>
                                                    <p className="text-cream/60">
                                                        {hover.quiet.from === hover.quiet.to
                                                            ? formatDay(hover.quiet.from)
                                                            : `${formatDay(hover.quiet.from)} – ${formatDay(hover.quiet.to)}`} · {hover.quiet.days} quiet day{hover.quiet.days === 1 ? '' : 's'}
                                                    </p>
                                                    <p className="mt-0.5 flex gap-3 font-bold">
                                                        <span><span className="text-pink">●</span> No contributions</span>
                                                        <span><span className="text-sky">●</span> No submissions</span>
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-cream/60">{formatDay(hover.day.date)}</p>
                                                    <p className="mt-0.5 flex gap-3 font-bold">
                                                        {hover.day.github && <span><span className="text-pink">●</span> {plural(hover.day.github.count, 'contribution')}</span>}
                                                        {hover.day.leetcode && <span><span className="text-sky">●</span> {plural(hover.day.leetcode.count, 'submission')}</span>}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}

                {/* Calendars: GitHub, then LeetCode */}
                <div className="mt-10 space-y-14 pt-10">
                    <div>
                        <GridHeader
                            title="GitHub"
                            summary={github.status === 'ready' ? `${github.data.total} contributions in the last year` : '…'}
                            detail={githubStats ? <>Current streak {githubStats.current} · best day {githubStats.best?.count ?? 0}</> : null}
                            href={GITHUB_URL}
                            handle="@Antra1705"
                            track="github-activity-profile"
                        />
                        {github.status === 'error' ? <Unavailable label="GitHub" href={GITHUB_URL} />
                            : github.status === 'ready' ? <ContributionGrid weeks={githubWeeks} unit="contribution" />
                            : <Placeholder className="h-36" />}
                    </div>
                    <div>
                        <GridHeader
                            title="LeetCode"
                            summary={leetcodeStats ? `${leetcodeStats.submissions} submissions in the last year` : '…'}
                            detail={leetcode.status === 'ready'
                                ? <>{leetcode.data.solved.easy} easy · {leetcode.data.solved.medium} medium · {leetcode.data.solved.hard} hard · longest streak {leetcodeStats?.longest}</>
                                : null}
                            href={LEETCODE_URL}
                            handle="antra_1705"
                            track="leetcode-activity-profile"
                        />
                        {leetcode.status === 'error' ? <Unavailable label="LeetCode" href={LEETCODE_URL} />
                            : leetcode.status === 'ready' ? <ContributionGrid weeks={leetcodeWeeks} unit="submission" />
                            : <Placeholder className="h-36" />}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted" aria-hidden>
                    Less
                    {[0, 1, 2, 3, 4].map((l) => (
                        <span key={l} className="h-3 w-3 rounded-[3px]" style={{ background: `var(--gh-${l})` }} />
                    ))}
                    More
                </div>
            </div>
        </section>
    );
};

export default CodingActivity;
