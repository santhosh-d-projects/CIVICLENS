/**
 * CivicLens Homepage.
 * Design: document-style header (no gradient hero), PROMISE→PROOF concept strip,
 * role access grid, minimal footer.
 * No glassmorphism. No gradient text. Weight and size carry hierarchy.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, DollarSign, Activity, ShieldCheck,
  ArrowRight, Eye, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>

      {/* ── Hero — document style, no gradient ── */}
      <section
        className="border-b px-4 sm:px-6 lg:px-8 py-14 sm:py-20"
        style={{ borderColor: 'var(--ink-border)', background: 'var(--ink-surface)' }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-block px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ background: 'var(--ink-surface-2)', color: 'var(--ink-muted)', border: '1px solid var(--ink-border)' }}
          >
            Civic transparency
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5 leading-tight">
            Government commitments.<br />
            Public funds. Actual progress.<br />
            <span style={{ color: 'var(--ink-accent)' }}>All in one transparent record.</span>
          </h1>

          <p
            className="text-base max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ color: 'var(--ink-muted)' }}
          >
            CivicLens connects official project announcements, budget allocations,
            contractor progress, and citizen observations — with source citations —
            so you can see what was promised and what is actually happening.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/explore"
              className="cl-btn cl-btn--primary no-underline"
              aria-label="Browse civic projects"
            >
              Explore projects <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link
              to="/register"
              className="cl-btn cl-btn--secondary no-underline"
              aria-label="Create an account"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROMISE → PROOF concept strip ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-12" aria-label="Platform overview">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-lg font-bold mb-1">From announcement to accountability</h2>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              CivicLens tracks each stage of the public project lifecycle with source citations.
            </p>
          </div>

          {/* Concept flow — horizontal on desktop, vertical stack on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch gap-0">
            {[
              {
                icon: <FileText size={18} aria-hidden="true" />,
                step: '01',
                label: 'Promise',
                desc: 'Official government announcements, work orders, start dates, and committed timelines.',
                accent: 'var(--status-ongoing-text)',
              },
              {
                icon: <DollarSign size={18} aria-hidden="true" />,
                step: '02',
                label: 'Fund',
                desc: 'Public expenditure: allocated budget, released funds, reported spending.',
                accent: 'var(--status-completed-text)',
              },
              {
                icon: <Activity size={18} aria-hidden="true" />,
                step: '03',
                label: 'Progress',
                desc: 'Contractor milestone updates and government-verified completion percentage.',
                accent: 'var(--status-atrisk-text)',
              },
              {
                icon: <ShieldCheck size={18} aria-hidden="true" />,
                step: '04',
                label: 'Proof',
                desc: 'Citizen observations, photo evidence, and source-backed transparency scores.',
                accent: 'var(--status-delayed-text)',
              },
            ].map((item, i, arr) => (
              <React.Fragment key={item.step}>
                <div
                  className="flex-1 p-5 rounded-none"
                  style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--ink-surface-2)', color: item.accent, border: `1px solid var(--ink-border)` }}
                    >
                      {item.icon}
                    </span>
                    <span className="font-mono text-xs" style={{ color: 'var(--ink-subtle)' }}>{item.step}</span>
                  </div>
                  <h3 className="font-bold text-base mb-1">{item.label}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                    {item.desc}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className="hidden sm:flex items-center justify-center flex-shrink-0 px-0"
                    style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)', borderLeft: 'none', borderRight: 'none', width: '28px' }}
                    aria-hidden="true"
                  >
                    <ArrowRight size={14} style={{ color: 'var(--ink-muted)' }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Milestone 2 status note */}
          <div
            className="mt-4 px-4 py-2.5 rounded text-xs text-center"
            style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)', color: 'var(--ink-subtle)' }}
          >
            Milestone 2 active: Promise + Fund layers fully operational. Progress + Proof in development.
          </div>
        </div>
      </section>

      {/* ── Role access grid ── */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-12 border-t"
        style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)' }}
        aria-label="Role-based access"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-bold text-center mb-6">Who uses CivicLens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                role: 'Citizen',
                tag: 'CITIZEN',
                headline: 'Explore & monitor',
                desc: 'Browse ward projects, view budget breakdowns, track timeline gaps, and submit on-the-ground observations.',
                cta: { label: 'Register as citizen', to: '/register' },
              },
              {
                role: 'Contractor',
                tag: 'CONTRACTOR',
                headline: 'View assigned work',
                desc: 'See projects you are responsible for, review timelines and budgets, and submit progress updates.',
                cta: { label: 'Contractor login', to: '/login' },
              },
              {
                role: 'Govt admin',
                tag: 'GOVERNMENT_ADMIN',
                headline: 'Manage & publish',
                desc: 'Create civic projects, assign contractors, set budgets and timelines, verify evidence, and publish to citizens.',
                cta: { label: 'Government login', to: '/login' },
              },
            ].map(r => (
              <div
                key={r.role}
                className="cl-card p-5 flex flex-col"
              >
                <span
                  className="cl-section-label px-2 py-0.5 rounded inline-block mb-3"
                  style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}
                >
                  {r.role.toUpperCase()}
                </span>
                <h3 className="text-base font-semibold mb-2">{r.headline}</h3>
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'var(--ink-muted)' }}>
                  {r.desc}
                </p>
                <Link
                  to={r.cta.to}
                  className="cl-btn cl-btn--secondary w-full justify-center no-underline text-sm"
                >
                  {r.cta.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="mt-auto py-6 px-4 border-t text-center"
        style={{ borderColor: 'var(--ink-border)', background: 'var(--ink-surface)' }}
      >
        <p className="text-xs" style={{ color: 'var(--ink-subtle)' }}>
          CivicLens — Civic transparency & accountability platform © 2026.
          All project data shown is sample/demo material.
        </p>
      </footer>
    </div>
  );
};
