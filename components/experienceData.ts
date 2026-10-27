// Every role, newest first, with the numbers worth pulling out. The Experience
// book has a chapter for each.

export type Role = {
    title: string;
    company: string;
    short: string; // a tab-sized name
    summary: string; // the chapter's one-line summary, in the old "In which…" style
    kind: 'Internship' | 'Open source' | 'Campus';
    period: string;
    desc: string;
    highlights: { value: string; label: string }[];
    stack: string[];
};

export const roles: Role[] = [
    {
        title: "Full Stack Developer Intern",
        company: "SmartSkale",
        short: "SmartSkale",
        summary: "In which two HR portals learn who may open which door, and the people running them get the tools to manage it.",
        kind: "Internship",
        period: "May – Jul 2026",
        desc: "Built role-based access control across 2 production HRMS portals with React, TypeScript, and FastAPI, and shipped user management workflows for role activation, audit logging, and password reset.",
        highlights: [
            { value: "2", label: "production HRMS portals" },
            { value: "3", label: "user workflows shipped" },
        ],
        stack: ["React", "TypeScript", "FastAPI", "RBAC"],
    },
    {
        title: "Open Source Contributor",
        company: "GirlScript Summer of Code",
        short: "GSSoC",
        summary: "In which thirty-six pull requests find their way into twenty repositories, and a lost AuthService is brought back.",
        kind: "Open source",
        period: "May – Aug 2026",
        desc: "Merged 36 pull requests across 20 repositories in React, Next.js, Python, and FastAPI codebases, restored a deleted 454-line AuthService in story-spark-ai (1,000+ forks), and built NyayaVanni, an AI-powered legal document analysis Chrome extension.",
        highlights: [
            { value: "36", label: "pull requests merged" },
            { value: "20", label: "repositories" },
            { value: "1k+", label: "forks on story-spark-ai" },
        ],
        stack: ["React", "Next.js", "Python", "FastAPI", "Chrome extension"],
    },
    {
        title: "Executive Co-Creative Head",
        company: "Indian Society for Technical Education",
        short: "ISTE ’26",
        summary: "In which a society’s events are given their look, their voice and a plan.",
        kind: "Campus",
        period: "2026 – Present",
        desc: "Spearheading creative strategy and design initiatives for technical and cultural events within the society.",
        highlights: [],
        stack: [],
    },
    {
        title: "Web Developer",
        company: "Mozilla Firefox Club",
        short: "Mozilla",
        summary: "In which community platforms are built on the open web, and kept quick.",
        kind: "Campus",
        period: "2025 – Present",
        desc: "Developing community platforms with a focus on open-source web technologies and frontend performance.",
        highlights: [],
        stack: [],
    },
    {
        title: "Web Developer & Designer",
        company: "Indian Society for Technical Education",
        short: "ISTE ’25",
        summary: "In which interactive web platforms are built, and given their creative direction.",
        kind: "Campus",
        period: "2025 – Present",
        desc: "Leading technical implementation and creative direction for interactive web platforms.",
        highlights: [],
        stack: [],
    },
];
