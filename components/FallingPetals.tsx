'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

const FallingPetals = () => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 15,
      size: 8 + Math.random() * 12,
      rotation: Math.random() * 360,
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <AnimatePresence>
        {petals.map((petal) => (
          <motion.img
            key={petal.id}
            src="/petal.png"
            alt=""
            initial={{ 
              top: '-10%', 
              left: `${petal.x}%`, 
              opacity: 0,
              rotate: petal.rotation 
            }}
            animate={{ 
              top: '110%', 
              left: `${petal.x + (Math.random() * 20 - 10)}%`,
              opacity: [0, 0.8, 0.8, 0],
              rotate: petal.rotation + 720
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
