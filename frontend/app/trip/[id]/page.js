/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * Trip Detail — Animated tabs, timeline
 * itinerary, budget bars, hotel cards,
 * animated packing list with full CRUD
 * ==========================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Wallet, ArrowLeft, RefreshCw, Plus, X,
  Trash2, ChevronDown, ChevronUp, Check, ListChecks, Hotel,
  Clock, DollarSign, Star, Loader2, Package, Tag
} from 'lucide-react';

const TABS = [
  { id: 'itinerary', label: 'Itinerary', icon: <Calendar size={16} /> },
  { id: 'budget', label: 'Budget', icon: <Wallet size={16} /> },
  { id: 'hotels', label: 'Hotels', icon: <Hotel size={16} /> },
  { id: 'packing', label: 'Packing', icon: <ListChecks size={16} /> },
];

export default function TripPage() {
  const { id } = useParams();                              // Trip ID from the URL
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ==============================
  // Core Trip State
  // ==============================
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('itinerary'); // Controls which content tab is visible
  const [regenerating, setRegenerating] = useState(null);  // Stores day number being regenerated
  const [regenPreference, setRegenPreference] = useState('');
  const [showRegenInput, setShowRegenInput] = useState(null);
  const [addingActivity, setAddingActivity] = useState(null);
  const [expandedDay, setExpandedDay] = useState(0);       // Which day card is open in accordion

  // ==============================
  // Hotel & Packing List State
  // ==============================
  const [addingHotel, setAddingHotel] = useState(false);
  const [newHotel, setNewHotel] = useState({ name: '', category: 'Mid Range', rating: '4.0', priceRange: '', description: '', amenities: '' });
  const [addingPackingTo, setAddingPackingTo] = useState(null);
  const [categoryNewItem, setCategoryNewItem] = useState('');
  const [addingPacking, setAddingPacking] = useState(false);
  const [newPackingItem, setNewPackingItem] = useState({ category: 'General', item: '' });
  const [newActivity, setNewActivity] = useState({ time: '', name: '', description: '', estimatedCost: '' }); // Form state for adding a new activity to a day
  const [error, setError] = useState('');

  // ==============================
  // Auth Guard + Initial Fetch
  // Redirects unauthenticated users. Fetches trip if auth resolves.
  // ==============================
  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && id) fetchTrip();
  }, [user, authLoading, id]);

  /* ===== API HANDLERS (preserved exactly) ===== */
  const fetchTrip = async () => {
    try {
      const data = await api.getTrip(id);
      setTrip(data.trip);
    } catch (err) {
      setError('Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateDay = async (dayNumber) => {
    setRegenerating(dayNumber);
    try {
      const data = await api.regenerateDay(id, dayNumber, regenPreference);
      setTrip(data.trip);
      setShowRegenInput(null);
      toast.success('Day regenerated!');
    } catch (err) {
      toast.error('Failed to regenerate day. Try again.');
    } finally {
      setRegenerating(null);
    }
  };

  const handleRemoveActivity = async (dayNumber, actIdx) => {
    try {
      const data = await api.removeActivity(id, dayNumber, actIdx);
      setTrip(data.trip);
      toast.success('Activity removed.');
    } catch (err) {
      toast.error('Failed to remove activity.');
    }
  };

  const handleAddActivity = async (dayNumber) => {
    if (!newActivity.name.trim()) return;
    try {
      const data = await api.addActivity(id, dayNumber, newActivity);
      setTrip(data.trip);
      setAddingActivity(null);
      setNewActivity({ time: '', name: '', description: '', estimatedCost: '' });
      toast.success('Activity added!');
    } catch (err) {
      toast.error('Failed to add activity.');
    }
  };

  const handleTogglePacking = async (index) => {
    const updated = [...trip.packingList];
    updated[index] = { ...updated[index], packed: !updated[index].packed };
    try {
      const data = await api.updateTrip(id, { packingList: updated });
      setTrip(data.trip);
    } catch (err) {
      toast.error('Failed to update packing list.');
    }
  };

  /** 
   * Formats a user-entered Hotel into the Trip schema layout,
   * parses the comma-separated amenities, and pushes it to the backend.
   */
  const handleAddHotel = async () => {
    if (!newHotel.name.trim()) { toast.error('Hotel name required!'); return; }
    const hotelToAdd = { ...newHotel, amenities: newHotel.amenities.split(',').map(a => a.trim()).filter(Boolean) };
    const updatedHotels = [...(trip.hotels || []), hotelToAdd];
    try {
      const data = await api.updateTrip(id, { hotels: updatedHotels });
      setTrip(data.trip);
      setAddingHotel(false);
      setNewHotel({ name: '', category: 'Mid Range', rating: '4.0', priceRange: '', description: '', amenities: '' });
      toast.success('Hotel added!');
    } catch (error) {
      toast.error('Failed to add hotel.');
    }
  };

  /** Appends a custom packing item sequentially to a specific category */
  const handleAddPackingToCategory = async (category) => {
    if (!categoryNewItem.trim()) return;
    const updatedPacking = [...(trip.packingList || []), { category, item: categoryNewItem, packed: false }];
    try {
      const data = await api.updateTrip(id, { packingList: updatedPacking });
      setTrip(data.trip);
      setAddingPackingTo(null);
      setCategoryNewItem('');
      toast.success('Item added!');
    } catch (error) {
      toast.error('Failed to add item.');
    }
  };

  const handleAddPacking = async () => {
    if (!newPackingItem.item.trim()) { toast.error('Item name required!'); return; }
    const updatedPacking = [...(trip.packingList || []), { ...newPackingItem, packed: false }];
    try {
      const data = await api.updateTrip(id, { packingList: updatedPacking });
      setTrip(data.trip);
      setAddingPacking(false);
      setNewPackingItem({ category: 'General', item: '' });
      toast.success('Item added!');
    } catch (error) {
      toast.error('Failed to add item.');
    }
  };

  /** Filters out a hotel by its array index from the trip state and saves */
  const handleRemoveHotel = async (index) => {
    const updatedHotels = trip.hotels.filter((_, i) => i !== index);
    try {
      const data = await api.updateTrip(id, { hotels: updatedHotels });
      setTrip(data.trip);
      toast.success('Hotel removed.');
    } catch (err) {
      toast.error('Failed to remove hotel.');
    }
  };

  /** Filters out a single packing item using its mapped global index */
  const handleRemovePackingItem = async (globalIdx) => {
    const updatedPacking = trip.packingList.filter((_, i) => i !== globalIdx);
    try {
      const data = await api.updateTrip(id, { packingList: updatedPacking });
      setTrip(data.trip);
      toast.success('Item removed.');
    } catch (err) {
      toast.error('Failed to remove item.');
    }
  };

  /** Wipes out an entire category of packing items from the state array */
  const handleRemovePackingCategory = async (category) => {
    const updatedPacking = trip.packingList.filter(item => item.category !== category);
    try {
      const data = await api.updateTrip(id, { packingList: updatedPacking });
      setTrip(data.trip);
      toast.success(`Removed ${category} category.`);
    } catch (err) {
      toast.error('Failed to remove category.');
    }
  };

  /* ===== LOADING & ERROR STATES ===== */
  // Show full-page spinner while auth or trip data is resolving
  if (authLoading || loading) return <LoadingSpinner message="Loading your trip..." />;

  // Show error fallback with navigation back to Dashboard
  if (error) {
    return (
      <div className="content-wrapper" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <h2 className="font-display" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{error}</h2>
        <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </motion.button>
      </div>
    );
  }

  // Trip data hasn't arrived yet — avoid rendering empty JSX
  if (!trip) return null;

  /* ===== DATA HELPERS =====
   * These derived values are computed once per render from the trip
   * object to drive the Packing List and Budget tab UI.
   */

  // Group packing items by their category string (e.g. "Clothing", "Electronics")
  const packingCategories = [...new Set((trip.packingList || []).map(i => i.category))];
  const packingByCategory = {};
  (trip.packingList || []).forEach((item, idx) => {
    if (!packingByCategory[item.category]) packingByCategory[item.category] = [];
    // Attach globalIdx so each item can be removed by its original array position
    packingByCategory[item.category].push({ ...item, globalIdx: idx });
  });

  // Resolve the budget object (handles both legacy and new schema shapes)
  const budgetData = Object.keys(trip.budgetEstimate || {}).length > 0 ? trip.budgetEstimate : (typeof trip.budget === 'object' ? trip.budget : {});
  // Filter out meta-keys; only keep spendable category entries
  const budgetItems = Object.entries(budgetData).filter(([k]) => k !== 'total' && k !== 'currency' && k !== '_id');
  // Used to calculate relative bar widths in the Budget tab
  const maxBudget = Math.max(...budgetItems.map(([, v]) => parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0), 1);

  return (
    <div className="content-wrapper" style={{ paddingTop: '110px', paddingBottom: '80px' }}>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
        onClick={() => router.push('/dashboard')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500,
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
          marginBottom: '24px', padding: '6px 0',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </motion.button>

      {/* Trip Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '32px' }}
      >
        <h1 className="font-display" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, marginBottom: '12px' }}>
          <span className="gradient-text">{trip.destination}</span>
        </h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <span className="badge badge-info"><Calendar size={12} /> {trip.days} days</span>
          <span className="badge badge-warning"><Wallet size={12} /> {typeof trip.budget === 'string' ? `$${trip.budget.replace(/^\$/, '')}` : (trip.budget?.total ? `$${String(trip.budget.total).replace(/^\$/, '')}` : 'Budget')}</span>
          {trip.interests?.slice(0, 4).map(i => (
            <span key={i} className="badge badge-purple"><Tag size={10} /> {i}</span>
          ))}
        </div>
      </motion.div>

      {/* Tab Navigation with animated indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="tab-container"
        style={{ marginBottom: '32px', maxWidth: '500px' }}
      >
        {TABS.map(tab => (
          <motion.button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            whileTap={{ scale: 0.98 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="tab-indicator"
                style={{ position: 'absolute', inset: '4px', borderRadius: 'var(--radius-md)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
              {tab.icon} {tab.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* ===== ITINERARY TAB ===== */}
          {activeTab === 'itinerary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(trip.itinerary || []).map((day, idx) => {
                const isExpanded = expandedDay === idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="glass-card"
                    style={{ overflow: 'hidden' }}
                  >
                    {/* Day header — clickable to expand */}
                    <div
                      onClick={() => setExpandedDay(isExpanded ? null : idx)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '20px 24px', cursor: 'pointer',
                        borderBottom: isExpanded ? '1px solid var(--glass-border)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="icon-circle sm">
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{day.day || idx + 1}</span>
                        </div>
                        <div>
                          <div className="font-display" style={{ fontWeight: 700, fontSize: '1rem' }}>
                            Day {day.day || idx + 1}
                          </div>
                          {day.theme && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{day.theme}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {(day.activities || []).length} activities
                        </span>
                        {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: '20px 24px' }}>
                            {/* Activities timeline */}
                            {(day.activities || []).map((act, actIdx) => (
                              <div key={actIdx} style={{
                                display: 'flex', gap: '16px', position: 'relative',
                                paddingBottom: actIdx < day.activities.length - 1 ? '20px' : '0',
                              }}>
                                {/* Timeline line & dot */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' }}>
                                  <div style={{
                                    width: '10px', height: '10px', borderRadius: '50%',
                                    background: 'var(--accent-primary)', flexShrink: 0,
                                    boxShadow: '0 0 8px var(--accent-primary-glow)',
                                  }} />
                                  {actIdx < day.activities.length - 1 && (
                                    <div style={{
                                      width: '1px', flex: 1, marginTop: '4px',
                                      background: 'linear-gradient(to bottom, var(--accent-primary), transparent)',
                                    }} />
                                  )}
                                </div>

                                {/* Activity card */}
                                <div style={{ flex: 1, paddingBottom: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                    <div style={{ flex: 1 }}>
                                      {act.time && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                                          <Clock size={12} /> {act.time}
                                        </div>
                                      )}
                                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>{act.name || act.activity}</div>
                                      {act.description && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{act.description}</div>}
                                      {act.estimatedCost && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-warm)', fontSize: '0.8rem', marginTop: '6px' }}>
                                          <DollarSign size={12} /> {act.estimatedCost}
                                        </div>
                                      )}
                                    </div>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                      onClick={() => handleRemoveActivity(day.day || idx + 1, actIdx)}
                                      className="btn-icon danger"
                                      style={{ width: '30px', height: '30px', flexShrink: 0 }}
                                    >
                                      <Trash2 size={14} />
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                              <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                className="btn-secondary"
                                onClick={() => setAddingActivity(addingActivity === idx ? null : idx)}
                                style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Plus size={14} /> Add Activity
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                className="btn-secondary"
                                onClick={() => setShowRegenInput(showRegenInput === idx ? null : idx)}
                                disabled={regenerating === (day.day || idx + 1)}
                                style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                {regenerating === (day.day || idx + 1) ? (
                                  <><Loader2 size={14} className="animate-spin" /> Regenerating...</>
                                ) : (
                                  <><RefreshCw size={14} /> Regenerate Day</>
                                )}
                              </motion.button>
                            </div>

                            {/* Add Activity Form */}
                            <AnimatePresence>
                              {addingActivity === idx && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  style={{ overflow: 'hidden', marginTop: '16px', padding: '16px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}
                                >
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                    <input className="input-field" placeholder="Time (e.g. 10:00 AM)" value={newActivity.time} onChange={e => setNewActivity({ ...newActivity, time: e.target.value })} style={{ padding: '10px 14px', fontSize: '0.85rem' }} />
                                    <input className="input-field" placeholder="Activity name *" value={newActivity.name} onChange={e => setNewActivity({ ...newActivity, name: e.target.value })} style={{ padding: '10px 14px', fontSize: '0.85rem' }} />
                                  </div>
                                  <input className="input-field" placeholder="Description" value={newActivity.description} onChange={e => setNewActivity({ ...newActivity, description: e.target.value })} style={{ padding: '10px 14px', fontSize: '0.85rem', marginBottom: '10px' }} />
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <input className="input-field" placeholder="Est. Cost" value={newActivity.estimatedCost} onChange={e => setNewActivity({ ...newActivity, estimatedCost: e.target.value })} style={{ padding: '10px 14px', fontSize: '0.85rem', width: '140px' }} />
                                    <motion.button whileTap={{ scale: 0.95 }} className="btn-primary" onClick={() => handleAddActivity(day.day || idx + 1)} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                                      Add
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} className="btn-secondary" onClick={() => setAddingActivity(null)} style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                                      Cancel
                                    </motion.button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Regenerate Day Form */}
                            <AnimatePresence>
                              {showRegenInput === idx && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  style={{ overflow: 'hidden', marginTop: '12px' }}
                                >
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <input className="input-field" placeholder="Any preferences? (optional)" value={regenPreference} onChange={e => setRegenPreference(e.target.value)} style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem' }} />
                                    <motion.button whileTap={{ scale: 0.95 }} className="btn-primary" onClick={() => handleRegenerateDay(day.day || idx + 1)} style={{ padding: '10px 20px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                      Regenerate
                                    </motion.button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ===== BUDGET TAB ===== */}
          {activeTab === 'budget' && (
            <div className="glass-card" style={{ padding: '32px' }}>
              <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
                Budget Breakdown
              </h2>
              {budgetData.currency && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '28px' }}>
                  All estimates in {budgetData.currency}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {budgetItems.map(([key, value], i) => {
                  const numVal = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
                  const pct = Math.min((numVal / maxBudget) * 100, 100);
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                          ${String(value).replace(/^\$/, '')}
                        </span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '4px', background: 'var(--glass-bg)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            height: '100%', borderRadius: '4px',
                            background: 'var(--gradient-hero)',
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Total */}
              {budgetData.total && (
                <div style={{
                  marginTop: '32px', paddingTop: '20px',
                  borderTop: '1px solid var(--glass-border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    Estimated Total
                  </span>
                  <span className="font-display gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                    {budgetData.total}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ===== HOTELS TAB ===== */}
          {activeTab === 'hotels' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Hotels</h2>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-secondary"
                  onClick={() => setAddingHotel(!addingHotel)}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {addingHotel ? <X size={14} /> : <Plus size={14} />}
                  {addingHotel ? 'Cancel' : 'Add Hotel'}
                </motion.button>
              </div>

              {/* Add Hotel Form */}
              <AnimatePresence>
                {addingHotel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="glass-card"
                    style={{ marginBottom: '20px', padding: '24px', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <input className="input-field" placeholder="Hotel name *" value={newHotel.name} onChange={e => setNewHotel({ ...newHotel, name: e.target.value })} style={{ padding: '10px 14px', fontSize: '0.85rem' }} />
                      <select className="select-field" value={newHotel.category} onChange={e => setNewHotel({ ...newHotel, category: e.target.value })} style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
                        <option value="Budget">Budget</option>
                        <option value="Mid Range">Mid Range</option>
                        <option value="Luxury">Luxury</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <input className="input-field" placeholder="Rating" value={newHotel.rating} onChange={e => setNewHotel({ ...newHotel, rating: e.target.value })} style={{ padding: '10px 14px', fontSize: '0.85rem' }} />
                      <input className="input-field" placeholder="Price range" value={newHotel.priceRange} onChange={e => setNewHotel({ ...newHotel, priceRange: e.target.value })} style={{ padding: '10px 14px', fontSize: '0.85rem' }} />
                    </div>
                    <input className="input-field" placeholder="Description" value={newHotel.description} onChange={e => setNewHotel({ ...newHotel, description: e.target.value })} style={{ padding: '10px 14px', fontSize: '0.85rem', marginBottom: '12px' }} />
                    <input className="input-field" placeholder="Amenities (comma separated)" value={newHotel.amenities} onChange={e => setNewHotel({ ...newHotel, amenities: e.target.value })} style={{ padding: '10px 14px', fontSize: '0.85rem', marginBottom: '16px' }} />
                    <motion.button whileTap={{ scale: 0.97 }} className="btn-primary" onClick={handleAddHotel} style={{ padding: '10px 24px', fontSize: '0.88rem' }}>
                      <Plus size={14} style={{ marginRight: '4px' }} /> Add Hotel
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hotel Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {(trip.hotels || []).map((hotel, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="glass-card"
                    style={{ padding: '24px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{hotel.name}</h3>
                        <span className="badge" style={{
                          background: hotel.category === 'Luxury' ? 'rgba(245, 158, 11, 0.1)' : hotel.category === 'Budget' ? 'rgba(0, 212, 170, 0.1)' : 'rgba(77, 159, 255, 0.1)',
                          borderColor: hotel.category === 'Luxury' ? 'rgba(245, 158, 11, 0.25)' : hotel.category === 'Budget' ? 'rgba(0, 212, 170, 0.2)' : 'rgba(77, 159, 255, 0.2)',
                          color: hotel.category === 'Luxury' ? '#f59e0b' : hotel.category === 'Budget' ? '#00d4aa' : '#4d9fff',
                          fontSize: '0.72rem',
                        }}>
                          {hotel.category}
                        </span>
                      </div>
                      <motion.button whileTap={{ scale: 0.9 }} className="btn-icon danger" onClick={() => handleRemoveHotel(idx)} style={{ width: '30px', height: '30px' }}>
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                    {hotel.rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-amber)', fontSize: '0.82rem', marginBottom: '6px' }}>
                        <Star size={13} fill="var(--accent-amber)" /> {hotel.rating}
                      </div>
                    )}
                    {hotel.priceRange && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}>{hotel.priceRange}</div>}
                    {hotel.description && <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '8px' }}>{hotel.description}</div>}
                    {hotel.amenities?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {hotel.amenities.map((a, i) => (
                          <span key={i} style={{
                            padding: '2px 8px', borderRadius: 'var(--radius-full)',
                            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                            fontSize: '0.72rem', color: 'var(--text-muted)',
                          }}>{a}</span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {(!trip.hotels || trip.hotels.length === 0) && !addingHotel && (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                  <Hotel size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>No hotel suggestions yet</p>
                </div>
              )}
            </div>
          )}

          {/* ===== PACKING TAB ===== */}
          {activeTab === 'packing' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Packing List</h2>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-secondary"
                  onClick={() => setAddingPacking(!addingPacking)}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {addingPacking ? <X size={14} /> : <Plus size={14} />}
                  {addingPacking ? 'Cancel' : 'Add Item'}
                </motion.button>
              </div>

              {/* Add Packing Form */}
              <AnimatePresence>
                {addingPacking && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="glass-card"
                    style={{ marginBottom: '20px', padding: '20px', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <input className="input-field" placeholder="Category" value={newPackingItem.category} onChange={e => setNewPackingItem({ ...newPackingItem, category: e.target.value })} style={{ padding: '10px 14px', fontSize: '0.85rem', width: '160px' }} />
                      <input className="input-field" placeholder="Item name" value={newPackingItem.item} onChange={e => setNewPackingItem({ ...newPackingItem, item: e.target.value })} style={{ padding: '10px 14px', fontSize: '0.85rem', flex: 1, minWidth: '180px' }} />
                      <motion.button whileTap={{ scale: 0.95 }} className="btn-primary" onClick={handleAddPacking} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                        Add
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Packing Categories */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {packingCategories.map((category, catIdx) => {
                  const items = packingByCategory[category] || [];
                  const packedCount = items.filter(i => i.packed).length;
                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIdx * 0.06 }}
                      className="glass-card"
                      style={{ padding: '20px 24px' }}
                    >
                      {/* Category header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Package size={16} color="var(--accent-primary)" />
                          <span className="font-display" style={{ fontWeight: 700, fontSize: '0.95rem' }}>{category}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                            {packedCount}/{items.length}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="btn-icon"
                            onClick={() => setAddingPackingTo(addingPackingTo === category ? null : category)}
                            style={{ width: '28px', height: '28px' }}
                          >
                            <Plus size={14} />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="btn-icon danger"
                            onClick={() => handleRemovePackingCategory(category)}
                            style={{ width: '28px', height: '28px' }}
                          >
                            <Trash2 size={12} />
                          </motion.button>
                        </div>
                      </div>

                      {/* Add to category */}
                      <AnimatePresence>
                        {addingPackingTo === category && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden', marginBottom: '12px' }}
                          >
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input className="input-field" placeholder="New item" value={categoryNewItem} onChange={e => setCategoryNewItem(e.target.value)} style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }} />
                              <motion.button whileTap={{ scale: 0.95 }} className="btn-primary" onClick={() => handleAddPackingToCategory(category)} style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                                Add
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {items.map((item) => (
                          <motion.div
                            key={item.globalIdx}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                              background: item.packed ? 'rgba(0, 212, 170, 0.04)' : 'transparent',
                              transition: 'background 0.2s',
                            }}
                          >
                            {/* Custom animated checkbox */}
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleTogglePacking(item.globalIdx)}
                              style={{
                                width: '22px', height: '22px', borderRadius: '6px',
                                border: `2px solid ${item.packed ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                                background: item.packed ? 'var(--accent-primary)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, padding: 0,
                              }}
                            >
                              {item.packed && <Check size={13} color="white" strokeWidth={3} />}
                            </motion.button>
                            <span style={{
                              flex: 1, fontSize: '0.88rem',
                              textDecoration: item.packed ? 'line-through' : 'none',
                              color: item.packed ? 'var(--text-muted)' : 'var(--text-primary)',
                              transition: 'all 0.2s',
                            }}>
                              {item.item}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              className="btn-icon danger"
                              onClick={() => handleRemovePackingItem(item.globalIdx)}
                              style={{ width: '24px', height: '24px', opacity: 0.5 }}
                              whileHover={{ opacity: 1 }}
                            >
                              <X size={12} />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>

                      {/* Progress bar */}
                      <div style={{ marginTop: '12px', height: '3px', borderRadius: '2px', background: 'var(--glass-bg)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${items.length > 0 ? (packedCount / items.length) * 100 : 0}%` }}
                          transition={{ duration: 0.5 }}
                          style={{ height: '100%', borderRadius: '2px', background: 'var(--accent-primary)' }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {packingCategories.length === 0 && !addingPacking && (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                  <ListChecks size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>No packing items yet</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
