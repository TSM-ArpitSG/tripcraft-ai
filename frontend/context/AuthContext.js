/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * AuthContext — Global authentication state
 * using React Context API + localStorage JWT
 * ==========================================
 */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// Create the auth context (default value: null until Provider mounts)
const AuthContext = createContext(null);

/**
 * AuthProvider
 * Wraps the entire app (via layout.js) and exposes:
 *   - user        : current user object (or null if unauthenticated)
 *   - loading     : true while we're checking localStorage on first mount
 *   - login()     : authenticates and persists JWT to localStorage
 *   - register()  : creates account and persists JWT to localStorage
 *   - logout()    : wipes JWT from localStorage and redirects to /login
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Prevents auth flicker on first render
  const router = useRouter();

  // ==============================
  // Rehydrate Session on Mount
  // Checks localStorage for an existing JWT and saved user object.
  // If found and valid, restores the session without a network call.
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Corrupted data — clear and force re-login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * register
   * Calls the backend /auth/register endpoint, stores the returned
   * JWT token and user object in localStorage, then updates context.
   */
  const register = async (name, email, password) => {
    const data = await api.register(name, email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    router.push('/dashboard');
    return data;
  };

  /**
   * login
   * Calls the backend /auth/login endpoint, stores the returned
   * JWT token and user object in localStorage, then updates context.
   */
  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    router.push('/dashboard');
    return data;
  };

  /**
   * logout
   * Clears all auth data from localStorage, resets user state,
   * and redirects to /login.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    // Expose auth state and methods to the entire component tree
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth
 * Custom hook to consume the AuthContext.
 * Throws a clear error if used outside of <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
