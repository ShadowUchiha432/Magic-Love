import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  text?: string;
  type?: 'star' | 'heart' | 'text' | 'circle';
}

export const useSparkles = () => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const addSparkle = useCallback((x: number, y: number, count: number = 12) => {
    const colors = ['#FFD700', '#FF69B4', '#87CEEB', '#DDA0DD', '#FFFFFF', '#FF6B6B', '#4ECDC4'];
    const messages = ['Love', 'Cute', 'Sweet', '💖', '✨', '💕', '🌟', 'Magic'];
    const types: Array<'star' | 'heart' | 'circle'> = ['star', 'heart', 'circle'];
    
    const newSparkles: Sparkle[] = Array.from({ length: count }).map((_, i) => ({
      id: Math.random() + i,
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
      size: Math.random() * 12 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: types[Math.floor(Math.random() * types.length)],
    }));

    // Add text sparkles
    for (let i = 0; i < 2; i++) {
      newSparkles.push({
        id: Math.random() + 100 + i,
        x: x + (Math.random() - 0.5) * 80,
        y: y - 30 - Math.random() * 40,
        size: Math.random() * 6 + 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        text: messages[Math.floor(Math.random() * messages.length)],
        type: 'text'
      });
    }

    setSparkles((prev) => [...prev, ...newSparkles].slice(-80));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSparkles((prev) => prev.filter((s) => s.id > Date.now() - 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return { sparkles, addSparkle };
};

export const SparkleDisplay: React.FC<{ sparkles: Sparkle[] }> = ({ sparkles }) => (
  <AnimatePresence>
    {sparkles.map((sparkle) => (
      <motion.div
        key={sparkle.id}
        initial={{ scale: 0, opacity: 1, rotate: 0, x: sparkle.x, y: sparkle.y }}
        animate={{ 
          scale: sparkle.text ? [1, 1.3, 1] : [1, 1.5, 0.5], 
          opacity: 0, 
          rotate: sparkle.text ? 0 : 360, 
          y: sparkle.y - 100,
          x: sparkle.x + (Math.random() - 0.5) * 50
        }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(sparkle.text ? {
            color: sparkle.color,
            fontSize: sparkle.size,
            fontWeight: 'bold',
            fontFamily: 'serif',
            textShadow: '0 0 10px currentColor, 0 0 20px currentColor',
          } : sparkle.type === 'heart' ? {
            width: sparkle.size,
            height: sparkle.size,
            color: sparkle.color,
            filter: 'drop-shadow(0 0 5px currentColor)',
          } : sparkle.type === 'circle' ? {
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: sparkle.color,
            borderRadius: '50%',
            boxShadow: `0 0 ${sparkle.size}px ${sparkle.color}`,
          } : {
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: sparkle.color,
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            boxShadow: `0 0 ${sparkle.size}px ${sparkle.color}`,
          })
        }}
      >
        {sparkle.text}
        {sparkle.type === 'heart' && !sparkle.text && (
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        )}
      </motion.div>
    ))}
  </AnimatePresence>
);
