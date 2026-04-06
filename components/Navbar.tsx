'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'About', href: '#about' },
        { name: 'Experience', href: '#experience' },
        { name: 'Skills', href: '#skills' },
        { name: 'Projects', href: '#projects' },
    ];

    return (
        <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500`}>
            <ul className={`flex items-center gap-6 px-6 py-3 rounded-full transition-all duration-500 ${scrolled ? 'glass shadow-lg shadow-black/5 scale-95' : 'bg-transparent'}`}>
                {navLinks.map((link) => (
                    <li key={link.name}>
                        <a 
                            href={link.href} 
                            className="text-[11px] uppercase tracking-widest font-bold text-[#FFFDE7]/60 hover:text-[#FFFDE7] transition-colors"
                        >
                            {link.name}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;
