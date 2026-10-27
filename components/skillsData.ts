import type { IconType } from 'react-icons';
import { IoLogoHtml5, IoLogoCss3 } from 'react-icons/io5';
import {
    SiFigma, SiPython, SiBootstrap,
    SiTailwindcss, SiJavascript, SiReact, SiNextdotjs,
    SiNodedotjs, SiExpress, SiMongodb, SiNumpy, SiPandas,
    SiMysql, SiTypescript, SiGit, SiCplusplus,
    SiFastapi, SiFlask, SiPostgresql, SiSocketdotio, SiVite,
    SiShadcnui, SiZod, SiJsonwebtokens, SiScikitlearn, SiOpencv,
    SiMediapipe, SiStreamlit, SiGooglegemini, SiDiscorddotjs,
    SiVercel, SiRender, SiGithubactions, SiPostman, SiClaude
} from 'react-icons/si';
import { FaJava, FaC } from 'react-icons/fa6';
import { TbChartDots, TbBrain, TbWaveSine } from 'react-icons/tb';
import { BsDatabase } from 'react-icons/bs';

// The toolkit: every tool, grouped. Shared by the Skills layouts.
export type Skill = { name: string; icon: IconType };
export type SkillGroup = { name: string; items: Skill[] };

export const groups: SkillGroup[] = [
    {
        name: "Languages",
        items: [
            { name: "Python", icon: SiPython },
            { name: "JavaScript", icon: SiJavascript },
            { name: "TypeScript", icon: SiTypescript },
            { name: "Java", icon: FaJava },
            { name: "C", icon: FaC },
            { name: "C++", icon: SiCplusplus },
            { name: "SQL", icon: BsDatabase },
        ],
    },
    {
        name: "Frontend",
        items: [
            { name: "React", icon: SiReact },
            { name: "Next.js", icon: SiNextdotjs },
            { name: "Vite", icon: SiVite },
            { name: "Tailwind", icon: SiTailwindcss },
            { name: "shadcn/ui", icon: SiShadcnui },
            { name: "Zod", icon: SiZod },
            { name: "Bootstrap", icon: SiBootstrap },
            { name: "HTML", icon: IoLogoHtml5 },
            { name: "CSS", icon: IoLogoCss3 },
        ],
    },
    {
        name: "Backend",
        items: [
            { name: "Node.js", icon: SiNodedotjs },
            { name: "Express", icon: SiExpress },
            { name: "FastAPI", icon: SiFastapi },
            { name: "Flask", icon: SiFlask },
            { name: "Socket.io", icon: SiSocketdotio },
            { name: "JWT", icon: SiJsonwebtokens },
            { name: "Discord.js", icon: SiDiscorddotjs },
        ],
    },
    {
        name: "Databases",
        items: [
            { name: "PostgreSQL", icon: SiPostgresql },
            { name: "MongoDB", icon: SiMongodb },
            { name: "MySQL", icon: SiMysql },
        ],
    },
    {
        name: "Data & ML",
        items: [
            { name: "NumPy", icon: SiNumpy },
            { name: "Pandas", icon: SiPandas },
            { name: "Matplotlib", icon: TbChartDots },
            { name: "Scikit-learn", icon: SiScikitlearn },
            { name: "OpenCV", icon: SiOpencv },
            { name: "MediaPipe", icon: SiMediapipe },
            { name: "Librosa", icon: TbWaveSine },
            { name: "Streamlit", icon: SiStreamlit },
        ],
    },
    {
        name: "AI & LLMs",
        items: [
            { name: "Claude", icon: SiClaude },
            { name: "Gemini", icon: SiGooglegemini },
            { name: "Groq", icon: TbBrain },
        ],
    },
    {
        name: "Tools",
        items: [
            { name: "Git", icon: SiGit },
            { name: "GitHub Actions", icon: SiGithubactions },
            { name: "Vercel", icon: SiVercel },
            { name: "Render", icon: SiRender },
            { name: "Postman", icon: SiPostman },
            { name: "Figma", icon: SiFigma },
        ],
    },
];
