'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  drift: number;
}

const FallingPetals = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const petals = useMemo<Petal[]>(() => {
    if (!mounted) return [];
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: i * 0.8 + Math.random() * 2, // Staggered delays to prevent clumping
      duration: 12 + Math.random() * 8, // More consistent duration
      size: 8 + Math.random() * 12,
      rotation: Math.random() * 360,
      drift: Math.random() * 30 - 15,
    }));
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <AnimatePresence>
        {petals.map((petal) => (
          <motion.img
            key={petal.id}
            src="/portfolio/petal.png"
            alt=""
            initial={{ 
              top: '-10%', 
              left: `${petal.x}%`, 
              opacity: 0,
              rotate: petal.rotation
            }}
            animate={{ 
              top: '110%', 
              left: `${petal.x + petal.drift}%`,
              opacity: [0, 1, 1, 0],
              rotate: petal.rotation + 90
            }}
            transition={{ 
              duration: petal.duration, 
              delay: petal.delay,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ 
              width: petal.size,
              position: 'absolute',
              filter: 'drop-shadow(0 0 5px rgba(242, 174, 188, 0.3))'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FallingPetals;
