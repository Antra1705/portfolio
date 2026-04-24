'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    IoFolderOpenOutline, IoLogoGithub, IoOpenOutline, 
    IoChevronBack, IoChevronForward,
    IoSearch, IoTimeOutline, IoPeopleOutline, IoAppsOutline,
    IoDesktopOutline, IoDocumentOutline, IoCloudOutline,
    IoBluetoothOutline, IoGlobeOutline, IoTrashOutline,
    IoDownloadOutline, IoGridOutline, IoListOutline,
    IoFolder, IoPersonOutline, IoBriefcaseOutline, IoExtensionPuzzleOutline,
    IoMailOutline, IoHomeOutline, IoClose, IoShareOutline, IoScanOutline, IoTextOutline, IoCreateOutline
} from 'react-icons/io5';

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
            title: "ZerodhaClone",
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
    "AI/ML": [],
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
        }
    ]
};

const BlueFolder = ({ size = "text-[100px]" }: { size?: string }) => (
    <div className={`relative ${size} flex items-center justify-center`}>
        <IoFolder className="text-[#3b82f6] filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-white/5 rounded-full blur-xl"></div>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative max-w-5xl w-full rounded-[18px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col backdrop-blur-3xl"
                onClick={e => e.stopPropagation()}
                style={{ 
                    maxHeight: '90vh',
                    background: 'rgba(2, 29, 56, 0.4)'
                }}
            >
                {/* Main Header */}
                <div className="bg-white/10 px-4 py-2.5 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex gap-2 items-center">
                            <button onClick={onClose} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] flex items-center justify-center group">
                                <IoClose className="text-[10px] text-black/40 opacity-0 group-hover:opacity-100" />
                            </button>
                            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E]"></div>
                            <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F]"></div>
                        </div>
                        <div className="flex items-center bg-white/10 rounded-md px-2 py-1 gap-1 ml-2">
                            <IoGridOutline className="text-white/60 text-xs" />
                            <IoChevronForward className="text-white/30 text-[10px] rotate-90" />
                        </div>
                        <span className="text-[13px] font-medium text-white/90 truncate ml-2">
                            {image.split('/').pop()}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white/10 rounded-md px-1 py-1">
                            <button className="px-2 py-0.5 text-white/60 hover:text-white"><IoSearch className="text-sm scale-x-[-1]" /></button>
                            <div className="w-px h-3 bg-white/10"></div>
                            <button className="px-2 py-0.5 text-white/60 hover:text-white"><span className="text-[10px] font-bold">1:1</span></button>
                            <div className="w-px h-3 bg-white/10"></div>
                            <button className="px-2 py-0.5 text-white/60 hover:text-white"><IoSearch className="text-sm" /></button>
                        </div>
                        <button className="p-1.5 bg-[#3b82f6] rounded-md text-white shadow-inner"><IoCreateOutline className="text-base" /></button>
                        <button className="p-1.5 hover:bg-white/10 rounded-md text-white/60"><IoScanOutline className="text-base" /></button>
                        <div className="w-px h-6 bg-white/10 mx-1"></div>
                        <button className="p-1.5 hover:bg-white/10 rounded-md text-white/60"><IoChevronForward className="text-lg" /></button>
                        <button className="p-1.5 hover:bg-white/10 rounded-md text-white/60"><IoSearch className="text-lg" /></button>
                    </div>
                </div>

                {/* Markup Toolbar - Second Row */}
                <div className="bg-white/5 px-6 py-1.5 flex items-center gap-5 border-b border-white/10">
                    <div className="flex items-center gap-3 text-white/40">
                        <IoScanOutline className="text-base hover:text-white transition-colors" />
                        <IoSearch className="text-base hover:text-white transition-colors" />
                    </div>
                    <div className="w-px h-4 bg-white/10"></div>
                    <div className="flex items-center gap-4 text-white/40">
                        <IoCreateOutline className="text-base hover:text-white transition-colors" />
                        <IoScanOutline className="text-base hover:text-white transition-colors rotate-45" />
                        <IoGridOutline className="text-base hover:text-white transition-colors" />
                        <div className="flex items-center gap-1 bg-white/10 rounded px-1 py-0.5">
                            <IoAppsOutline className="text-base hover:text-white transition-colors" />
                            <IoChevronForward className="text-[8px] rotate-90 opacity-40" />
                        </div>
                        <IoTextOutline className="text-base hover:text-white transition-colors" />
                        <IoPersonOutline className="text-base hover:text-white transition-colors" />
                    </div>
                    <div className="w-px h-4 bg-white/10"></div>
                    <div className="flex items-center gap-4 text-white/40">
                        <div className="w-4 h-4 rounded border border-white/20 bg-white/5"></div>
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full border border-white/40 bg-red-500"></div>
                            <IoChevronForward className="text-[8px] rotate-90 opacity-40" />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white/80">Aa</span>
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

const Projects = () => {
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [activeProject, setActiveProject] = useState<any>(null);
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
            { icon: <IoTimeOutline />, label: "Recents", id: "hero" },
            { icon: <IoPeopleOutline />, label: "Shared", id: "about" }
        ]},
        { section: "Favourites", items: [
            { icon: <IoHomeOutline />, label: "Home", id: "hero" },
            { icon: <IoPersonOutline />, label: "About", id: "about" },
            { icon: <IoBriefcaseOutline />, label: "Experience", id: "experience" },
            { icon: <IoExtensionPuzzleOutline />, label: "Skills", id: "skills" },
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
        <section id="projects" className="w-full py-32 px-6 flex flex-col items-center">
            <div className="max-w-6xl w-full">
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-16 px-4">
                    <IoFolderOpenOutline className="text-3xl text-[#FFFDE7]/80" />
                    <h2 className="text-3xl font-black tracking-tight text-[#FFFDE7]">Projects</h2>
                </div>

                {/* Finder Styled Container */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col h-[700px] backdrop-blur-xl"
                    style={{ background: 'rgba(28, 30, 32, 0.4)' }}
                >
                    {/* Finder Header */}
                    <div className="bg-white/5 px-6 py-4 flex items-center border-b border-white/10">
                        {/* Traffic Lights */}
                        <div className="flex gap-2 mr-8">
                            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex gap-4 mr-8 text-white/40">
                            <IoChevronBack className="text-xl cursor-pointer hover:text-white/80 transition-colors" onClick={() => setSelectedFolder(null)} />
                            <IoChevronForward className="text-xl cursor-not-allowed" />
                        </div>

                        {/* Title */}
                        <div className="text-sm font-bold text-white/80 w-48 truncate">
                            {selectedFolder ? `${selectedFolder}` : "Projects"}
                        </div>

                        {/* View Options & Search */}
                        <div className="flex items-center gap-6 text-white/60 ml-auto">
                            <div className="flex bg-white/10 rounded-md p-1 border border-white/10">
                                <div className="p-1 bg-white/10 rounded"><IoGridOutline className="text-sm" /></div>
                                <div className="p-1"><IoListOutline className="text-sm" /></div>
                            </div>
                            <IoSearch className="text-xl" />
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar */}
                        <div className="w-64 bg-white/5 border-r border-white/10 p-4 hidden md:flex flex-col gap-6 overflow-y-auto backdrop-blur-md">
                            {sidebarItems.map((sec, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    {sec.section && <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold px-3 mb-2">{sec.section}</h4>}
                                    {sec.items.map((item, j) => (
                                        <div 
                                            key={j} 
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${item.id && item.id === (selectedFolder === null ? "projects" : "") ? 'bg-[#3b82f6]/20 text-[#60a5fa]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                            onClick={() => item.id ? scrollToSection(item.id) : null}
                                        >
                                            <span className="text-[#60a5fa] text-lg">{item.icon}</span>
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-transparent relative">
                            <AnimatePresence mode="wait">
                                {!selectedFolder ? (
                                    <motion.div 
                                        key="folders"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="grid grid-cols-2 lg:grid-cols-4 gap-12"
                                    >
                                        {folderNames.map((name) => (
                                            <motion.div
                                                key={name}
                                                whileHover={{ y: -5 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedFolder(name)}
                                                className="flex flex-col items-center gap-3 cursor-pointer group"
                                            >
                                                <BlueFolder />
                                                <span className="text-white/90 font-bold text-xs text-center tracking-wide group-hover:text-[#60a5fa] transition-colors">
                                                    {name}
                                                </span>
                                            </motion.div>
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
                                            className="flex items-center gap-2 text-[#60a5fa] hover:underline mb-12 font-bold text-sm tracking-tight"
                                        >
                                            <IoChevronBack />
                                            Projects
                                        </button>

                                        {selectedFolder && projectsData[selectedFolder as keyof typeof projectsData].length > 0 ? (
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                                                {projectsData[selectedFolder as keyof typeof projectsData].map((item: any, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`flex flex-col items-center gap-3 cursor-pointer p-2 rounded-xl transition-all ${activeProject?.title === item.title ? 'bg-blue-500/30' : 'hover:bg-white/5'}`}
                                                            onClick={(e) => {
                                                                if (item.type === 'image') {
                                                                    setPreviewImage(item.src);
                                                                } else {
                                                                    e.stopPropagation();
                                                                    const menuWidth = 256;
                                                                    const menuHeight = 320;
                                                                    const padding = 20;
                                                                    let x = e.clientX;
                                                                    let y = e.clientY;

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

                                                                    setActiveProject(activeProject?.title === item.title ? null : item);
                                                                    setMenuPos({ x, y });
                                                                }
                                                            }}
                                                        >
                                                            <div className="w-24 h-28 bg-blue-500/10 border border-blue-500/20 rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-xl group-hover:bg-blue-500/20 transition-all backdrop-blur-sm">
                                                                {item.type === 'image' ? (
                                                                    <img src={item.src} className="w-full h-full object-cover" alt={item.title} />
                                                                ) : (
                                                                    <>
                                                                        <IoDocumentOutline className="text-4xl text-[#60a5fa]" />
                                                                        <div className="absolute bottom-0 left-0 right-0 bg-[#3b82f6]/40 py-1.5 text-[8px] font-black text-center uppercase tracking-[0.2em] text-white">Project</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <span className="text-white/80 font-bold text-[11px] text-center px-2 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                                                                {item.title}
                                                            </span>
                                                        </motion.div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                                                <div className="mb-10">
                                                    <div className="grid grid-cols-3 gap-2 opacity-20">
                                                        {[...Array(9)].map((_, i) => (
                                                            <div key={i} className="w-3 h-3 rounded-full bg-white"></div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <h4 className="text-2xl font-black text-white mb-4 tracking-tight">
                                                    {selectedFolder === "AI/ML" ? "Models training in progress..." : "Drafting pixels..."}
                                                </h4>
                                                <p className="text-xs text-white/50 max-w-xs leading-relaxed font-medium">
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

            {/* Project Context Menu - Global Instance */}
            <AnimatePresence>
                {activeProject && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="fixed z-[110] w-64 rounded-xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-3xl py-1.5"
                        style={{ 
                            left: menuPos.x, 
                            top: menuPos.y,
                            background: 'rgba(2, 29, 56, 0.85)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Project Info Section */}
                        <div className="px-3 py-2 border-b border-white/10">
                            <div className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-1">Get Info</div>
                            <div className="text-white font-bold text-sm mb-0.5">{activeProject.title}</div>
                            {activeProject.desc && (
                                <div className="text-[10px] text-white/50 leading-tight mb-2">{activeProject.desc}</div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {activeProject.tech?.map((t: string) => (
                                    <span key={t} className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/70 uppercase font-bold">{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="py-1">
                            {activeProject.link && (
                                <button 
                                    onClick={() => window.open(activeProject.link, '_blank')}
                                    className="w-full px-3 py-1.5 flex items-center justify-between text-xs text-white/90 hover:bg-[#3b82f6] hover:text-white group transition-colors"
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
                                className="w-full px-3 py-1.5 flex items-center justify-between text-xs text-white/90 hover:bg-[#3b82f6] hover:text-white group transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <IoLogoGithub className="text-sm opacity-60 group-hover:opacity-100" />
                                    <span>Quick Look GitHub</span>
                                </div>
                                <IoChevronForward className="text-[10px] opacity-30" />
                            </button>
                        </div>

                        <div className="h-px bg-white/10 mx-1.5 my-1"></div>

                        {/* Secondary Actions */}
                        <div className="py-1">
                            <div className="px-3 py-1.5 flex items-center gap-2 text-xs text-white/40 cursor-default">
                                <IoShareOutline className="text-sm" />
                                <span>Share Project</span>
                            </div>
                            <div className="px-3 py-1.5 flex items-center gap-2 text-xs text-white/40 cursor-default">
                                <IoDocumentOutline className="text-sm" />
                                <span>Compress Folder</span>
                            </div>
                        </div>

                        <div className="h-px bg-white/10 mx-1.5 my-1"></div>

                        {/* Tags */}
                        <div className="px-3 py-2 flex items-center justify-between">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-white/20"></div>
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-white/20"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-white/20"></div>
                                <div className="w-3 h-3 rounded-full bg-[#3b82f6] border border-white/20"></div>
                            </div>
                            <span className="text-[10px] text-white/30 font-bold">Tags...</span>
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
        </section>
    );
};

export default Projects;
