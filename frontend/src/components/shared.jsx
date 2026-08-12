/**
 * CivicLens shared UI primitives.
 * All components follow the design token system:
 * - Status pills: always icon + desaturated color + sentence-case label
 * - Trust labels: always shape + color + text — never color-only
 * - Monospace for all numeric/data values
 */
import React from 'react';
import {
  CheckCircle2, Activity, Clock, AlertCircle, Circle,
  MinusCircle, FileText, HardHat, Eye, HelpCircle, Loader2
} from 'lucide-react';
import { STATUS_CONFIG, TRUST_CONFIG } from '../constants/civic';

// ── StatusPill ─────────────────────────────────────────────────
// Always: icon + color + sentence-case label. Never color-only.
const ICON_MAP = {
  CheckCircle2, Activity, Clock, AlertCircle, Circle, MinusCircle
};

export function StatusPill({ status, className = '' }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    mod: 'planned',
    icon: 'Circle',
  };
  const Icon = ICON_MAP[cfg.icon] || Circle;
  return (
    <span
      className={`status-pill status-pill--${cfg.mod} ${className}`}
      aria-label={`Status: ${cfg.label}`}
      title={cfg.label}
    >
      <Icon size={11} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

// ── TrustLabel ─────────────────────────────────────────────────
// Source provenance — shape + color + text. First-class visual object.
const TRUST_ICONS = {
  OFFICIAL:   <FileText size={9} aria-hidden="true" />,
  CONTRACTOR: <HardHat  size={9} aria-hidden="true" />,
  CITIZEN:    <Eye      size={9} aria-hidden="true" />,
  UNVERIFIED: <HelpCircle size={9} aria-hidden="true" />,
};

export function TrustLabel({ type = 'UNVERIFIED', className = '' }) {
  const cfg = TRUST_CONFIG[type] || TRUST_CONFIG.UNVERIFIED;
  return (
    <span
      className={`trust-label trust-label--${cfg.mod} ${className}`}
      title={`Source: ${cfg.label}`}
    >
      {TRUST_ICONS[type] || TRUST_ICONS.UNVERIFIED}
      {cfg.label}
    </span>
  );
}

// ── BudgetFigure ───────────────────────────────────────────────
// All currency figures in JetBrains Mono, formatted consistently.
export function BudgetFigure({ amount, className = '', suffix = '' }) {
  if (amount == null || isNaN(amount)) return <span className={`font-mono text-ink-muted ${className}`}>—</span>;
  const lakhs = amount / 100000;
  const formatted = lakhs >= 100
    ? `₹${(amount / 10000000).toFixed(2)} Cr`
    : `₹${lakhs.toFixed(lakhs >= 10 ? 1 : 2)} L`;
  return (
    <span className={`font-mono font-medium ${className}`}>
      {formatted}{suffix}
    </span>
  );
}

// ── DateValue ──────────────────────────────────────────────────
// Dates always in monospace for scannability.
export function DateValue({ date, className = '' }) {
  if (!date) return <span className={`font-mono text-ink-muted ${className}`}>—</span>;
  return (
    <span className={`font-mono text-sm ${className}`}>
      {date}
    </span>
  );
}

// ── ProgressBar ────────────────────────────────────────────────
export function ProgressBar({ pct = 0, status, showLabel = true, className = '' }) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  const colorMap = {
    COMPLETED: 'bg-status-completed',
    ONGOING:   'bg-status-ongoing',
    DELAYED:   'bg-status-delayed',
    Completed: 'bg-status-completed',
    Ongoing:   'bg-status-ongoing',
    Delayed:   'bg-status-delayed',
  };
  const barColor = colorMap[status] || 'bg-status-ongoing';
  return (
    <div className={`${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-ink-muted">Progress</span>
          <span className="font-mono text-xs font-medium text-ink-text">{clamped}%</span>
        </div>
      )}
      <div className="h-1.5 bg-ink-surface-2 rounded-full overflow-hidden border border-ink-border">
        <div
          className={`h-full rounded-full pvr-bar-fill ${barColor}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// ── PromiseRealityBar (Signature element) ──────────────────────
// Visual comparison: promised timeline vs today's date.
// Renders: static if completed or on track; overrun segment if delayed.
// Degrades to static widths under prefers-reduced-motion.
export function PromiseRealityBar({ startDate, expectedDate, status, className = '' }) {
  if (!startDate || !expectedDate) return null;

  const start = new Date(startDate);
  const expected = new Date(expectedDate);
  const today = new Date();

  const totalPromised = expected - start;
  if (totalPromised <= 0) return null;

  const elapsed = today - start;
  const onTrackPct = Math.min((elapsed / totalPromised) * 100, 100);
  const isOverrun = today > expected && status !== 'COMPLETED' && status !== 'Completed';
  const daysDelta = Math.round((today - expected) / (1000 * 60 * 60 * 24));
  const overrunPct = isOverrun ? Math.min((daysDelta / (totalPromised / (1000 * 60 * 60 * 24))) * 100, 40) : 0;

  return (
    <div className={`${className}`} aria-label={isOverrun ? `${daysDelta} days past expected completion` : 'On track'}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-ink-muted">Timeline</span>
        {isOverrun ? (
          <span className="font-mono text-xs font-semibold" style={{ color: 'var(--status-delayed-text)' }}>
            +{daysDelta} days
          </span>
        ) : (
          <span className="font-mono text-xs text-ink-muted">
            Due {expectedDate}
          </span>
        )}
      </div>
      <div className="pvr-bar-track bg-ink-surface-2 border border-ink-border" style={{ borderRadius: '9999px', height: '6px', position: 'relative', overflow: 'visible' }}>
        {/* Promised fill (elapsed portion) */}
        <div
          className="pvr-bar-fill pvr-bar-fill--promised absolute inset-y-0 left-0"
          style={{ width: `${Math.min(onTrackPct, 100)}%`, borderRadius: '9999px' }}
        />
        {/* Overrun segment */}
        {isOverrun && (
          <div
            className="pvr-bar-fill pvr-bar-fill--overrun absolute inset-y-0"
            style={{
              left: '100%',
              width: `${overrunPct}%`,
              borderRadius: '0 9999px 9999px 0',
              opacity: 0.85,
            }}
          />
        )}
      </div>
      <div className="flex justify-between mt-1">
        <span className="font-mono text-[10px] text-ink-subtle">{startDate}</span>
        <span className={`font-mono text-[10px] ${isOverrun ? '' : 'text-ink-subtle'}`}
          style={isOverrun ? { color: 'var(--status-delayed-text)' } : {}}>
          {expectedDate}
        </span>
      </div>
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }) {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-ink-muted ${className}`}
      aria-label="Loading"
    />
  );
}

// ── EmptyState ─────────────────────────────────────────────────
export function EmptyState({ icon: Icon = Circle, title, body, action }) {
  return (
    <div className="cl-card p-12 text-center">
      <Icon size={32} className="text-ink-subtle mx-auto mb-3" aria-hidden="true" />
      <h3 className="text-base font-semibold text-ink-text mb-1">{title}</h3>
      {body && <p className="text-sm text-ink-muted mb-5">{body}</p>}
      {action}
    </div>
  );
}

// ── SectionLabel ───────────────────────────────────────────────
export function SectionLabel({ children, className = '' }) {
  return (
    <p className={`cl-section-label ${className}`}>{children}</p>
  );
}

// ── Toast ──────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onDismiss }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-token-lg border shadow-lg"
      style={{
        background: type === 'error' ? 'rgba(240,120,154,0.1)' : 'rgba(63,185,80,0.1)',
        borderColor: type === 'error' ? 'var(--status-delayed-border)' : 'var(--status-completed-border)',
        color: type === 'error' ? 'var(--status-delayed-text)' : 'var(--status-completed-text)',
        maxWidth: '360px',
      }}
    >
      {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      <span className="text-sm font-medium text-ink-text flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-ink-muted hover:text-ink-text transition-colors ml-1" aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
