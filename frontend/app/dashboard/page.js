/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * Dashboard — Premium trip cards, delete
 * modal, empty state, quick stats
 * ==========================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  MapPin, Calendar, Target, Plus, Trash2, ArrowRight,
  Sparkles, Compass, Wallet, Clock, Plane
} from 'lucide-react';

/* Helper for budget-based accent */
function getBudgetStyle(budget) {
  const b = String(budget || '').toLowerCase();
  if (b === 'luxury') return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' };
  if (b === 'mid-range') return { color: '#4d9fff', bg: 'rgba(77, 159, 255, 0.1)', border: 'rgba(77, 159, 255, 0.2)' };
  return { color: '#00d4aa', bg: 'rgba(0, 212, 170, 0.1)', border: 'rgba(0, 212, 170, 0.2)' };
}

/* Time-of-day greeting */
function getGreeting() {
  const h = new Date().getHours();
  let phrases = [];

  if (h >= 5 && h < 12) {
    phrases = ['Rise and shine', 'Good Morning', 'Ready for an adventure', 'Coffee and compass ready'];
  } else if (h >= 12 && h < 17) {
    phrases = ['Good Afternoon', 'Hope your day is going great', 'Midday explorations await', 'Adventure calls'];
  } else if (h >= 17 && h < 21) {
    phrases = ['Good Evening', 'Winding down for the day', 'Evening travels', 'Sunset vibes'];
  } else {
    phrases = ['Hey Night Owl', 'Late night planning', 'Dreaming of destinations', 'Midnight wanderlust'];
  }

  return phrases[Math.floor(Math.random() * phrases.length)];
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  // ==============================
  // State Management
  // ==============================
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null); // Stores ID of trip to delete
  const [deleting, setDeleting] = useState(false);
  const [greeting, setGreeting] = useState('');

  // ==============================
  // Initialization & Auth Guard
  // ==============================
  useEffect(() => {
    setGreeting(getGreeting());
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchTrips();
  }, [user, authLoading]);

  /**
   * Fetches all trips associated with the authenticated user
   * from the backend API and updates the local state.
   */
  const fetchTrips = async () => {
    try {
      const res = await api.getTrips();
      setTrips(res.trips || res.data || []);
    } catch {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes a specifically selected trip by its ID,
   * then removes it from the local state array.
   */
  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await api.deleteTrip(deleteModal);
      setTrips(trips.filter(t => t._id !== deleteModal));
      toast.success('Trip deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
      setDeleteModal(null);
    }
  };

  if (loading || authLoading) return <LoadingSpinner />;

  return (
    <div className="content-wrapper" style={{ paddingTop: '110px', paddingBottom: '80px' }}>
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '40px' }}
      >
        <h1 className="font-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '8px' }}>
          {greeting || 'Welcome'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          {trips.length > 0
            ? `You have ${trips.length} trip${trips.length > 1 ? 's' : ''} planned. Ready for the next one?`
            : 'Start planning your first adventure with AI.'}
        </p>
      </motion.div>

      {/* Quick Stats (only show if trips exist) */}
      {trips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          {[
            { icon: <Compass size={18} />, value: trips.length, label: 'Total Trips' },
            { icon: <Calendar size={18} />, value: trips.reduce((sum, t) => sum + (t.days || 0), 0), label: 'Days Planned' },
            { icon: <MapPin size={18} />, value: [...new Set(trips.map(t => t.destination))].length, label: 'Destinations' },
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={{
              padding: '20px', textAlign: 'center',
            }}>
              <div style={{ color: 'var(--accent-primary)', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {stat.value}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Header row with CTA */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
        }}
      >
        <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
          Your Trips
        </h2>
        <Link href="/plan" style={{ textDecoration: 'none' }}>
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '10px 22px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} /> New Trip
          </motion.button>
        </Link>
      </motion.div>

      {/* Trip Cards */}
      {trips.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{
            padding: '80px 40px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="icon-circle lg"
          >
            <Plane size={28} color="white" />
          </motion.div>
          <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            No trips yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '350px', fontSize: '0.92rem' }}>
            Your adventure starts here. Create your first AI-powered trip plan in seconds.
          </p>
          <Link href="/plan" style={{ textDecoration: 'none' }}>
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '14px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <Sparkles size={16} /> Plan Your First Trip
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}>
          {trips.map((trip, index) => {
            const budgetStyle = getBudgetStyle(trip.budget);
            return (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card card-3d"
                style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onClick={() => router.push(`/trip/${trip._id}`)}
              >
                {/* Card header strip */}
                <div style={{
                  height: '4px',
                  background: `linear-gradient(90deg, ${budgetStyle.color}, transparent)`,
                }} />

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Destination */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: budgetStyle.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <MapPin size={16} color={budgetStyle.color} />
                    </div>
                    <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, flex: 1 }}>
                      {trip.destination}
                    </h3>
                  </div>

                  {/* Meta tags */}
                  <div style={{
                    display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '12px',
                  }}>
                    <span className="badge" style={{
                      background: 'var(--glass-bg)',
                      borderColor: 'var(--glass-border)',
                      color: 'var(--text-secondary)',
                    }}>
                      <Calendar size={12} /> {trip.days} days
                    </span>
                    <span className="badge" style={{
                      background: budgetStyle.bg,
                      borderColor: budgetStyle.border,
                      color: budgetStyle.color,
                    }}>
                      <Wallet size={12} /> {typeof trip.budget === 'string' ? `$${trip.budget.replace(/^\$/, '')}` : (trip.budget?.total ? `$${String(trip.budget.total).replace(/^\$/, '')}` : 'Budget')}
                    </span>
                  </div>

                  {/* Interests */}
                  {trip.interests?.length > 0 && (
                    <div style={{
                      display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px',
                    }}>
                      {trip.interests.slice(0, 3).map((interest) => (
                        <span key={interest} style={{
                          fontSize: '0.75rem',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--accent-primary-subtle)',
                          color: 'var(--accent-primary)',
                        }}>
                          {interest}
                        </span>
                      ))}
                      {trip.interests.length > 3 && (
                        <span style={{
                          fontSize: '0.75rem', padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--glass-bg)', color: 'var(--text-muted)',
                        }}>
                          +{trip.interests.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: '16px', paddingTop: '12px',
                    borderTop: '1px solid var(--glass-border)',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 500,
                    }}>
                      View Trip <ArrowRight size={14} />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); setDeleteModal(trip._id); }}
                      className="btn-icon danger"
                      style={{ width: '34px', height: '34px' }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deleting && setDeleteModal(null)}
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
              <div style={{
                margin: '0 auto 20px', width: '56px', height: '56px',
                borderRadius: '50%', background: 'var(--accent-rose-glow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trash2 size={28} color="var(--accent-rose)" />
              </div>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
                Delete this trip?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                This action cannot be undone. All itinerary data, hotel picks, and packing lists will be permanently removed.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-secondary"
                  onClick={() => setDeleteModal(null)}
                  disabled={deleting}
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {deleting ? 'Deleting...' : <><Trash2 size={14} /> Delete</>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
