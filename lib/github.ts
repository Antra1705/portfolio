// Public contribution data for the GitHub activity section. GitHub has no
// token-free API for this, so it comes from github-contributions-api.jogruber.de,
// which reads the public profile calendar and allows browser requests.
export const GITHUB_USER = 'Antra1705';
export const GITHUB_URL = `https://github.com/${GITHUB_USER}`;

export interface Day {
    date: string; // YYYY-MM-DD
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

export type Week = (Day | null)[];

export const fetchContributions = async (): Promise<{ days: Day[]; total: number }> => {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`);
    if (!res.ok) throw new Error(`Contributions request failed: ${res.status}`);
    const data = await res.json();
    return { days: data.contributions as Day[], total: data.total?.lastYear ?? 0 };
};

// Dates are calendar days, so read and format them in UTC to avoid timezone shifts
const utc = (date: string) => new Date(`${date}T00:00:00Z`);

export const formatDay = (date: string) =>
    utc(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const monthOf = (date: string) =>
    utc(date).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });

// Columns of 7 days starting on Sunday, padded with nulls like GitHub's calendar
export const toWeeks = (days: Day[]): Week[] => {
    if (!days.length) return [];
    const cells: (Day | null)[] = [...Array(utc(days[0].date).getUTCDay()).fill(null), ...days];
    while (cells.length % 7) cells.push(null);
    const weeks: Week[] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
};

export const contributionStats = (days: Day[]) => {
    let longest = 0;
    let run = 0;
    let best: Day | null = null;
    for (const day of days) {
        run = day.count > 0 ? run + 1 : 0;
        longest = Math.max(longest, run);
        if (!best || day.count > best.count) best = day;
    }
    // Today may simply not have commits yet, so a streak can end yesterday
    let current = 0;
    let i = days.length - 1;
    if (i >= 0 && days[i].count === 0) i--;
    for (; i >= 0 && days[i].count > 0; i--) current++;
    return { longest, current, best };
};
