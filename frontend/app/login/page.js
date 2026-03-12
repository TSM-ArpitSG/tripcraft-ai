/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * Login Page — Premium split-screen auth
 * with animated inputs, Lucide icons
 * ==========================================
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Globe, Loader2, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  // ==============================
  // Form State
  // ==============================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  /**
   * handleSubmit
   * Fires on form submission. Calls AuthContext's login
   * (which handles JWT storage), then redirects to /dashboard.
   * On failure, surfaces a toast and inline error message.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '110px 24px 40px',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: '1100px',
          minHeight: '650px',
          borderRadius: '24px',
          background: 'rgba(10, 15, 30, 0.5)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          position: 'relative',
        }}
        className="auth-container"
      >
        {/* Left Side: Visual/Branding (Hidden on mobile via CSS) */}
        <div className="auth-visual" style={{
          flex: 1,
          position: 'relative',
          padding: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, rgba(124, 92, 252, 0.1) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
        }}>
          {/* Animated Background Elements */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px',
              background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)',
              filter: 'blur(60px)', zIndex: 0,
            }}
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{
              position: 'absolute', bottom: '-20%', right: '-10%', width: '400px', height: '400px',
              background: 'radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)',
              filter: 'blur(80px)', zIndex: 0,
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ display: 'inline-flex', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Sparkles size={24} color="var(--accent-primary)" />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display" 
              style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}
            >
              Unlock The World <br/>With <span className="gradient-text">TripCraft AI</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '85%' }}
            >
              Experience a new era of travel planning. Instant personalized itineraries crafted just for you in seconds.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '16px', alignItems: 'center' }}
          >
             <div>
               <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent-primary)', marginBottom: '4px' }}>10,000+ Explorers</div>
               <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', maxWidth: '250px', lineHeight: 1.5 }}>Planning their dream trips daily. Welcome back to the community.</div>
             </div>
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <div style={{
          flex: 1,
          padding: '60px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(to right, rgba(10, 15, 30, 0.8), rgba(5, 10, 24, 0.95))',
          zIndex: 1,
        }}>
          <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
              <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
                Welcome Back
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Enter your details to access your dashboard.
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  style={{
                    background: 'rgba(255, 77, 106, 0.1)',
                    border: '1px solid rgba(255, 77, 106, 0.3)',
                    color: 'var(--accent-rose)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-rose)' }} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ 
                      width: '100%',
                      padding: '14px 16px 14px 46px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 212, 170, 0.2)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ 
                      width: '100%',
                      padding: '14px 46px 14px 46px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      letterSpacing: showPassword ? 'normal' : '2px',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 212, 170, 0.2)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px',
                      transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, boxShadow: '0 10px 20px -10px rgba(0, 212, 170, 0.5)' } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                style={{
                  padding: '16px',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  background: 'var(--gradient-hero)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Loader2 size={20} />
                    </motion.div>
                    Signing In...
                  </>
                ) : (
                  <>Sign In To Dashboard <ArrowRight size={18} /></>
                )}
              </motion.button>
            </form>

            <div style={{ marginTop: '32px', textAlign: 'center', position: 'relative' }}>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', width: '100%', position: 'absolute', top: '50%', zIndex: 0 }} />
              <span style={{ background: '#0a0f1e', padding: '0 16px', color: 'var(--text-muted)', fontSize: '0.85rem', position: 'relative', zIndex: 1 }}>
                New to TripCraft?
              </span>
            </div>

            <Link href="/register" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ background: 'rgba(255,255,255,0.08)' }}
                style={{
                  marginTop: '24px',
                  padding: '14px',
                  textAlign: 'center',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  transition: 'background 0.3s',
                }}
              >
                Create a Free Account
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Responsive override */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .auth-container {
            flex-direction: column !important;
            border-radius: 20px !important;
          }
          .auth-visual {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
