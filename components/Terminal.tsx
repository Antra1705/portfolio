'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TerminalLine = ({ text, delay = 0, speed = 0.02 }: { text: string; delay?: number; speed?: number }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                setDisplayedText(text.slice(0, i + 1));
                i++;
                if (i >= text.length) clearInterval(interval);
            }, speed * 1000);
        }, delay * 1000);

        return () => clearTimeout(timer);
    }, [text, delay, speed]);

    return <span>{displayedText}</span>;
};

const Terminal = ({ onToggleTheme, currentTheme }: { onToggleTheme?: () => void; currentTheme?: 'light' | 'dark' }) => {
    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [isIntroFinished, setIsIntroFinished] = useState(false);
    const [showSecondLine, setShowSecondLine] = useState(false);
    const [showThirdLine, setShowThirdLine] = useState(false);
    const [showInitialPrompt, setShowInitialPrompt] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial sequence
    useEffect(() => {
        const t1 = setTimeout(() => setShowSecondLine(true), 1200);
        const t2 = setTimeout(() => setShowThirdLine(true), 2400);
        const t3 = setTimeout(() => {
            setShowInitialPrompt(true);
            setIsIntroFinished(true);
        }, 3600);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    // Scroll to bottom on history change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, input, isIntroFinished]);

    const handleCommand = (cmd: string) => {
        const cleanCmd = cmd.toLowerCase().trim();
        const newHistory = [...history, `user@antra-dev:~$ ${cmd}`];

        switch (cleanCmd) {
            case 'help':
                newHistory.push(
                    "Available commands:",
                    "  help        - Show this menu",
                    "  mode        - Toggle dark/light mode",
                    "  home        - Go to Home/Hero section",
                    "  about       - Go to About Me section",
                    "  experience  - Go to Experience section",
                    "  skills      - Go to Skills section",
                    "  projects    - Go to Projects section",
                    "  contact     - Go to Contact section",
                    "  clear       - Clear the terminal history"
                );
                break;
            case 'mode':
                if (onToggleTheme) {
                    onToggleTheme();
                    newHistory.push(`Switching to ${currentTheme === 'light' ? 'dark' : 'light'} mode...`);
                } else {
                    newHistory.push("Error: Theme toggling not available.");
                }
                break;
            case 'home':
            case 'about':
            case 'experience':
            case 'skills':
            case 'projects':
            case 'contact':
                const section = document.getElementById(cleanCmd);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                    newHistory.push(`Navigating to ${cleanCmd}...`);
                } else {
                    newHistory.push(`Error: Section '${cleanCmd}' not found.`);
                }
                break;
            case 'clear':
                setHistory([]);
                return;
            case '':
                break;
            default:
                newHistory.push(`Command not found: ${cmd}. Type 'help' for options.`);
        }
        setHistory(newHistory);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() || input === "") {
            handleCommand(input);
            setInput("");
        }
    };

    const focusInput = () => {
        inputRef.current?.focus();
    };

    return (
        <section className="w-full py-16 px-6 flex justify-center items-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                onClick={focusInput}
                className="w-full max-w-3xl glass rounded-xl overflow-hidden shadow-2xl border-[#FFFDE7]/10 cursor-text"
                style={{ background: currentTheme === 'light' ? 'rgba(155, 208, 237, 0.15)' : 'rgba(2, 29, 56, 0.2)' }}
            >
                {/* Terminal Header */}
                <div className="bg-[#FFFDE7]/10 px-4 py-3 flex items-center justify-between border-b border-[#FFFDE7]/10">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F56] cursor-pointer"></div>
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] cursor-pointer"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27C93F] cursor-pointer"></div>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-[#FFFDE7]/60">
                        AntraOS Terminal — zsh
                    </div>
                    <div className="w-12"></div>
                </div>

                {/* Terminal Content Area */}
                <div 
                    ref={scrollRef}
                    className="p-6 font-mono text-[13px] leading-relaxed max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#F2AEBC]/30"
                >
                    {/* Startup Logs */}
                    <div className="text-[#FFFDE7] mb-1 drop-shadow-sm font-semibold">
                        <TerminalLine text="Welcome to AntraOS v1.1.0 (Interactive Mode)" />
                    </div>
                    
                    {showSecondLine && (
                        <div className="text-[#FFFDE7]/80 mb-1 drop-shadow-sm">
                            <TerminalLine text="> Loading portfolio modules..." />
                        </div>
                    )}

                    {showThirdLine && (
                        <div className="text-[#FFFDE7]/80 mb-4 drop-shadow-sm">
                            <TerminalLine text="> System status: ALL SYSTEMS ONLINE" />
                        </div>
                    )}

                    {/* History */}
                    {history.map((line, i) => (
                        <div key={i} className={`mb-1 drop-shadow-sm ${line.startsWith('user@') ? 'text-[#F2AEBC]' : 'text-[#FFFDE7]/90'}`}>
                            {line}
                        </div>
                    ))}

                    {/* Active Prompt */}
                    {isIntroFinished && (
                        <form onSubmit={handleSubmit} className="flex items-center gap-2 group">
                            <span className="text-[#F2AEBC] font-bold shrink-0">user@antra-dev:~$</span>
                            <div className="relative flex-grow flex items-center">
                                <input 
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    autoFocus
                                    spellCheck={false}
                                    className="absolute inset-0 opacity-0 cursor-default bg-transparent outline-none border-none caret-transparent"
                                />
                                <span className="text-[#FFFDE7] z-10">{input}</span>
                                {!input && (
                                    <span className="absolute left-0 text-[#FFFDE7]/30 italic pointer-events-none">
                                        Type 'help' for commands...
                                    </span>
                                )}
                                <motion.span
                                    animate={{ opacity: [1, 0, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                    className="inline-block w-2 h-4 bg-[#FFFDE7] ml-0.5 shadow-sm"
                                />
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </section>
    );
};

export default Terminal;
