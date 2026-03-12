/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * Plan Wizard — Multi-step form with gradient
 * progress, animated transitions, Lucide icons
 * ==========================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Wallet, Heart, Sparkles, ArrowRight,
  ArrowLeft, Loader2, Check, DollarSign, Minus, Plus, X
} from 'lucide-react';

const STEPS = [
  { icon: <MapPin size={18} />, label: 'Destination' },
  { icon: <Calendar size={18} />, label: 'Duration' },
  { icon: <Wallet size={18} />, label: 'Budget' },
  { icon: <Heart size={18} />, label: 'Interests' },
];

const BUDGETS = [
  { value: 'budget', label: 'Budget', desc: 'Affordable stays & eats', icon: <DollarSign size={20} /> },
  { value: 'mid-range', label: 'Mid-Range', desc: 'Comfort meets value', icon: <Wallet size={20} /> },
  { value: 'luxury', label: 'Luxury', desc: 'Premium experiences', icon: <Sparkles size={20} /> },
];

const INTERESTS = [
  'Culture', 'Food', 'Adventure', 'Nature', 'History',
  'Nightlife', 'Shopping', 'Photography', 'Beach', 'Mountains',
  'Architecture', 'Art', 'Wellness', 'Sports', 'Wildlife',
];

const PLACEHOLDER_DESTINATIONS = ['Tokyo, Japan', 'Paris, France', 'Bali, Indonesia', 'New York, USA', 'Santorini, Greece'];

/* Transition variants for steps */
const stepVariants = {
  enter: (direction) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -100 : 100, opacity: 0 }),
};

export default function PlanTrip() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [generating, setGenerating] = useState(false);

  // ==============================
  // Form State & Trackers
  // ==============================
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('mid-range');
  const [customBudget, setCustomBudget] = useState('');
  const [useCustomBudget, setUseCustomBudget] = useState(false);
  const [interests, setInterests] = useState([]);

  // ==============================
  // Cycling Placeholder Hook
  // Cycles the destination input placeholder every 3s
  // ==============================
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setPlaceholderIndex(p => (p + 1) % PLACEHOLDER_DESTINATIONS.length), 3000);
    return () => clearInterval(interval);
  }, []);

  // ==============================
  // Authentication Guard
  // Redirects unauthenticated users to the login portal.
  // ==============================
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  /** Methods to step backward/forward in Wizard */
  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, 3)); };
  const goPrev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 0)); };

  /** Toggles individual interest tags (adds/removes from array) */
  const toggleInterest = (i) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  /**
   * handleGenerate
   * Validates form data (destination, budget max/min, interests),
   * sets loading screen, fires API request to trigger the AI Generator,
   * completely builds custom Trip doc, then redirects user to it. 
   */
  const handleGenerate = async () => {
    if (!destination.trim()) { toast.error('Please enter a destination'); return; }
    if (useCustomBudget && (!customBudget || parseFloat(customBudget) < 5)) {
      toast.error('Custom budget must be at least $5');
      return;
    }
    if (interests.length === 0) {
      toast.error('Please select at least 1 interest');
      return;
    }

    setGenerating(true);
    try {
      const tripData = {
        destination: destination.trim(),
        days,
        budgetType: useCustomBudget ? `$${customBudget}` : budget,
        interests,
      };
      
      const res = await api.createTrip(tripData);
      toast.success('Trip generated!');
      
      // Destructure newly created ID
      const tripId = res.trip?._id || res.data?._id || res._id;
      
      // Push client to newly created planner hub
      router.push(`/trip/${tripId}`);
    } catch (err) {
      toast.error(err.message || 'AI engines need a quick breather! Please try generating again.');
    } finally {
      setGenerating(false);
    }
  };

  // Generating overlay
  if (generating) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
              scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'var(--gradient-hero)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px',
              boxShadow: '0 0 60px var(--accent-primary-glow)',
            }}
          >
            <Sparkles color="white" size={48} />
          </motion.div>
          <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>
            Crafting Your Perfect Trip
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Our AI is building a personalized itinerary for <strong style={{ color: 'var(--accent-primary)' }}>{destination}</strong>
          </p>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="content-wrapper plan-page-wrapper" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: 'calc(100vh - 70px)',
    }}>
      {/* Step Progress */}
      <style>{`
        .plan-page-wrapper {
          padding-top: 110px;
          padding-bottom: 80px;
        }
        .step-circle { width: 40px; height: 40px; }
        .step-line { width: 40px; }
        .plan-card {
          max-width: 560px; width: 100%; padding: 40px;
          min-height: 350px; position: relative; overflow: hidden;
        }
        @media (max-width: 640px) {
          .plan-page-wrapper {
             padding-top: 85px;
             padding-bottom: 40px;
          }
          .step-circle { width: 32px; height: 32px; }
          .step-line { width: 16px; }
          .plan-card {
            padding: 24px 20px;
            min-height: 380px;
          }
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '48px', flexWrap: 'wrap', justifyContent: 'center'
        }}
      >
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <motion.div
              className="step-circle"
              animate={{
                background: i <= step ? 'var(--accent-primary)' : 'var(--glass-bg)',
                borderColor: i <= step ? 'var(--accent-primary)' : 'var(--glass-border)',
                scale: i === step ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid',
                color: i <= step ? 'white' : 'var(--text-muted)',
                fontSize: '0.85rem', fontWeight: 600,
                boxShadow: i === step ? '0 0 20px var(--accent-primary-glow)' : 'none',
              }}
            >
              {i < step ? <Check size={16} /> : s.icon}
            </motion.div>
            <span style={{
              color: i <= step ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.85rem', fontWeight: 500,
              display: i === step ? 'block' : 'none',
            }}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div 
                className="step-line"
                style={{
                height: '2px',
                background: i < step ? 'var(--accent-primary)' : 'var(--glass-border)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </motion.div>

      {/* Step Content */}
      <div className="glass-card plan-card">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Step 0: Destination */}
            {step === 0 && (
              <div>
                <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>
                  Where to?
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.92rem' }}>
                  Enter any city, country, or region
                </p>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    className="input-field"
                    placeholder={PLACEHOLDER_DESTINATIONS[placeholderIndex]}
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    autoFocus
                    style={{ paddingLeft: '42px', fontSize: '1.05rem' }}
                  />
                </div>
              </div>
            )}

            {/* Step 1: Days */}
            {step === 1 && (
              <div style={{ textAlign: 'center' }}>
                <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>
                  How many days?
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '36px', fontSize: '0.92rem' }}>
                  We&apos;ll craft a detailed plan for each day
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px' }}>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setDays(Math.max(1, days - 1))}
                    className="btn-secondary"
                    style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Minus size={20} />
                  </motion.button>
                  <motion.div
                    key={days}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-display gradient-text"
                    style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1, minWidth: '80px' }}
                  >
                    {days}
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setDays(Math.min(15, days + 1))}
                    className="btn-secondary"
                    style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={20} />
                  </motion.button>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '12px' }}>
                  {days === 1 ? '1 day' : `${days} days`} (Max 15 days)
                </p>
              </div>
            )}

            {/* Step 2: Budget */}
            {step === 2 && (
              <div>
                <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>
                  Set your budget
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.92rem' }}>
                  This helps us tailor recommendations
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {BUDGETS.map(b => (
                    <motion.button
                      key={b.value}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => { setBudget(b.value); setUseCustomBudget(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 18px', borderRadius: 'var(--radius-md)',
                        border: `1px solid ${!useCustomBudget && budget === b.value ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                        background: !useCustomBudget && budget === b.value ? 'var(--accent-primary-subtle)' : 'var(--glass-bg)',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
                        transition: 'all 0.3s',
                        boxShadow: !useCustomBudget && budget === b.value ? '0 0 20px var(--accent-primary-glow)' : 'none',
                      }}
                    >
                      <div style={{
                        color: !useCustomBudget && budget === b.value ? 'var(--accent-primary)' : 'var(--text-muted)',
                      }}>
                        {b.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 600, fontSize: '0.95rem',
                          color: !useCustomBudget && budget === b.value ? 'var(--accent-primary)' : 'var(--text-primary)',
                        }}>
                          {b.label}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{b.desc}</div>
                      </div>
                      {!useCustomBudget && budget === b.value && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check size={18} color="var(--accent-primary)" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Custom budget toggle */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${useCustomBudget ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                    background: useCustomBudget ? 'var(--accent-primary-subtle)' : 'var(--glass-bg)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setUseCustomBudget(!useCustomBudget)}
                >
                  <DollarSign size={18} color={useCustomBudget ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: useCustomBudget ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                    Custom amount
                  </span>
                </div>
                <AnimatePresence>
                  {useCustomBudget && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden', marginTop: '12px' }}
                    >
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="Enter amount (min $5)"
                          value={customBudget}
                          onChange={e => setCustomBudget(e.target.value)}
                          min="5"
                          style={{ paddingLeft: '32px' }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Step 3: Interests */}
            {step === 3 && (
              <div>
                <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>
                  What excites you?
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.92rem' }}>
                  Select your interests for a personalized plan
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {INTERESTS.map(i => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleInterest(i)}
                      className={`interest-tag ${interests.includes(i) ? 'selected' : ''}`}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {i}
                    </motion.button>
                  ))}
                  {/* Custom interest tag */}
                  {interests.filter(i => !INTERESTS.includes(i)).map(i => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleInterest(i)}
                      className="interest-tag selected"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {i} <X size={12} style={{ marginLeft: '4px' }} />
                    </motion.button>
                  ))}
                </div>
                {/* Custom interest input */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <input
                    className="input-field"
                    placeholder="Other interests? (e.g. Hiking)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        const val = e.target.value.trim();
                        if (!interests.includes(val)) {
                          setInterests([...interests, val]);
                        }
                        e.target.value = '';
                      }
                    }}
                    style={{ padding: '10px 14px', fontSize: '0.85rem' }}
                  />
                </div>
                {interests.length > 0 && (
                  <p style={{ color: 'var(--accent-primary)', fontSize: '0.82rem', marginTop: '16px' }}>
                    {interests.length} interest{interests.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          display: 'flex', gap: '16px', marginTop: '32px',
          maxWidth: '560px', width: '100%', flexWrap: 'wrap',
        }}
      >
        {step > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="btn-secondary"
            onClick={goPrev}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} /> Back
          </motion.button>
        )}

        {step < 3 ? (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="btn-primary"
            onClick={goNext}
            disabled={(step === 0 && !destination.trim()) || (step === 2 && useCustomBudget && (!customBudget || parseFloat(customBudget) < 5))}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            Next <ArrowRight size={16} />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="btn-primary"
            onClick={handleGenerate}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }}
          >
            <Sparkles size={18} /> Generate Trip
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
