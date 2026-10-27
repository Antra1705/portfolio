// Everything in the Projects section, in three groups. Each piece has a picture:
// a screenshot of the live site (public/projects) or the design itself
// (public/design), except Discord Orchestrator, which has no site and is drawn.

export const GROUPS = ['Web', 'AI & ML', 'Design'] as const;
export type Group = (typeof GROUPS)[number];

export type Work = {
    title: string;
    group: Group;
    desc: string;
    tech: string[];
    link?: string; // the live site, if there is one
    github?: string;
    image?: string;
    alt: string;
    kind?: string; // design pieces: what it is
    full?: string; // design pieces: a larger version for the viewer
    tall?: boolean; // a long page, scrolled through in the viewer
    contain?: boolean; // shown whole on a dark mount rather than cropped (the logo)
};

const SHOT = '/portfolio/projects';
const DESIGN = '/portfolio/design';

export const works: Work[] = [
    {
        title: 'AlgoRacer',
        group: 'Web',
        desc: 'A high-performance algorithm visualizer featuring real-time racing simulations for sorting and pathfinding algorithms.',
        tech: ['Vite', 'React', 'Tailwind', 'Algorithms'],
        link: 'https://antra1705.github.io/AlgoRacer/',
        github: 'https://github.com/Antra1705/AlgoRacer',
        image: `${SHOT}/algoracer.jpg`,
        alt: 'AlgoRacer: a dark green dashboard with race settings, a run button and an efficiency chart',
    },
    {
        title: 'TradeDash',
        group: 'Web',
        desc: 'A high-fidelity clone of the Zerodha trading platform, featuring interactive dashboards, real-time charts, and order placement logic.',
        tech: ['React', 'Express', 'Node.js', 'Socket.io'],
        link: 'https://zerodha-clone-antra.vercel.app/',
        github: 'https://github.com/Antra1705/ZerodhaClone',
        image: `${SHOT}/tradedash.jpg`,
        alt: 'TradeDash: “The terminal built for serious traders” beside a live trading chart',
    },
    {
        title: 'CSS-Lab',
        group: 'Web',
        desc: 'An interactive environment for experimenting with advanced CSS layouts, animations, and modern UI components.',
        tech: ['React', 'Tailwind', 'CSS3', 'Vercel'],
        link: 'https://css-lab-pi.vercel.app/',
        github: 'https://github.com/shivamsaini124/CSS-Lab',
        image: `${SHOT}/csslab.jpg`,
        alt: 'CSS-Lab: a canvas with a preview element, a panel of flexbox controls and the generated CSS',
    },
    {
        title: 'ApiForge',
        group: 'Web',
        desc: 'A powerful API design and debugging platform that allows developers to forge, test, and document RESTful endpoints with ease.',
        tech: ['Next.js', 'JavaScript', 'Tailwind'],
        link: 'https://api-forge-js.vercel.app/',
        github: 'https://github.com/Antra1705/ApiForge',
        image: `${SHOT}/apiforge.jpg`,
        alt: 'ApiForge: “Define your API in plain English” above a prompt box',
    },
    {
        title: 'Discord Orchestrator',
        group: 'Web',
        desc: 'A comprehensive Discord server moderation system designed for automated user management, role assignment, and community orchestration.',
        tech: ['Node.js', 'Discord.js', 'Automation', 'Security'],
        github: 'https://github.com/SIDDHESH-2006/DiscordServerModerationOrchestrator',
        alt: 'Discord Orchestrator: a moderation log of roles assigned, users verified and a spammer timed out',
    },
    {
        title: 'PosePulse',
        group: 'AI & ML',
        desc: 'A real-time AI gym coach that tracks your form through the webcam, counts reps, and gives live voice feedback while you train.',
        tech: ['Next.js', 'FastAPI', 'MediaPipe', 'Groq LLM'],
        link: 'https://pose-pulse-five.vercel.app',
        github: 'https://github.com/Antra1705/PosePulse',
        image: `${SHOT}/posepulse.jpg`,
        alt: 'PosePulse: “Real-time AI gym coach” in large gold serif type on black',
    },
    {
        title: 'SnapClass',
        group: 'AI & ML',
        desc: 'An AI-powered attendance system that marks a whole class from a single photo using face recognition, with voice biometrics for roll-call.',
        tech: ['Python', 'Computer Vision', 'Resemblyzer', 'Flask'],
        link: 'https://snapclass-landing-page-three.vercel.app',
        github: 'https://github.com/Antra1705/snapclass-landing-page',
        image: `${SHOT}/snapclass.jpg`,
        alt: 'SnapClass: “AI Powered Attendance System” in bold purple type with app screenshots',
    },
    {
        title: 'Celestia',
        group: 'Design',
        kind: 'Landing page',
        desc: 'The site for Celestia, ISTE-VIT’s 24-hour vibe-coding hackathon: tracks, prizes, sponsors and FAQs under a night sky.',
        tech: [],
        image: `${DESIGN}/thumbs/celestia.jpg`,
        full: `${DESIGN}/large/celestia.jpg`,
        tall: true,
        alt: 'Celestia landing page: the title over a night sky and golden mountains, then the hackathon tracks drawn as tarot cards',
    },
    {
        title: 'Akshaya Tritiya',
        group: 'Design',
        kind: 'Festival poster',
        desc: 'A festival greeting for ISTE-VIT’s socials, in soft blue with a lotus silhouette and marigolds.',
        tech: [],
        image: `${DESIGN}/thumbs/akshayatritiya.jpg`,
        full: `${DESIGN}/large/akshayatritiya.jpg`,
        alt: 'Akshaya Tritiya greeting poster from ISTE-VIT: a seated silhouette with lotuses on a pale blue background, with leaves and marigolds',
    },
    {
        title: 'Baisakhi',
        group: 'Design',
        kind: 'Festival poster',
        desc: 'A harvest-festival greeting for ISTE-VIT, with dhol drums, kites, bunting and a plate of laddoos.',
        tech: [],
        image: `${DESIGN}/thumbs/baisakhi.jpg`,
        full: `${DESIGN}/large/baisakhi.jpg`,
        alt: 'Baisakhi greeting poster from ISTE-VIT: two dhol drums and laddoos under kites and bunting on a warm yellow background',
    },
    {
        title: 'Quail',
        group: 'Design',
        kind: 'Logo',
        desc: 'A wordmark in a glowing script, its Q drawn as a bird trailing a feather.',
        tech: [],
        image: `${DESIGN}/Quail%20Logo.png`,
        full: `${DESIGN}/Quail%20Logo.png`,
        contain: true,
        alt: 'Quail logo: the word Quail in a glowing white script, its first letter shaped like a bird with a blue feather',
    },
];

export const inGroup = (g: Group) => works.filter((w) => w.group === g);
