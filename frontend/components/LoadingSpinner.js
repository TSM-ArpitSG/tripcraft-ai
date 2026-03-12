/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * Loading Spinner — Premium animated state
 * with cycling status text and Lucide Plane
 * ==========================================
 */

'use client';

import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';
import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  'Exploring destinations...',
  'Mapping the perfect route...',
  'Packing your bags...',
  'Checking flight schedules...',
  'Curating hidden gems...',
  'Planning your adventure...',
];

export default function LoadingSpinner({ message }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const displayMessage = message || LOADING_MESSAGES[msgIndex];

  // Cycle through messages when no custom message is provided
  useEffect(() => {
    if (message) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [message]);

  return (
    <div className="loading-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '32px',
    }}>
      {/* Pulsing gradient orb with rotating plane */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.08, 1],
        }}
        transition={{
          rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          width: '88px',
          height: '88px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--gradient-hero)',
          borderRadius: '50%',
          boxShadow: '0 0 40px var(--accent-primary-glow), 0 0 80px rgba(0, 212, 170, 0.1)',
        }}
      >
        <Plane color="white" size={42} strokeWidth={1.5} style={{ marginLeft: '4px' }} />
      </motion.div>

      {/* Cycling message with fade transition */}
      <motion.div
        key={displayMessage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
        className="font-display"
        style={{
          fontSize: '1.15rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          textAlign: 'center',
        }}
      >
        {displayMessage}
      </motion.div>

      {/* Animated dots */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
