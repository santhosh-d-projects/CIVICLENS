import React, { useState, useEffect } from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { AshokaChakra, IndiaFlag } from './IndiaFlag';

/**
 * CelebrationOverlay component
 * A memorable, tasteful, first-entry Independence Day celebration.
 * Shows once per session (via sessionStorage) and fades smoothly into CivicLens.
 */
export const CelebrationOverlay = () => {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check if user already saw the celebration in this browser session
    const hasSeen = sessionStorage.getItem('civiclens_id_celebrated_2026');
    if (!hasSeen) {
      // Check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        // If reduced motion is requested, record and don't show full animation
        sessionStorage.setItem('civiclens_id_celebrated_2026', 'true');
        return;
      }

      // Small delay to allow initial render, then show celebration
      const timer = setTimeout(() => {
        setVisible(true);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setFading(true);
    sessionStorage.setItem('civiclens_id_celebrated_2026', 'true');
    setTimeout(() => {
      setVisible(false);
    }, 450);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'rgba(28, 24, 20, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Independence Day 2026 Celebration"
    >
      {/* Ambient Tricolor Glow behind card */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 filter blur-3xl"
          style={{ background: '#FF9933' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-25 filter blur-3xl"
          style={{ background: '#FFFFFF' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 filter blur-3xl"
          style={{ background: '#138808' }}
        />
      </div>

      {/* Main Celebration Card */}
      <div
        className="relative max-w-lg w-full cl-card p-6 sm:p-8 rounded-2xl text-center shadow-2xl border overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #FAF6F0 0%, #FCF9F5 100%)',
          borderColor: 'var(--ink-border-2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        {/* Top Tricolor Strip */}
        <div className="tricolor-strip absolute top-0 left-0 right-0" />

        {/* Close / Skip button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 text-ink-muted hover:text-ink-text transition-colors"
          aria-label="Skip celebration"
        >
          <X size={18} />
        </button>

        {/* Central Badge with rotating Ashoka Chakra */}
        <div className="flex justify-center mb-4 mt-2">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-md relative"
            style={{
              background: '#FFFFFF',
              borderColor: 'var(--ink-border)'
            }}
          >
            <AshokaChakra size={36} color="#000080" spin={true} />
          </div>
        </div>

        {/* National Flag */}
        <div className="flex justify-center mb-3">
          <IndiaFlag width={64} height={42} waving={true} rounded={true} />
        </div>

        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 border"
          style={{
            background: 'var(--ink-surface-2)',
            borderColor: 'var(--ink-border)',
            color: 'var(--ink-text)'
          }}
        >
          <span>🇮🇳</span>
          <span style={{ color: 'var(--tricolor-saffron-dark)' }}>15 AUGUST 2026</span>
          <span style={{ color: 'var(--ink-subtle)' }}>•</span>
          <span style={{ color: 'var(--tricolor-green-dark)' }}>INDEPENDENCE DAY</span>
        </div>

        {/* Main Title */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--ink-text)' }}>
          Happy Independence Day
        </h2>

        {/* Supporting message */}
        <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-accent-text)' }}>
          "Building a more transparent India, one public project at a time."
        </p>

        <p className="text-xs leading-relaxed max-w-sm mx-auto mb-6" style={{ color: 'var(--ink-muted)' }}>
          Empowering every citizen with verified public project commitments, sanctioned budgets, and ground-level proof.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleDismiss}
            className="cl-btn cl-btn--primary w-full sm:w-auto px-6 py-2.5 text-sm font-bold shadow-md flex items-center justify-center gap-2"
          >
            <span>Continue to CivicLens</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Footer info note */}
        <p className="text-[10px] mt-4" style={{ color: 'var(--ink-subtle)' }}>
          CIVICLENS TRANSPARENCY NETWORK • PROMISE → PROOF
        </p>
      </div>
    </div>
  );
};

export default CelebrationOverlay;
