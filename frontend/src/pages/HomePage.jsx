/**
 * CivicLens Homepage — Independence Day 2026 Edition.
 * Design: World-class Indian Independence Day × Civic Transparency theme.
 * Integrates Indian Tricolor (Saffron #FF9933, White #FFFFFF, India Green #138808, Ashoka Chakra Navy #000080)
 * with CivicLens document-style precision and public accountability principles.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, DollarSign, Activity, ShieldCheck,
  ArrowRight, Eye, CheckCircle2, AlertCircle, Clock,
  Sparkles, Landmark, Users, Check, Award
} from 'lucide-react';
import { IndiaFlag, AshokaChakra } from '../components/IndiaFlag';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { FloatingTricolorParticles } from '../components/FloatingTricolorParticles';

export const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>
      {/* ── First-Entry Independence Day Celebration Overlay ── */}
      <CelebrationOverlay />

      {/* ── Hero — Independence Day Showcase with Ambient Tricolor Glow ── */}
      <section
        className="border-b px-4 sm:px-6 lg:px-8 py-14 sm:py-20 relative overflow-hidden"
        style={{ borderColor: 'var(--ink-border)', background: 'var(--ink-surface)' }}
      >
        {/* Ambient Tricolor Lighting Mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10 filter blur-3xl"
            style={{ background: 'var(--tricolor-saffron)' }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-10 filter blur-3xl"
            style={{ background: 'var(--tricolor-green)' }}
          />
        </div>

        {/* Ambient Floating Tricolor Particles */}
        <FloatingTricolorParticles count={14} />

        {/* Subtle Ashoka Chakra background watermark */}
        <div className="absolute right-[-60px] top-[-60px] pointer-events-none opacity-5 sm:opacity-10 select-none">
          <AshokaChakra size={420} spin={true} color="var(--tricolor-navy)" />
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
            className="text-base sm:text-lg max-w-2xl mx-auto mb-4 leading-relaxed font-semibold"
            style={{ color: 'var(--ink-accent-text)' }}
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
                className="cl-btn cl-btn--primary no-underline shadow-md"
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
      <section className="px-4 sm:px-6 lg:px-8 py-14" aria-label="Platform overview">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-1">From announcement to accountability</h2>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              CivicLens tracks each stage of the public project lifecycle with source citations.
            </p>
          </div>

          {/* Concept flow — 4 stages with subtle tricolor sequence */}
          <div className="flex flex-col sm:flex-row items-stretch gap-0 rounded-lg overflow-hidden border shadow-sm" style={{ borderColor: 'var(--ink-border)' }}>
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
                  style={{ background: 'var(--ink-surface)', borderRight: i < arr.length - 1 ? '1px solid var(--ink-border)' : 'none' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--ink-surface-2)', color: item.accent, border: `1px solid var(--ink-border)` }}
                    >
                      {item.icon}
                    </span>
                    <span className="font-mono text-xs font-bold" style={{ color: 'var(--ink-subtle)' }}>{item.step}</span>
                  </div>
                  <h3 className="font-bold text-base mb-1" style={{ color: 'var(--ink-text)' }}>{item.label}</h3>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                    {item.desc}
                  </p>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Operational status note with subtle tricolor border */}
          <div
            className="mt-4 px-4 py-3 rounded-lg text-xs text-center border"
            style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)', color: 'var(--ink-muted)' }}
          >
            <span className="font-bold text-ink-text">Civic Transparency Engine:</span> Official records, contractor submissions, citizen observations, and source citations synchronized in real-time.
          </div>
        </div>
      </section>

      {/* ── Dedicated Independence Day Section: Building a Transparent India ── */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-16 border-t relative overflow-hidden"
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
                className="cl-card p-5 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)' }}
              >
                <div className="mb-3 p-2.5 rounded-lg w-fit" style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)' }}>
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
            className="mt-10 p-5 sm:p-6 rounded-xl border text-center relative overflow-hidden"
            style={{
              background: 'var(--ink-surface)',
              borderColor: 'var(--ink-border)'
            }}
          >
            <div className="tricolor-strip-subtle absolute top-0 left-0 right-0" />
            <p className="text-sm sm:text-base font-semibold italic pt-1" style={{ color: 'var(--ink-text)' }}>
              "Transparency strengthens public trust. When commitments are open to all, democracy thrives."
            </p>
            <p className="font-mono text-xs mt-2" style={{ color: 'var(--ink-muted)' }}>
              🇮🇳 15 AUGUST 2026 • CIVICLENS TRANSPARENCY NETWORK
            </p>
          </div>
        </div>
      </section>

      {/* ── Government Schemes & Yojanas Showcase ── */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-16 border-t relative overflow-hidden"
        style={{ background: 'var(--ink-base)', borderColor: 'var(--ink-border)' }}
        aria-label="Government Schemes and Yojanas"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border shadow-sm"
                style={{
                  background: 'var(--ink-surface)',
                  borderColor: 'var(--ink-border)',
                  color: 'var(--ink-text)',
                }}
              >
                <span>🇮🇳</span>
                <span style={{ color: 'var(--tricolor-saffron-dark)' }}>CITIZEN BENEFIT ACCESS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                Government Schemes & Yojanas
              </h2>
              <p className="text-sm sm:text-base max-w-2xl leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                "Transparency is not only about knowing where public money goes. It is also about knowing what public benefits are available to you."
              </p>
            </div>

            <Link
              to="/schemes"
              className="cl-btn cl-btn--primary flex-shrink-0 self-start md:self-auto flex items-center gap-1.5 no-underline shadow-sm"
            >
              <span>Explore Government Schemes</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* 4 Featured Schemes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                id: 'pm-kisan',
                name: 'PM-KISAN',
                gov: 'Central Govt',
                isCentral: true,
                cat: 'Agriculture & Farmers',
                benefit: '₹6,000 / year income support',
                desc: 'Direct benefit transfer for all eligible landholding farmer families across India.'
              },
              {
                id: 'gruha-lakshmi',
                name: 'Gruha Lakshmi',
                gov: 'Karnataka Govt',
                isCentral: false,
                cat: 'Women & Welfare',
                benefit: '₹2,000 / month financial aid',
                desc: 'Direct financial assistance for women heads of households in Karnataka.'
              },
              {
                id: 'gruha-jyothi',
                name: 'Gruha Jyothi',
                gov: 'Karnataka Govt',
                isCentral: false,
                cat: 'Electricity & Utilities',
                benefit: 'Up to 200 units free power',
                desc: 'Guaranteed zero-bill domestic electricity for residential consumers in Karnataka.'
              },
              {
                id: 'yuva-nidhi',
                name: 'Yuva Nidhi',
                gov: 'Karnataka Govt',
                isCentral: false,
                cat: 'Jobs & Employment',
                benefit: '₹3,000 / month youth allowance',
                desc: 'Unemployment financial aid and skill training for educated youth in Karnataka.'
              }
            ].map((scheme) => (
              <Link
                key={scheme.id}
                to={`/schemes/${scheme.id}`}
                className="cl-card p-5 rounded-xl border flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md no-underline group"
                style={{
                  background: 'var(--ink-surface)',
                  borderColor: 'var(--ink-border)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                      style={{
                        background: scheme.isCentral ? 'rgba(255, 153, 51, 0.1)' : 'rgba(19, 136, 8, 0.1)',
                        borderColor: scheme.isCentral ? 'var(--tricolor-saffron-dark)' : 'var(--tricolor-green-dark)',
                        color: scheme.isCentral ? 'var(--tricolor-saffron-dark)' : 'var(--tricolor-green-dark)',
                      }}
                    >
                      {scheme.gov}
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: 'var(--ink-subtle)' }}>
                      {scheme.cat}
                    </span>
                  </div>

                  <h3 className="font-bold text-base mb-1 group-hover:text-ink-accent transition-colors" style={{ color: 'var(--ink-text)' }}>
                    {scheme.name}
                  </h3>

                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--ink-muted)' }}>
                    {scheme.desc}
                  </p>
                </div>

                <div className="pt-2.5 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--ink-border)' }}>
                  <span className="font-bold text-[11px]" style={{ color: 'var(--status-completed-text)' }}>
                    {scheme.benefit}
                  </span>
                  <span className="font-semibold text-ink-accent flex items-center gap-0.5 text-[11px]">
                    Details <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/schemes"
              className="cl-btn cl-btn--secondary text-xs font-bold inline-flex items-center gap-1.5 no-underline px-5 py-2.5"
            >
              <span>View All Central & Karnataka Schemes ({13}+)</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Role access grid ── */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-14 border-t"
        style={{ background: 'var(--ink-base)', borderColor: 'var(--ink-border)' }}
        aria-label="Role-based access"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-1">Who uses CivicLens</h2>
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
                className="cl-card p-6 flex flex-col rounded-xl hover:shadow-sm transition-all"
              >
                <span
                  className="cl-section-label px-2.5 py-0.5 rounded-full inline-block mb-3 w-fit"
                  style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}
                >
                  {r.role.toUpperCase()}
                </span>
                <h3 className="text-base font-bold mb-2">{r.headline}</h3>
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
