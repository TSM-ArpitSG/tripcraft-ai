/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * Navbar — Scroll-aware with custom logo,
 * Lucide icons, mobile drawer, logout modal
 * ==========================================
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Map, Sparkles, LogOut, User, Menu, X } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname(); // Used to detect active page for conditional rendering

  // ==============================
  // UI State
  // ==============================
  const [scrolled, setScrolled] = useState(false);       // Tracks whether user has scrolled past 20px
  const [mobileOpen, setMobileOpen] = useState(false);   // Controls the mobile hamburger drawer
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Confirmation modal before logout

  // Hide nav buttons on auth pages — they have their own dedicated CTAs
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // ==============================
  // Scroll Detection
  // Adds a passive scroll listener to toggle the glassy background
  // when the user scrolls below 20px from the top.
  // ==============================
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * handleLogout
   * Closes both the mobile drawer and the confirmation modal,
   * then delegates to the AuthContext logout() method.
   */
  const handleLogout = () => {
    setShowLogoutModal(false);
    setMobileOpen(false);
    logout();
  };

  return (
    <>
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 50,
          background: scrolled ? 'rgba(5, 10, 24, 0.6)' : 'rgba(5, 10, 24, 0.0)',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0)',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}>
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <motion.div whileHover={{ rotate: 15 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Logo />
            </motion.div>
            <span className="font-display" style={{
              fontSize: '1.3rem',
              fontWeight: 700,
            }}>
              <span className="gradient-text">TripCraft</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500, marginLeft: '4px' }}>AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }} className="nav-desktop">
            {user ? (
              <>
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <motion.div
                    className="btn-secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '8px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Home
                  </motion.div>
                </Link>
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                  <motion.div
                    className="btn-secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '8px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Map size={16} /> My Trips
                  </motion.div>
                </Link>
                <Link href="/plan" style={{ textDecoration: 'none' }}>
                  <motion.div
                    className="btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '8px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Sparkles size={16} /> Plan Trip
                  </motion.div>
                </Link>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginLeft: '8px',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--gradient-hero)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'white',
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLogoutModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-body)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'color 0.3s',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-rose)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <LogOut size={14} /> Logout
                  </motion.button>
                </div>
              </>
            ) : (
              !isAuthPage ? (
                <>
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <motion.div
                      className="btn-secondary"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                    >
                      Sign In
                    </motion.div>
                  </Link>
                  <Link href="/register" style={{ textDecoration: 'none' }}>
                    <motion.div
                      className="btn-primary"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                    >
                      Get Started
                    </motion.div>
                  </Link>
                </>
              ) : (
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <motion.div
                    className="btn-secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '8px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Home
                  </motion.div>
                </Link>
              )
            )}
          </div>

          {/* Mobile Hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="nav-mobile-toggle"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '300px', // slightly wider
              background: 'rgba(5, 10, 24, 0.4)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderLeft: '1px solid var(--glass-border)',
              zIndex: 49,
              padding: '100px 24px 40px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px', // slightly more gap
              overflow: 'hidden', // to contain orb
            }}
          >
            {/* Decorative ambient orb to fill empty space */}
            <div style={{
              position: 'absolute',
              top: '-10%',
              right: '-20%',
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 212, 170, 0.15), transparent 70%)',
              zIndex: -1,
              filter: 'blur(40px)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '10%',
              left: '-20%',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124, 92, 252, 0.15), transparent 70%)',
              zIndex: -1,
              filter: 'blur(40px)',
            }} />

            {user ? (
              <>
                {/* User greeting */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 700, color: 'white',
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user.email}</div>
                  </div>
                </div>

                {[
                  { href: '/', icon: <Compass size={20} />, label: 'Home', desc: 'Return to landing page' },
                  { href: '/dashboard', icon: <Map size={20} />, label: 'My Trips', desc: 'View saved itineraries' },
                  { href: '/plan', icon: <Sparkles size={20} />, label: 'Plan New Trip', desc: 'AI-powered generation' },
                ].map((item, i) => (
                  <motion.div key={item.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                    <Link href={item.href} onClick={() => setMobileOpen(false)} style={{
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '16px', borderRadius: '16px', color: 'var(--text-primary)',
                      background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)',
                      transition: 'all 0.3s ease',
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 212, 170, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(0, 212, 170, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{item.label}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                <motion.button
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                  onClick={() => { setMobileOpen(false); setShowLogoutModal(true); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '10px', color: 'var(--accent-rose)',
                    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem', transition: 'background 0.2s', marginTop: 'auto',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-rose-glow)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={18} /> Logout
                </motion.button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Start Your Journey</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join TripCraft AI to create smart, personalized itineraries.</p>
                </div>
                
                {!isAuthPage ? (
                  <>
                    <Link href="/register" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                      <motion.div
                        className="btn-primary"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        style={{ padding: '16px', fontSize: '1rem', textAlign: 'center', borderRadius: '12px' }}
                      >
                        Create Free Account
                      </motion.div>
                    </Link>
                    
                    <Link href="/login" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                      <motion.div
                        className="btn-secondary"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        style={{ padding: '16px', fontSize: '1rem', textAlign: 'center', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}
                      >
                        Sign In to Dashboard
                      </motion.div>
                    </Link>
                  </>
                ) : (
                  <Link href="/" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                    <motion.div
                      className="btn-secondary"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      style={{ padding: '16px', fontSize: '1rem', textAlign: 'center', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}
                    >
                      Return Home
                    </motion.div>
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: 'center' }}
            >
              <div style={{ margin: '0 auto 20px', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-rose-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={28} color="var(--accent-rose)" />
              </div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
                Ready to leave?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                You can always come back and continue planning your adventures.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-secondary"
                  onClick={() => setShowLogoutModal(false)}
                  style={{ flex: 1, padding: '12px' }}
                >
                  Stay
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-danger"
                  onClick={handleLogout}
                  style={{ flex: 1, padding: '12px' }}
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile-specific CSS */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}
