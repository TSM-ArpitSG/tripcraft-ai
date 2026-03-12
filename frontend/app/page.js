/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * Landing Page — Immersive hero with word
 * reveal, scroll-triggered features, stats
 * ==========================================
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Sparkles, Map, Compass, Wallet, ListChecks, Hotel,
  Plane, Globe, TrendingUp, Shield, ArrowRight, Star,
  Zap, MapPin, Clock
} from 'lucide-react';

/* ===== ANIMATION VARIANTS ===== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

/* ===== FEATURES DATA ===== */
const FEATURES = [
  { icon: <Sparkles size={24} />, title: 'AI-Powered Plans', desc: 'Smart itineraries crafted by AI, tailored to your interests and budget.' },
  { icon: <Wallet size={24} />, title: 'Budget Estimates', desc: 'Detailed cost breakdowns so you know exactly what to expect.' },
  { icon: <Hotel size={24} />, title: 'Hotel Picks', desc: 'Curated hotel suggestions at every price point with direct links.' },
  { icon: <ListChecks size={24} />, title: 'Packing Lists', desc: 'AI-generated packing lists customized for your destination and weather.' },
  { icon: <Map size={24} />, title: 'Day-by-Day', desc: 'Detailed daily itineraries with activities, times, and local tips.' },
  { icon: <Zap size={24} />, title: 'Instant Results', desc: 'Generate complete travel plans in seconds, not hours.' },
];

const STATS = [
  { icon: <MapPin size={20} />, value: '50+', label: 'Destinations' },
  { icon: <Plane size={20} />, value: '1,000+', label: 'Trips Planned' },
  { icon: <Star size={20} />, value: '4.9', label: 'User Rating' },
  { icon: <Clock size={20} />, value: '<30s', label: 'Generation Time' },
];

/* ===== ANIMATED WORD REVEAL COMPONENT ===== */
function AnimatedHeadline({ text, className, style }) {
  const words = text.split(' ');
  return (
    <motion.h1
      className={className}
      style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0 12px' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={wordVariants} style={{ display: 'inline-block' }}>
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}

/* ===== FEATURE CARD ===== */
function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card"
      style={{ padding: '32px 28px', cursor: 'default' }}
    >
      <div className="icon-circle" style={{ marginBottom: '20px' }}>
        {feature.icon}
      </div>
      <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px' }}>
        {feature.title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
        {feature.desc}
      </p>
    </motion.div>
  );
}

/* ===== STAT CARD ===== */
function StatCard({ stat, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, type: 'spring', stiffness: 200 }}
      style={{ textAlign: 'center' }}
    >
      <div style={{ color: 'var(--accent-primary)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
        {stat.icon}
      </div>
      <div className="font-display gradient-text" style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
        {stat.value}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
        {stat.label}
      </div>
    </motion.div>
  );
}

/* ===== MAIN LANDING PAGE ===== */
export default function Landing() {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Wrapper */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/images/ambient-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        zIndex: -2,
        opacity: 0.85, // New image is very subtle, can afford higher opacity
      }} />

      {/* ===== HERO SECTION ===== */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '120px 24px',
        overflow: 'hidden',
      }}>
        {/* Hero Background Layer (blends into ambient background) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(to bottom, rgba(5, 10, 24, 0.2), rgba(5, 10, 24, 0.85)), url(/images/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -1,
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
        }} />
        <div style={{ maxWidth: '800px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-primary-subtle)',
              border: '1px solid rgba(0, 212, 170, 0.2)',
              marginBottom: '32px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--accent-primary)',
            }}
          >
            <Sparkles size={14} /> Powered by Gemini AI
          </motion.div>

          {/* Animated Headline — word-by-word reveal */}
          <AnimatedHeadline
            text="Plan Your Dream Journey in Seconds"
            className="font-display"
            style={{
              fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '24px',
              justifyContent: 'center',
            }}
          />

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: '600px',
              margin: '0 auto 40px',
            }}
          >
            AI-powered itineraries, real budget estimates, curated hotels, and smart packing lists — all generated in under 30 seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href={user ? '/plan' : '/register'} style={{ textDecoration: 'none' }}>
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '16px 36px',
                  fontSize: '1.05rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                Start Planning <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link href={user ? '/dashboard' : '/login'} style={{ textDecoration: 'none' }}>
              <motion.button
                className="btn-secondary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '16px 36px',
                  fontSize: '1.05rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {user ? 'View My Trips' : 'Sign In'}
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust signal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '32px',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
            }}
          >
            <Shield size={14} /> Free to use · No credit card required
          </motion.div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 24px 80px',
      }}>
        <div className="glass-card" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '32px',
          padding: '40px 32px',
        }}>
          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section style={{ padding: '60px 24px 120px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <div className="badge badge-info" style={{ marginBottom: '16px' }}>
              <Compass size={12} /> Features
            </div>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, marginBottom: '16px' }}>
              Everything You Need to{' '}
              <span className="gradient-text">Travel Smart</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '550px', margin: '0 auto' }}>
              From AI-crafted itineraries to budget breakdowns, we handle the planning so you can focus on the adventure.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {FEATURES.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section style={{ padding: '40px 24px 120px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '60px 40px',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.08) 0%, rgba(124, 92, 252, 0.08) 100%)',
            border: '1px solid rgba(0, 212, 170, 0.12)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '12px' }}>
              Ready for Your Next Adventure?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '450px', margin: '0 auto 32px' }}>
              Join thousands of travelers who plan smarter with AI.
            </p>
            <Link href={user ? '/plan' : '/register'} style={{ textDecoration: 'none' }}>
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '16px 40px',
                  fontSize: '1.05rem',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Globe size={18} /> Start Free
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        borderTop: '1px solid var(--glass-border)',
        padding: '40px 24px',
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'rgba(10, 15, 26, 0.5)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>© 2026 TripCraft AI.</span>
            <span>Developed by</span>
            <Link href="https://github.com/TSM-ArpitSG" target="_blank" rel="noopener noreferrer">
              <motion.span 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  color: 'white', 
                  backgroundColor: 'rgba(0, 212, 170, 0.15)',
                  border: '1px solid rgba(0, 212, 170, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(0, 212, 170, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 212, 170, 0.25)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 212, 170, 0.4)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 212, 170, 0.15)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 212, 170, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 170, 0.3)';
                }}
              >
                Arpit Singh <Globe size={12} style={{ marginLeft: '6px' }} />
              </motion.span>
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy', 'Terms', 'Contact'].map((item) => (
              <span
                key={item}
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </footer>

      {/* ===== RESPONSIVE STYLES ===== */}
      <style jsx>{`
        @media (max-width: 768px) {
          section:first-child { min-height: 80vh !important; padding-top: 80px !important; }
        }
        @media (max-width: 600px) {
          .glass-card { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; padding: 28px 20px !important; }
        }
      `}</style>
    </div>
  );
}
