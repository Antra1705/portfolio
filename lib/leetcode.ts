import type { Day } from './github';

// LeetCode's own API refuses requests from other sites, so this goes through
// public proxies that do allow them: the first returns everything in one call,
// the second (alfa-leetcode-api) is a fallback if it is down.
export const LEETCODE_USER = 'antra_1705';
export const LEETCODE_URL = `https://leetcode.com/u/${LEETCODE_USER}/`;

export interface LeetCodeData {
    days: Day[];
    solved: { total: number; easy: number; medium: number; hard: number };
}

const levelFor = (count: number): Day['level'] =>
    count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 7 ? 3 : 4;

// The calendar maps UTC-midnight unix timestamps to submission counts.
// Expand it into one Day per date for the last year, ending today, like GitHub's.
const toDays = (calendar: Record<string, number>): Day[] => {
    const counts = new Map<string, number>();
    for (const [ts, count] of Object.entries(calendar)) {
        const date = new Date(Number(ts) * 1000).toISOString().slice(0, 10);
        counts.set(date, (counts.get(date) ?? 0) + count);
    }
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    const days: Day[] = [];
    for (let i = 365; i >= 0; i--) {
        const date = new Date(end.getTime() - i * 86400000).toISOString().slice(0, 10);
        const count = counts.get(date) ?? 0;
        days.push({ date, count, level: levelFor(count) });
    }
    return days;
};

const parseCalendar = (raw: unknown): Record<string, number> =>
    typeof raw === 'string' ? JSON.parse(raw) : ((raw as Record<string, number>) ?? {});

const fromPrimary = async (): Promise<LeetCodeData> => {
    const res = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${LEETCODE_USER}`);
    if (!res.ok) throw new Error(`LeetCode request failed: ${res.status}`);
    const d = await res.json();
    return {
        days: toDays(parseCalendar(d.submissionCalendar)),
        solved: { total: d.totalSolved, easy: d.easySolved, medium: d.mediumSolved, hard: d.hardSolved },
    };
};

const fromFallback = async (): Promise<LeetCodeData> => {
    const base = `https://alfa-leetcode-api.onrender.com/${LEETCODE_USER}`;
    const [calRes, solvedRes] = await Promise.all([fetch(`${base}/calendar`), fetch(`${base}/solved`)]);
    if (!calRes.ok || !solvedRes.ok) throw new Error('LeetCode fallback failed');
    const cal = await calRes.json();
    const s = await solvedRes.json();
    return {
        days: toDays(parseCalendar(cal.submissionCalendar)),
        solved: { total: s.solvedProblem, easy: s.easySolved, medium: s.mediumSolved, hard: s.hardSolved },
    };
};

export const fetchLeetCode = (): Promise<LeetCodeData> => fromPrimary().catch(fromFallback);
