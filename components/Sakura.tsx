import React from 'react';

// Five-petal blossom used as the site's mark and as a separator
const Sakura = ({ className = '' }: { className?: string }) => (
    <svg viewBox="-12 -12 24 24" aria-hidden className={className} fill="currentColor">
        {[0, 72, 144, 216, 288].map((r) => (
            <path key={r} d="M0 -1.5 C -3.6 -4 -4 -8.6 -1.4 -10.8 L 0 -9.4 L 1.4 -10.8 C 4 -8.6 3.6 -4 0 -1.5 Z" transform={`rotate(${r})`} />
        ))}
        <circle r="1.6" opacity="0.45" />
    </svg>
);

export default Sakura;
