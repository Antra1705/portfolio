'use client';

import { useEffect, useState } from 'react';
import type { GardenColors } from '../components/ContributionGarden';

// Colours for the 3D scenes (activity garden, contact tree), read from the CSS
// theme variables so they follow light/dark mode.

export const readGardenColors = () => {
    const css = getComputedStyle(document.documentElement);
    // Fallbacks (the dark palette) keep the scene coloured if a variable is ever missing
    const v = (name: string, fallback = '#888888') => css.getPropertyValue(name).trim() || fallback;
    const garden: GardenColors = {
        background: v('--background'),
        ground: v('--garden-ground'),
        grass: v('--garden-grass'),
        trunk: v('--garden-trunk'),
        github: [1, 2, 3, 4].map((l) => v(`--garden-leaf-${l}`)),
        leetcode: [1, 2, 3, 4].map((l) => v(`--garden-lc-${l}`)),
        blossom: v('--garden-blossom'),
        fruit: v('--garden-fruit'),
        water: v('--garden-water', '#2F6E9C'),
        waterEdge: v('--garden-water-edge', '#3F8AA8'),
        stone: v('--garden-stone', '#7E879B'),
        lily: v('--garden-lily', '#4F9A62'),
    };
    return garden;
};

// Garden colours from CSS, re-read whenever the theme flips
export const useGardenColors = () => {
    const [colors, setColors] = useState(readGardenColors);
    useEffect(() => {
        const observer = new MutationObserver(() => setColors(readGardenColors()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);
    return colors;
};

export const hasWebGL = () => {
    try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
        return false;
    }
};
