'use client';

import { useEffect } from 'react';
import { trackEvent } from '../lib/analytics';

// Sends two kinds of events to GoatCounter:
//  - clicks on any element with a data-track="name" attribute
//  - "section-<id>" the first time a visitor scrolls each section to mid-screen
const Analytics = () => {
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]');
            if (el?.dataset.track) trackEvent(el.dataset.track);
        };
        document.addEventListener('click', onClick);

        const seen = new Set<string>();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = entry.target.id;
                    if (entry.isIntersecting && !seen.has(id)) {
                        seen.add(id);
                        trackEvent(`section-${id}`);
                        observer.unobserve(entry.target);
                    }
                });
            },
            // Counts once a section reaches the middle of the screen; a ratio threshold would
            // never fire for sections taller than the viewport (Experience, Projects)
            { rootMargin: '0px 0px -50% 0px' }
        );
        document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));

        return () => {
            document.removeEventListener('click', onClick);
            observer.disconnect();
        };
    }, []);

    return null;
};

export default Analytics;
