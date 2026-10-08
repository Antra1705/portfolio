'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    IoFolderOpenOutline, IoLogoGithub, IoOpenOutline, 
    IoChevronBack, IoChevronForward,
    IoSearch, IoTimeOutline, IoPeopleOutline, IoAppsOutline,
    IoDesktopOutline, IoDocumentOutline, IoCloudOutline,
    IoBluetoothOutline, IoGlobeOutline, IoTrashOutline,
    IoDownloadOutline, IoGridOutline, IoListOutline,
    IoFolder, IoPersonOutline, IoBriefcaseOutline, IoExtensionPuzzleOutline,
    IoMailOutline, IoHomeOutline, IoBulbOutline, IoClose, IoShareOutline, IoScanOutline, IoTextOutline, IoCreateOutline
} from 'react-icons/io5';
import SectionHeading from './SectionHeading';

const projectsData = {
    "Web Development": [
        {
            title: "AlgoRacer",
            type: "project",
            desc: "A high-performance algorithm visualizer featuring real-time racing simulations for sorting and pathfinding algorithms.",
            tech: ["Vite", "React", "Tailwind", "Algorithms"],
            link: "https://antra1705.github.io/AlgoRacer/",
            github: "https://github.com/Antra1705/AlgoRacer"
        },
        {
            title: "CSS-Lab",
            type: "project",
            desc: "An interactive environment for experimenting with advanced CSS layouts, animations, and modern UI components.",
            tech: ["React", "Tailwind", "CSS3", "Vercel"],
            link: "https://css-lab-pi.vercel.app/",
            github: "https://github.com/shivamsaini124/CSS-Lab"
        },
        {
            title: "TradeDash",
            type: "project",
            desc: "A high-fidelity clone of the Zerodha trading platform, featuring interactive dashboards, real-time charts, and order placement logic.",
            tech: ["React", "Express", "Node.js", "Socket.io"],
            link: "https://zerodha-clone-antra.vercel.app/",
            github: "https://github.com/Antra1705/ZerodhaClone"
        },
        {
            title: "ApiForge",
            type: "project",
            desc: "A powerful API design and debugging platform that allows developers to forge, test, and document RESTful endpoints with ease.",
            tech: ["Next.js", "Javascript", "Tailwind", "API Forge"],
            link: "https://api-forge-js.vercel.app/",
            github: "https://github.com/Antra1705/ApiForge"
        },
        {
            title: "Discord Orchestrator",
            type: "project",
            desc: "A comprehensive discord server moderation system designed for automated user management, role assignment, and community orchestration.",
            tech: ["Node.js", "Discord.js", "Automation", "Security"],
            github: "https://github.com/SIDDHESH-2006/DiscordServerModerationOrchestrator"
        }
    ],
    "AI/ML": [
        {
            title: "PosePulse",
            type: "project",
            desc: "A real-time AI gym coach that tracks your form through the webcam, counts reps, and gives live voice feedback while you train.",
            tech: ["Next.js", "FastAPI", "MediaPipe", "Groq LLM"],
            link: "https://pose-pulse-five.vercel.app",
            github: "https://github.com/Antra1705/PosePulse"
        },
        {
            title: "SnapClass",
            type: "project",
            desc: "An AI-powered attendance system that marks a whole class from a single photo using face recognition, with voice biometrics for roll-call.",
            tech: ["Python", "Computer Vision", "Resemblyzer", "Flask"],
            link: "https://snapclass-landing-page-three.vercel.app",
            github: "https://github.com/Antra1705/snapclass-landing-page"
        }
    ],
    "Design": [
        {
            title: "AkshayaTritiya.png",
            type: "image",
            src: "/portfolio/design/AkshayaTritiya.png"
        },
        {
            title: "baisakhi.png",
            type: "image",
            src: "/portfolio/design/baisakhi.png"
        },
        {
            title: "Celestia.png",
            type: "image",
            src: "/portfolio/design/Celestia.png"
        },
        {
            title: "Quail Logo.png",
            type: "image",
            src: "/portfolio/design/Quail%20Logo.png"
        }
    ]
};

const BlueFolder = ({ size = "text-[100px]" }: { size?: string }) => (
    <div className={`relative ${size} flex items-center justify-center`}>
        <IoFolder className="text-finder filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-panel-fg/5 rounded-full blur-xl"></div>
    </div>
);

const PreviewModal = ({ isOpen, image, onClose }: { isOpen: boolean; image: string | null; onClose: () => void }) => {
    if (!isOpen || !image) return null;

    const toolbarIcons = [
        { icon: <IoScanOutline />, label: "Selection" },
        { icon: <IoCreateOutline />, label: "Sketch" },
        { icon: <IoTextOutline />, label: "Text" },
        { icon: <IoPersonOutline />, label: "Sign" },
        { icon: <IoAppsOutline />, label: "Shapes" },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-scrim/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative max-w-5xl w-full rounded-[18px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-panel-fg/10 flex flex-col backdrop-blur-3xl"
                onClick={e => e.stopPropagation()}
                style={{ 
                    maxHeight: '90vh',
                    background: 'var(--modal-bg)'
                }}
            >
                {/* Main Header */}
                <div className="bg-panel-fg/10 px-4 py-2.5 flex items-center justify-between border-b border-panel-fg/10">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex gap-2 items-center">
                            <button onClick={onClose} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] flex items-center justify-center group cursor-pointer">
                                <IoClose className="text-[10px] text-black/40 opacity-0 group-hover:opacity-100" />
                            </button>
                            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] cursor-pointer"></div>
                            <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] cursor-pointer"></div>
                        </div>
                        <div className="hidden sm:flex items-center bg-panel-fg/10 rounded-md px-2 py-1 gap-1 ml-2">
                            <IoGridOutline className="text-panel-fg/60 text-xs" />
                            <IoChevronForward className="text-panel-fg/30 text-[10px] rotate-90" />
                        </div>
                        <span className="text-[13px] font-medium text-panel-fg/90 truncate ml-2">
                            {image.split('/').pop()}
                        </span>
                    </div>

                    <div className="hidden sm:flex items-center gap-3">
                        <div className="flex items-center bg-panel-fg/10 rounded-md px-1 py-1">
                            <button className="px-2 py-0.5 text-panel-fg/60 hover:text-panel-fg cursor-pointer"><IoSearch className="text-sm scale-x-[-1]" /></button>
                            <div className="w-px h-3 bg-panel-fg/10"></div>
                            <button className="px-2 py-0.5 text-panel-fg/60 hover:text-panel-fg cursor-pointer"><span className="text-[10px] font-bold">1:1</span></button>
                            <div className="w-px h-3 bg-panel-fg/10"></div>
                            <button className="px-2 py-0.5 text-panel-fg/60 hover:text-panel-fg cursor-pointer"><IoSearch className="text-sm" /></button>
                        </div>
                        <button className="p-1.5 bg-finder rounded-md text-white shadow-inner cursor-pointer"><IoCreateOutline className="text-base" /></button>
                        <button className="p-1.5 hover:bg-panel-fg/10 rounded-md text-panel-fg/60 cursor-pointer"><IoScanOutline className="text-base" /></button>
                        <div className="w-px h-6 bg-panel-fg/10 mx-1"></div>
                        <button className="p-1.5 hover:bg-panel-fg/10 rounded-md text-panel-fg/60 cursor-pointer"><IoChevronForward className="text-lg" /></button>
                        <button className="p-1.5 hover:bg-panel-fg/10 rounded-md text-panel-fg/60 cursor-pointer"><IoSearch className="text-lg" /></button>
                    </div>
                </div>

                {/* Markup Toolbar - Second Row */}
                <div className="bg-panel-fg/5 px-6 py-1.5 hidden sm:flex items-center gap-5 border-b border-panel-fg/10">
                    <div className="flex items-center gap-3 text-panel-fg/40">
                        <IoScanOutline className="text-base hover:text-panel-fg transition-colors cursor-pointer" />
                        <IoSearch className="text-base hover:text-panel-fg transition-colors cursor-pointer" />
                    </div>
                    <div className="w-px h-4 bg-panel-fg/10"></div>
                    <div className="flex items-center gap-4 text-panel-fg/40">
                        <IoCreateOutline className="text-base hover:text-panel-fg transition-colors cursor-pointer" />
                        <IoScanOutline className="text-base hover:text-panel-fg transition-colors rotate-45 cursor-pointer" />
                        <IoGridOutline className="text-base hover:text-panel-fg transition-colors cursor-pointer" />
                        <div className="flex items-center gap-1 bg-panel-fg/10 rounded px-1 py-0.5 cursor-pointer">
                            <IoAppsOutline className="text-base hover:text-panel-fg transition-colors" />
                            <IoChevronForward className="text-[8px] rotate-90 opacity-40" />
                        </div>
                        <IoTextOutline className="text-base hover:text-panel-fg transition-colors cursor-pointer" />
                        <IoPersonOutline className="text-base hover:text-panel-fg transition-colors cursor-pointer" />
                    </div>
                    <div className="w-px h-4 bg-panel-fg/10"></div>
                    <div className="flex items-center gap-4 text-panel-fg/40">
                        <div className="w-4 h-4 rounded border border-panel-fg/20 bg-panel-fg/5"></div>
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full border border-panel-fg/40 bg-red-500"></div>
                            <IoChevronForward className="text-[8px] rotate-90 opacity-40" />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-panel-fg/80">Aa</span>
                            <IoChevronForward className="text-[8px] rotate-90 opacity-40" />
                        </div>
                    </div>
                </div>
                
                {/* Image Container - Fixed height to avoid scrolling */}
                <div className="flex-1 flex items-center justify-center p-4 md:p-10 overflow-hidden min-h-0 relative bg-transparent">
                    <motion.img 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={image}
                        src={image} 
                        alt="Preview" 
                        className="object-contain shadow-2xl rounded-sm transition-all"
                        style={{ 
                            maxHeight: 'calc(90vh - 160px)', 
                            maxWidth: '100%',
                            filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.5))' 
                        }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

interface CodeProject {
    title: string;
    type: string;
    desc: string;
    tech: string[];
    link?: string;
    github: string;
}

// The four strongest builds, shown large with real screenshots of the live sites.
// Everything else (and the design work) stays in the Finder archive below.
const featured: { title: string; category: string; image: string }[] = [
    { title: "PosePulse", category: "AI / ML", image: "/portfolio/projects/posepulse.webp" },
    { title: "SnapClass", category: "AI / ML", image: "/portfolio/projects/snapclass.webp" },
    { title: "TradeDash", category: "Full stack", image: "/portfolio/projects/zerodha.webp" },
    { title: "AlgoRacer", category: "Web", image: "/portfolio/projects/algoracer.webp" },
];

// Any file in the Finder: a code project or a design image
type FinderItem = Partial<CodeProject> & { title: string; type: string; src?: string };

const codeProjects = [...projectsData["Web Development"], ...projectsData["AI/ML"]] as CodeProject[];

const FeaturedCard = ({ project, category, image, index }: { project: CodeProject; category: string; image: string; index: number }) => {
    const host = project.link ? new URL(project.link).host : 'github.com';
    const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return (
        <motion.article
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: (index % 2) * 0.1 }}
            className={`group min-w-0 ${index % 2 ? 'md:mt-24' : ''}`}
        >
            {/* Screenshot in a browser frame; the whole frame opens the live site */}
            <a
                href={project.link ?? project.github}
                data-track={`live-${slug}-screenshot`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.title} live site`}
                className="block overflow-hidden rounded-2xl border border-fg/10 bg-ink shadow-paper transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5"
            >
                <div className="flex items-center gap-3 border-b border-white/10 bg-[#0b1626] px-4 py-2.5">
                    <div aria-hidden className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
                    </div>
                    <span className="mx-auto min-w-0 max-w-[60%] truncate rounded-md bg-white/10 px-3 py-0.5 font-mono text-[11px] text-white/60">{host}</span>
                    <span className="w-[42px]" />
                </div>
                <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                        src={image}
                        alt={`${project.title} live site`}
                        width={1200}
                        height={750}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                    <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-pink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        Visit site <span aria-hidden>↗</span>
                    </span>
                </div>
            </a>

            <div className="mt-6 flex items-baseline justify-between gap-4">
                <h3 className="text-2xl sm:text-[1.75rem] font-bold tracking-[-0.02em] text-fg">{project.title}</h3>
                <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{category}</span>
            </div>
            <p className="mt-2 max-w-xl text-base leading-relaxed text-fg/65">{project.desc}</p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                {project.tech.join(' · ')}
            </p>
            <div className="mt-3 flex gap-6 font-mono text-[11px] uppercase tracking-[0.18em]">
                {project.link && (
                    <a href={project.link} data-track={`live-${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-fg transition-colors hover:text-accent">
                        Live site <span aria-hidden>↗</span>
                    </a>
                )}
                <a href={project.github} data-track={`code-${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-fg transition-colors hover:text-accent">
                    Code <span aria-hidden>↗</span>
                </a>
            </div>
        </motion.article>
    );
};

const Projects = () => {
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [activeProject, setActiveProject] = useState<CodeProject | null>(null);
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

    const folderNames = ["Design", "Web Development", "AI/ML"];

    // Close menu on click outside
    React.useEffect(() => {
        const handleClick = () => setActiveProject(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    interface SidebarItem {
        icon: React.ReactNode;
        label: string;
        id?: string;
    }

    const sidebarItems: { section: string; items: SidebarItem[] }[] = [
        { section: "", items: [
            { icon: <IoTimeOutline />, label: "Recents", id: "home" },
            { icon: <IoPeopleOutline />, label: "Shared", id: "about" }
        ]},
        { section: "Favourites", items: [
            { icon: <IoHomeOutline />, label: "Home", id: "home" },
            { icon: <IoPersonOutline />, label: "About", id: "about" },
            { icon: <IoBriefcaseOutline />, label: "Experience", id: "experience" },
            { icon: <IoExtensionPuzzleOutline />, label: "Skills", id: "skills" },
            { icon: <IoBulbOutline />, label: "Patents", id: "patents" },
            { icon: <IoFolderOpenOutline />, label: "Projects", id: "projects" },
            { icon: <IoMailOutline />, label: "Contact", id: "contact" }
        ]},
        { section: "Locations", items: [
            { icon: <IoCloudOutline />, label: "iCloud Drive" },
            { icon: <IoGlobeOutline />, label: "Network" },
            { icon: <IoTrashOutline />, label: "Bin" }
        ]}
    ];

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="projects" className="w-full px-5 sm:px-10 py-28 sm:py-40">
            <div className="mx-auto max-w-[1360px]">
                {/* Section Header */}
                <SectionHeading eyebrow="What I've built" title={<>Things I’ve <em>built</em></>} />

                {/* Featured work */}
                <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 lg:gap-x-14">
                    {featured.map((f, i) => {
                        const project = codeProjects.find((p) => p.title === f.title);
                        return project ? <FeaturedCard key={f.title} project={project} category={f.category} image={f.image} index={i} /> : null;
                    })}
                </div>

                {/* The archive: everything else, Finder-style */}
                <div className="mt-28 sm:mt-36 mb-8 flex flex-col gap-3 border-t border-fg/15 pt-8 sm:flex-row sm:items-end sm:justify-between">
                    <h3 className="font-display text-3xl sm:text-4xl text-fg">
                        Or dig through <em className="text-accent">the archive</em>
                    </h3>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                        Open a folder · click a file for details
                    </p>
                </div>

                {/* Finder Styled Container */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="w-full rounded-3xl overflow-hidden shadow-2xl border border-panel-fg/10 flex flex-col h-[560px] sm:h-[700px] backdrop-blur-xl"
                    style={{ background: 'var(--finder-bg)' }}
                >
                    {/* Finder Header */}
                    <div className="bg-panel-fg/5 px-4 sm:px-6 py-4 flex items-center border-b border-panel-fg/10">
                        {/* Traffic Lights */}
                        <div className="flex gap-2 mr-4 sm:mr-8">
                            <div className="w-3 h-3 rounded-full bg-[#FF5F56] cursor-pointer"></div>
                            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] cursor-pointer"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27C93F] cursor-pointer"></div>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex gap-3 sm:gap-4 mr-4 sm:mr-8 text-panel-fg/40">
                            <IoChevronBack className="text-xl cursor-pointer hover:text-panel-fg/80 transition-colors" onClick={() => setSelectedFolder(null)} />
                            <IoChevronForward className="text-xl cursor-not-allowed" />
                        </div>

                        {/* Title */}
                        <div className="text-sm font-bold text-panel-fg/80 flex-1 min-w-0 sm:flex-none sm:w-48 truncate">
                            {selectedFolder ? `${selectedFolder}` : "Projects"}
                        </div>

                        {/* View Options & Search */}
                        <div className="flex items-center gap-6 text-panel-fg/60 ml-auto pl-3">
                            <div className="hidden sm:flex bg-panel-fg/10 rounded-md p-1 border border-panel-fg/10">
                                <div className="p-1 bg-panel-fg/10 rounded cursor-pointer hover:bg-panel-fg/20 transition-colors"><IoGridOutline className="text-sm" /></div>
                                <div className="p-1 cursor-pointer hover:bg-panel-fg/10 rounded transition-colors"><IoListOutline className="text-sm" /></div>
                            </div>
                            <IoSearch className="text-xl cursor-pointer hover:text-panel-fg transition-colors" />
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar */}
                        <div className="w-64 bg-panel-fg/5 border-r border-panel-fg/10 p-4 hidden md:flex flex-col gap-6 overflow-y-auto backdrop-blur-md">
                            {sidebarItems.map((sec, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    {sec.section && <h4 className="text-[10px] uppercase tracking-[0.2em] text-panel-fg/30 font-bold px-3 mb-2">{sec.section}</h4>}
                                    {sec.items.map((item, j) => (
                                        <div 
                                            key={j} 
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${item.id && item.id === (selectedFolder === null ? "projects" : "") ? 'bg-finder/20 text-finder-soft' : 'text-panel-fg/60 hover:bg-panel-fg/5 hover:text-panel-fg'}`}
                                            onClick={() => item.id ? scrollToSection(item.id) : null}
                                        >
                                            <span className="text-finder-soft text-lg">{item.icon}</span>
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 p-5 sm:p-8 md:p-12 overflow-y-auto bg-transparent relative">
                            <AnimatePresence mode="wait">
                                {!selectedFolder ? (
                                    <motion.div 
                                        key="folders"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-12"
                                    >
                                        {folderNames.map((name) => (
                                            <motion.button
                                                type="button"
                                                key={name}
                                                whileHover={{ y: -5 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedFolder(name)}
                                                className="flex flex-col items-center gap-3 rounded-xl cursor-pointer group"
                                            >
                                                <BlueFolder />
                                                <span className="text-panel-fg/90 font-bold text-xs text-center tracking-wide group-hover:text-finder-soft transition-colors">
                                                    {name}
                                                </span>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="project-list"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="w-full h-full flex flex-col"
                                    >
                                        {/* Back Button */}
                                        <button 
                                            onClick={() => setSelectedFolder(null)}
                                            className="flex items-center gap-2 text-finder-soft hover:underline mb-8 sm:mb-12 font-bold text-sm tracking-tight cursor-pointer"
                                        >
                                            <IoChevronBack />
                                            Projects
                                        </button>

                                        {selectedFolder && projectsData[selectedFolder as keyof typeof projectsData].length > 0 ? (
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-10">
                                                {projectsData[selectedFolder as keyof typeof projectsData].map((item: FinderItem, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <motion.button
                                                            type="button"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`w-full flex flex-col items-center gap-3 cursor-pointer p-2 rounded-xl transition-all ${activeProject?.title === item.title ? 'bg-finder/30' : 'hover:bg-panel-fg/5'}`}
                                                            onClick={(e) => {
                                                                if (item.type === 'image') {
                                                                    setPreviewImage(item.src ?? null);
                                                                } else {
                                                                    e.stopPropagation();
                                                                    const menuWidth = 256;
                                                                    const menuHeight = 320;
                                                                    const padding = 20;
                                                                    // Keyboard activation has no pointer position, so anchor to the file
                                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                                    let x = e.clientX || rect.left + rect.width / 2;
                                                                    let y = e.clientY || rect.bottom;

                                                                    // Edge detection with padding
                                                                    if (x + menuWidth + padding > window.innerWidth) {
                                                                        x = Math.max(padding, x - menuWidth);
                                                                    }
                                                                    if (y + menuHeight + padding > window.innerHeight) {
                                                                        y = Math.max(padding, y - menuHeight);
                                                                    }
                                                                    
                                                                    // Safety clamp
                                                                    x = Math.min(Math.max(padding, x), window.innerWidth - menuWidth - padding);
                                                                    y = Math.min(Math.max(padding, y), window.innerHeight - menuHeight - padding);

                                                                    setActiveProject(activeProject?.title === item.title ? null : (item as CodeProject));
                                                                    setMenuPos({ x, y });
                                                                }
                                                            }}
                                                        >
                                                            <div className="w-24 h-28 bg-finder/10 border border-finder/20 rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-xl group-hover:bg-finder/20 transition-all backdrop-blur-sm">
                                                                {item.type === 'image' ? (
                                                                    <img src={item.src} className="w-full h-full object-cover" alt={item.title} />
                                                                ) : (
                                                                    <>
                                                                        <IoDocumentOutline className="text-4xl text-finder-soft" />
                                                                        <div className="absolute bottom-0 left-0 right-0 bg-finder/40 py-1.5 text-[8px] font-black text-center uppercase tracking-[0.2em] text-panel-fg">Project</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <span className="text-panel-fg/80 font-bold text-[11px] text-center px-2 line-clamp-2 leading-tight group-hover:text-panel-fg transition-colors">
                                                                {item.title}
                                                            </span>
                                                        </motion.button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                                                <div className="mb-10">
                                                    <div className="grid grid-cols-3 gap-2 opacity-20">
                                                        {[...Array(9)].map((_, i) => (
                                                            <div key={i} className="w-3 h-3 rounded-full bg-panel-fg"></div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <h4 className="text-2xl font-black text-panel-fg mb-4 tracking-tight">
                                                    {selectedFolder === "AI/ML" ? "Models training in progress..." : "Drafting pixels..."}
                                                </h4>
                                                <p className="text-xs text-panel-fg/50 max-w-xs leading-relaxed font-medium">
                                                    {selectedFolder === "AI/ML" 
                                                        ? "System warming up... Models training in the cloud. Expect high-performance intelligence soon."
                                                        : "Creatively thinking... Pixels are being aligned. Creative vision in progress."}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Menu and preview are portalled to <body> so they layer above the fixed navbar
                (inside <main> they are trapped in its stacking context, below the navbar) */}
            {createPortal(
                <>
                    {/* Project Context Menu - Global Instance */}
                    <AnimatePresence>
                        {activeProject && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="fixed z-[110] w-64 rounded-xl overflow-hidden shadow-2xl border border-panel-fg/10 backdrop-blur-3xl py-1.5"
                                style={{ 
                                    left: menuPos.x, 
                                    top: menuPos.y,
                                    background: 'var(--menu-bg)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Project Info Section */}
                                <div className="px-3 py-2 border-b border-panel-fg/10">
                                    <div className="text-[10px] uppercase tracking-widest text-panel-fg/40 font-black mb-1">Get Info</div>
                                    <div className="text-panel-fg font-bold text-sm mb-0.5">{activeProject.title}</div>
                                    {activeProject.desc && (
                                        <div className="text-[10px] text-panel-fg/50 leading-tight mb-2">{activeProject.desc}</div>
                                    )}
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {activeProject.tech?.map((t: string) => (
                                            <span key={t} className="text-[8px] bg-panel-fg/10 px-1.5 py-0.5 rounded text-panel-fg/70 uppercase font-bold">{t}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="py-1">
                                    {activeProject.link && (
                                        <button 
                                            onClick={() => window.open(activeProject.link, '_blank')}
                                        data-track={`live-${activeProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-archive`}
                                            className="w-full px-3 py-1.5 flex items-center justify-between text-xs text-panel-fg/90 hover:bg-finder hover:text-white group transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <IoOpenOutline className="text-sm opacity-60 group-hover:opacity-100" />
                                                <span>Open Deployed Site</span>
                                            </div>
                                            <IoChevronForward className="text-[10px] opacity-30" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => window.open(activeProject.github, '_blank')}
                                        data-track={`code-${activeProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-archive`}
                                        className="w-full px-3 py-1.5 flex items-center justify-between text-xs text-panel-fg/90 hover:bg-finder hover:text-white group transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <IoLogoGithub className="text-sm opacity-60 group-hover:opacity-100" />
                                            <span>Quick Look GitHub</span>
                                        </div>
                                        <IoChevronForward className="text-[10px] opacity-30" />
                                    </button>
                                </div>

                                <div className="h-px bg-panel-fg/10 mx-1.5 my-1"></div>

                                {/* Secondary Actions */}
                                <div className="py-1">
                                    <div className="px-3 py-1.5 flex items-center gap-2 text-xs text-panel-fg/40 cursor-pointer hover:bg-panel-fg/5 transition-colors">
                                        <IoShareOutline className="text-sm" />
                                        <span>Share Project</span>
                                    </div>
                                    <div className="px-3 py-1.5 flex items-center gap-2 text-xs text-panel-fg/40 cursor-pointer hover:bg-panel-fg/5 transition-colors">
                                        <IoDocumentOutline className="text-sm" />
                                        <span>Compress Folder</span>
                                    </div>
                                </div>

                                <div className="h-px bg-panel-fg/10 mx-1.5 my-1"></div>

                                {/* Tags */}
                                <div className="px-3 py-2 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-panel-fg/20 cursor-pointer"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-panel-fg/20 cursor-pointer"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-panel-fg/20 cursor-pointer"></div>
                                        <div className="w-3 h-3 rounded-full bg-finder border border-panel-fg/20 cursor-pointer"></div>
                                    </div>
                                    <span className="text-[10px] text-panel-fg/30 font-bold cursor-pointer">Tags...</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* macOS Preview Style Modal */}
                    <AnimatePresence>
                        {previewImage && (
                            <PreviewModal 
                                isOpen={!!previewImage} 
                                image={previewImage} 
                                onClose={() => setPreviewImage(null)} 
                            />
                        )}
                    </AnimatePresence>
                </>,
                document.body
            )}
        </section>
    );
};

export default Projects;
