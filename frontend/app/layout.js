/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * Root Layout — App Shell
 * ==========================================
 */

import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'TripCraft AI — Smart Travel Planner',
  description: 'Plan your perfect trip with AI-powered itineraries, budget estimates, hotel suggestions, and smart packing lists.',
  keywords: 'AI travel planner, trip itinerary, budget estimation, travel assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Sora display font for headings */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#131d35',
                color: '#f0f4f8',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                fontSize: '0.9rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              },
              success: {
                iconTheme: { primary: '#00d4aa', secondary: '#050a18' },
              },
              error: {
                iconTheme: { primary: '#ff4d6a', secondary: '#050a18' },
              },
            }}
          />
          {/* Animated background mesh */}
          <div className="bg-animated" />
          <div className="bg-orb-3" />
          <div className="page-container">
            <Navbar />
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
