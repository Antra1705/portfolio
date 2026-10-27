'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { formatDay, monthOf, type Week } from '../lib/github';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const label = (count: number, date: string, unit: string) =>
    `${count === 0 ? 'No' : count} ${unit}${count === 1 ? '' : 's'} on ${formatDay(date)}`;

// The classic GitHub calendar: one column per week, Sunday at the top.
// Centred in its row; scrolls sideways inside its own box on narrow screens, starting at the newest week.
const ContributionGrid = ({ weeks, unit = 'contribution' }: { weeks: Week[]; unit?: string }) => {
    const scroller = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = scroller.current;
        if (el) el.scrollLeft = el.scrollWidth;
    }, [weeks]);

    // A month label sits over the first week of each month. Like GitHub, a label is
    // skipped when the next one starts within two weeks, so they never collide.
    const months = useMemo(() => {
        const monthOfWeek = weeks.map((week) => {
            const first = week.find(Boolean);
            return first ? monthOf(first.date) : '';
        });
        const starts = monthOfWeek.map((month, w) => !!month && month !== monthOfWeek[w - 1]);
        return monthOfWeek.map((month, w) =>
            starts[w] && !starts.slice(w + 1, w + 3).includes(true) ? month : ''
        );
    }, [weeks]);

    return (
        <div ref={scroller} className="overflow-x-auto pb-2 [--cell:11px] md:[--cell:14px] lg:[--cell:16px]">
            <div
                className="mx-auto grid w-max gap-[3px] md:gap-1"
                style={{
                    gridTemplateColumns: `auto repeat(${weeks.length}, var(--cell))`,
                    gridTemplateRows: `auto repeat(7, var(--cell))`,
                }}
            >
                <span />
                {months.map((month, w) => (
                    <span key={w} className="relative h-4 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                        {month && <span className="absolute left-0 top-0 whitespace-nowrap">{month}</span>}
                    </span>
                ))}

                {DAY_LABELS.map((day, d) => (
                    <React.Fragment key={d}>
                        <span className="pr-2 font-mono text-[10px] leading-(--cell) text-muted" style={{ gridColumn: 1, gridRow: d + 2 }}>
                            {day}
                        </span>
                        {weeks.map((week, w) => {
                            const cell = week[d];
                            return (
                                <span
                                    key={w}
                                    title={cell ? label(cell.count, cell.date, unit) : undefined}
                                    className="rounded-[3px] transition-transform duration-150 hover:scale-125"
                                    style={{
                                        gridColumn: w + 2,
                                        gridRow: d + 2,
                                        background: cell ? `var(--gh-${cell.level})` : 'transparent',
                                    }}
                                />
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default ContributionGrid;
