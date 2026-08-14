/**
 * CivicLens Homepage — Independence Day 2026 Edition.
 * Design: Elegant Indian Independence Day × Civic Transparency theme.
 * Integrates Indian Tricolor (Saffron #FF9933, White #FFFFFF, India Green #138808, Ashoka Chakra Navy #000080)
 * with CivicLens document-style precision and public accountability principles.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, DollarSign, Activity, ShieldCheck,
  ArrowRight, Eye, CheckCircle2, AlertCircle, Clock,
  Sparkles, Landmark, Users, Check
} from 'lucide-react';
import { IndiaFlag, AshokaChakra } from '../components/IndiaFlag';

export const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>

      {/* ── Hero — Independence Day Showcase ── */}
      <section
        className="border-b px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative overflow-hidden"
        style={{ borderColor: 'var(--ink-border)', background: 'var(--ink-surface)' }}
      >
        {/* Subtle Ashoka Chakra background watermark */}
        <div className="absolute right-[-40px] top-[-40px] pointer-events-none opacity-5 sm:opacity-10 select-none">
          <AshokaChakra size={360} spin={true} color="var(--tricolor-navy)" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          {/* Eyebrow: Independence Day Edition */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border shadow-sm"
            style={{
              background: 'var(--ink-surface-2)',
              borderColor: 'var(--ink-border)',
              color: 'var(--ink-text)'
            }}
          >
            <span aria-hidden="true" className="text-sm">🇮🇳</span>
            <span style={{ color: 'var(--tricolor-saffron-dark)' }}>INDEPENDENCE DAY</span>
            <span style={{ color: 'var(--ink-subtle)' }}>•</span>
            <span style={{ color: 'var(--tricolor-green-dark)' }}>15 AUGUST 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
            Government commitments.<br />
            Public funds. Actual progress.<br />
            <span style={{ color: 'var(--ink-accent)' }}>All in one transparent record.</span>
          </h1>

          <p
            className="text-base sm:text-lg max-w-2xl mx-auto mb-4 leading-relaxed font-medium"
            style={{ color: 'var(--ink-text)' }}
          >
            "Building a more transparent India, one public project at a time."
          </p>

          <p
            className="text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ color: 'var(--ink-muted)' }}
          >
            CivicLens connects official project announcements, budget allocations,
            contractor milestone updates, and ground-level citizen observations — with verified source citations —
            so citizens see what was promised and what is actually happening.
          </p>

          {/* National Flag & Actions */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center items-center gap-3">
              <Link
                to="/explore"
                className="cl-btn cl-btn--primary no-underline shadow-sm"
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

            {/* Respectful Waving Indian Flag */}
            <div className="flex items-center gap-3 pt-2">
              <IndiaFlag width={72} height={48} waving={true} rounded={true} />
              <div className="text-left text-xs" style={{ color: 'var(--ink-muted)' }}>
                <span className="font-bold block" style={{ color: 'var(--ink-text)' }}>Republic of India</span>
                <span>Civic Infrastructure Transparency Network</span>
              </div>
            </div>
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

          {/* Concept flow — 4 stages with subtle tricolor sequence */}
          <div className="flex flex-col sm:flex-row items-stretch gap-0">
            {[
              {
                icon: <FileText size={18} aria-hidden="true" />,
                step: '01',
                label: 'Promise',
                desc: 'Official government announcements, work orders, start dates, and committed timelines.',
                accent: 'var(--tricolor-saffron-dark)',
                badge: 'Saffron / Commitment'
              },
              {
                icon: <DollarSign size={18} aria-hidden="true" />,
                step: '02',
                label: 'Fund',
                desc: 'Public expenditure: sanctioned allocations, released funds, and reported spending.',
                accent: 'var(--status-ongoing-text)',
                badge: 'Chakra Blue / Sanction'
              },
              {
                icon: <Activity size={18} aria-hidden="true" />,
                step: '03',
                label: 'Progress',
                desc: 'Contractor milestone updates and government-verified completion percentage.',
                accent: 'var(--status-atrisk-text)',
                badge: 'Work in Motion'
              },
              {
                icon: <ShieldCheck size={18} aria-hidden="true" />,
                step: '04',
                label: 'Proof',
                desc: 'Citizen observations, photo evidence, and source-backed transparency scores.',
                accent: 'var(--tricolor-green-dark)',
                badge: 'Green / Ground Proof'
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
                  <h3 className="font-bold text-base mb-1" style={{ color: 'var(--ink-text)' }}>{item.label}</h3>
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

          {/* Operational status note with subtle tricolor border */}
          <div
            className="mt-4 px-4 py-3 rounded text-xs text-center border"
            style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)', color: 'var(--ink-muted)' }}
          >
            <span className="font-semibold text-ink-text">Civic Transparency Engine:</span> Official records, contractor submissions, citizen observations, and source citations synchronized in real-time.
          </div>
        </div>
      </section>

      {/* ── Dedicated Independence Day Section: Building a Transparent India ── */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-14 border-t relative overflow-hidden"
        style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)' }}
        aria-label="Building a Transparent India"
      >
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
              style={{ background: 'var(--ink-surface-2)', color: 'var(--tricolor-green-dark)', border: '1px solid var(--ink-border)' }}
            >
              <span>🇮🇳</span>
              <span>Civic Empowerment</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Building a Transparent India
            </h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              Independence is also about empowering citizens with the information they need to understand how public commitments become public outcomes.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Public Commitments',
                desc: 'Every bridge, road, and hospital begins with a clear public pledge and official timeline.',
                icon: <Landmark size={20} style={{ color: 'var(--tricolor-saffron-dark)' }} />
              },
              {
                title: 'Public Funds',
                desc: 'Audited rupee-by-rupee visibility into sanctioned budgets, releases, and expenditures.',
                icon: <DollarSign size={20} style={{ color: 'var(--status-ongoing-text)' }} />
              },
              {
                title: 'Verified Milestones',
                desc: 'Contractors submit verifiable field claims validated by government authorities.',
                icon: <Activity size={20} style={{ color: 'var(--status-atrisk-text)' }} />
              },
              {
                title: 'Citizen Oversight',
                desc: 'Empowering local communities to verify progress with photo proof and ground evidence.',
                icon: <Users size={20} style={{ color: 'var(--tricolor-green-dark)' }} />
              }
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="cl-card p-5 rounded-lg border transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)' }}
              >
                <div className="mb-3 p-2 rounded w-fit" style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)' }}>
                  {pillar.icon}
                </div>
                <h3 className="font-bold text-sm mb-1.5" style={{ color: 'var(--ink-text)' }}>
                  {pillar.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Callout Quote */}
          <div
            className="mt-8 p-4 sm:p-5 rounded-lg border text-center"
            style={{
              background: 'var(--ink-surface)',
              borderColor: 'var(--ink-border)'
            }}
          >
            <p className="text-xs sm:text-sm font-semibold italic" style={{ color: 'var(--ink-text)' }}>
              "Transparency strengthens public trust. When commitments are open to all, democracy thrives."
            </p>
            <p className="font-mono text-[11px] mt-1" style={{ color: 'var(--ink-subtle)' }}>
              15 AUGUST 2026 • CIVICLENS TRANSPARENCY NETWORK
            </p>
          </div>
        </div>
      </section>

      {/* ── Role access grid ── */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-12 border-t"
        style={{ background: 'var(--ink-base)', borderColor: 'var(--ink-border)' }}
        aria-label="Role-based access"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-lg font-bold mb-1">Who uses CivicLens</h2>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              Dedicated portals designed for every stakeholder in public development.
            </p>
          </div>
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
        className="mt-auto py-8 px-4 border-t text-center relative overflow-hidden"
        style={{ borderColor: 'var(--ink-border)', background: 'var(--ink-surface)' }}
      >
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Subtle tricolor footer line */}
          <div className="tricolor-strip-subtle mx-auto mb-4 rounded-full max-w-xs" aria-hidden="true" />
          
          <p className="text-xs font-semibold" style={{ color: 'var(--ink-text)' }}>
            Building a more transparent India through civic technology.
          </p>
          <p className="font-mono text-[11px]" style={{ color: 'var(--ink-muted)' }}>
            🇮🇳 15 AUGUST 2026 • CIVICLENS PLATFORM
          </p>
          <p className="text-[10px]" style={{ color: 'var(--ink-subtle)' }}>
            CivicLens — Civic transparency & accountability platform © 2026.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
