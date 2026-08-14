/**
 * SchemesPage — Citizen-facing Government Yojanas & Schemes Discovery.
 * Provides search, Central & Karnataka state filters, category filters,
 * persona-based quick discovery, and direct access to official government application portals.
 */
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Sparkles, Landmark, Building2,
  ExternalLink, ArrowRight, ShieldCheck, CheckCircle2, User,
  HelpCircle, Info, Filter, X
} from 'lucide-react';
import { SchemeCard } from '../components/SchemeCard';
import { SCHEMES_DATA, SCHEME_CATEGORIES, CITIZEN_PERSONAS } from '../constants/schemes';
import { AshokaChakra, IndiaFlag } from '../components/IndiaFlag';

export const SchemesPage = () => {
  const [search, setSearch] = useState('');
  const [govLevel, setGovLevel] = useState('ALL'); // 'ALL' | 'CENTRAL' | 'STATE'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPersona, setSelectedPersona] = useState(null);

  // Filter schemes based on search, government level, category, and persona
  const filteredSchemes = useMemo(() => {
    return SCHEMES_DATA.filter((scheme) => {
      // Government Level filter
      if (govLevel !== 'ALL' && scheme.governmentLevel !== govLevel) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && scheme.category !== selectedCategory) {
        return false;
      }

      // Persona filter
      if (selectedPersona && selectedPersona.category && scheme.category !== selectedPersona.category) {
        return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const nameMatch = scheme.name.toLowerCase().includes(q);
        const shortNameMatch = scheme.shortName.toLowerCase().includes(q);
        const descMatch = scheme.summary.toLowerCase().includes(q);
        const deptMatch = scheme.department.toLowerCase().includes(q);
        const catMatch = scheme.category.toLowerCase().includes(q);
        const targetMatch = scheme.targetGroup.toLowerCase().includes(q);
        const benefitsMatch = scheme.benefits?.some(b => b.toLowerCase().includes(q));

        if (!nameMatch && !shortNameMatch && !descMatch && !deptMatch && !catMatch && !targetMatch && !benefitsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [search, govLevel, selectedCategory, selectedPersona]);

  const handlePersonaClick = (persona) => {
    if (selectedPersona?.id === persona.id) {
      setSelectedPersona(null);
    } else {
      setSelectedPersona(persona);
      setSelectedCategory('ALL'); // reset explicit category to let persona drive
    }
  };

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setSelectedPersona(null); // clear persona when category is explicitly chosen
  };

  const clearAllFilters = () => {
    setSearch('');
    setGovLevel('ALL');
    setSelectedCategory('ALL');
    setSelectedPersona(null);
  };

  const activeFiltersCount = (govLevel !== 'ALL' ? 1 : 0) +
    (selectedCategory !== 'ALL' ? 1 : 0) +
    (selectedPersona ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>
      {/* ── Page Header / Hero ── */}
      <section
        className="border-b px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative overflow-hidden"
        style={{ borderColor: 'var(--ink-border)', background: 'var(--ink-surface)' }}
      >
        {/* Subtle Ashoka Chakra watermark in background */}
        <div className="absolute right-[-40px] top-[-40px] pointer-events-none opacity-5 select-none">
          <AshokaChakra size={320} spin={true} color="var(--tricolor-navy)" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            {/* Independence Day Eyebrow Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4 border shadow-sm"
              style={{
                background: 'var(--ink-surface-2)',
                borderColor: 'var(--ink-border)',
                color: 'var(--ink-text)',
              }}
            >
              <span>🇮🇳</span>
              <span style={{ color: 'var(--tricolor-saffron-dark)' }}>CITIZEN BENEFIT SERVICES</span>
              <span style={{ color: 'var(--ink-subtle)' }}>•</span>
              <span style={{ color: 'var(--tricolor-green-dark)' }}>INDEPENDENCE DAY 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 leading-tight">
              Government Schemes & Yojanas
            </h1>

            <p className="text-base sm:text-lg font-medium mb-2" style={{ color: 'var(--ink-accent-text)' }}>
              "Benefits for citizens. Information in one transparent place."
            </p>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              Discover verified Central and Karnataka State Government welfare schemes, subsidies,
              and direct assistance programs with verified links to official application portals.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-3xl">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--ink-subtle)' }}
                aria-hidden="true"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search schemes by name, keyword (e.g. PM-KISAN, Gruha Lakshmi, Loans, Farmers, Electricity, Housing)…"
                className="cl-input pl-11 pr-10 text-sm shadow-sm"
                aria-label="Search government schemes"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-text p-1"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Statistics Banner */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--ink-muted)' }}>
            <div className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--ink-text)' }}>
              <span className="font-mono text-sm font-bold text-ink-accent">{SCHEMES_DATA.length}+</span>
              <span>Verified Yojanas</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-ink-text">2</span>
              <span>Government Tiers (Central & Karnataka)</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-ink-text">11</span>
              <span>Civic Welfare Categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* ── Government Level Selector Tabs ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div
            className="flex p-1 rounded-xl border max-w-full overflow-x-auto"
            style={{
              background: 'var(--ink-surface)',
              borderColor: 'var(--ink-border)',
            }}
            role="tablist"
            aria-label="Government Level"
          >
            <button
              type="button"
              role="tab"
              aria-selected={govLevel === 'ALL'}
              onClick={() => setGovLevel('ALL')}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-touch"
              style={
                govLevel === 'ALL'
                  ? { background: 'var(--ink-surface-2)', color: 'var(--ink-text)', border: '1px solid var(--ink-border-2)' }
                  : { color: 'var(--ink-muted)' }
              }
            >
              All Schemes ({SCHEMES_DATA.length})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={govLevel === 'CENTRAL'}
              onClick={() => setGovLevel('CENTRAL')}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap min-h-touch"
              style={
                govLevel === 'CENTRAL'
                  ? { background: 'rgba(255, 153, 51, 0.15)', color: 'var(--tricolor-saffron-dark)', border: '1px solid var(--tricolor-saffron-dark)' }
                  : { color: 'var(--ink-muted)' }
              }
            >
              <span>🇮🇳</span>
              <span>Central Government</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full" style={{ background: 'var(--ink-surface-2)' }}>
                {SCHEMES_DATA.filter(s => s.governmentLevel === 'CENTRAL').length}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={govLevel === 'STATE'}
              onClick={() => setGovLevel('STATE')}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap min-h-touch"
              style={
                govLevel === 'STATE'
                  ? { background: 'rgba(19, 136, 8, 0.15)', color: 'var(--tricolor-green-dark)', border: '1px solid var(--tricolor-green-dark)' }
                  : { color: 'var(--ink-muted)' }
              }
            >
              <span>🏛</span>
              <span>Karnataka Government</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full" style={{ background: 'var(--ink-surface-2)' }}>
                {SCHEMES_DATA.filter(s => s.governmentLevel === 'STATE').length}
              </span>
            </button>
          </div>

          {/* Active Filter Count & Reset */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: 'var(--ink-muted)' }}>
                Showing {filteredSchemes.length} of {SCHEMES_DATA.length} schemes
              </span>
              <button
                type="button"
                onClick={clearAllFilters}
                className="cl-btn cl-btn--ghost cl-btn--sm text-xs"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* ── "Schemes for You" Persona Discovery Strip ── */}
        <div
          className="mb-6 p-4 rounded-xl border"
          style={{
            background: 'var(--ink-surface-2)',
            borderColor: 'var(--ink-border)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={15} style={{ color: 'var(--ink-accent)' }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-text">
                Quick Persona Discovery
              </h2>
            </div>
            <p className="text-[11px] italic" style={{ color: 'var(--ink-subtle)' }}>
              * Quick discovery aid. Always verify final eligibility on the official government portal.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CITIZEN_PERSONAS.map((p) => {
              const isSelected = selectedPersona?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePersonaClick(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all text-left flex items-center gap-1.5"
                  style={
                    isSelected
                      ? {
                          background: 'var(--ink-accent)',
                          color: '#FFFFFF',
                          borderColor: 'var(--ink-accent)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }
                      : {
                          background: 'var(--ink-surface)',
                          borderColor: 'var(--ink-border)',
                          color: 'var(--ink-text)',
                        }
                  }
                  aria-pressed={isSelected}
                >
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Category Filter Pills Bar ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={13} style={{ color: 'var(--ink-muted)' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>
              Filter by Category:
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {SCHEME_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className="px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap transition-all flex-shrink-0"
                  style={
                    isSelected
                      ? {
                          background: 'var(--ink-accent)',
                          color: '#FFFFFF',
                          borderColor: 'var(--ink-accent)',
                        }
                      : {
                          background: 'var(--ink-surface)',
                          borderColor: 'var(--ink-border)',
                          color: 'var(--ink-muted)',
                        }
                  }
                  aria-pressed={isSelected}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Schemes Grid ── */}
        {filteredSchemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div
            className="cl-card p-12 text-center rounded-xl border max-w-lg mx-auto"
            style={{ borderColor: 'var(--ink-border)' }}
          >
            <HelpCircle size={36} className="mx-auto mb-3" style={{ color: 'var(--ink-subtle)' }} />
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--ink-text)' }}>
              No matching schemes found
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--ink-muted)' }}>
              We couldn't find any schemes matching your current filters and search terms.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="cl-btn cl-btn--primary cl-btn--sm mx-auto"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* ── CivicLens Philosophy Extension Strip ── */}
        <div
          className="mt-14 p-6 rounded-xl border relative overflow-hidden"
          style={{
            background: 'var(--ink-surface)',
            borderColor: 'var(--ink-border)',
          }}
        >
          <div className="tricolor-strip-subtle absolute top-0 left-0 right-0" />

          <div className="max-w-3xl mx-auto text-center space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink-accent-text)' }}>
              <ShieldCheck size={16} />
              <span>CivicLens Citizen Service Extension</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--ink-text)' }}>
              "Transparency is not only about knowing where public money goes. It is also about knowing what public benefits are available to you."
            </h3>

            {/* Flow line */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-mono font-semibold">
              <span className="px-2.5 py-1 rounded border" style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)', color: 'var(--tricolor-saffron-dark)' }}>
                1. DISCOVER
              </span>
              <span style={{ color: 'var(--ink-subtle)' }}>→</span>
              <span className="px-2.5 py-1 rounded border" style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)', color: 'var(--status-ongoing-text)' }}>
                2. UNDERSTAND
              </span>
              <span style={{ color: 'var(--ink-subtle)' }}>→</span>
              <span className="px-2.5 py-1 rounded border" style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)', color: 'var(--status-atrisk-text)' }}>
                3. CHECK ELIGIBILITY
              </span>
              <span style={{ color: 'var(--ink-subtle)' }}>→</span>
              <span className="px-2.5 py-1 rounded border" style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)', color: 'var(--tricolor-green-dark)' }}>
                4. APPLY ON OFFICIAL PORTAL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemesPage;
