/**
 * Explore Projects Page — public, no login required.
 * Desktop: filter sidebar + 2-col grid.
 * Mobile: stacked filters (collapsible) + 1-col list.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import { ProjectCard } from '../components/ProjectCard';
import { Spinner, EmptyState } from '../components/shared';
import { PROJECT_CATEGORIES, PROJECT_STATUSES, DEMO_WARDS } from '../constants/civic';

export const ExploreProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ ward: '', status: '', category: '', department: '', riskStatus: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.ward)       params.append('ward', filters.ward);
      if (filters.status)     params.append('status', filters.status);
      if (filters.category)   params.append('category', filters.category);
      if (filters.department) params.append('department', filters.department);
      if (filters.riskStatus) params.append('riskStatus', filters.riskStatus);
      if (search)             params.append('search', search);

      const res = await api.get(`/projects?${params.toString()}`);
      if (res.data.success) {
        setProjects(res.data.projects);
        setTotal(res.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const clearFilter = (key) => setFilters(f => ({ ...f, [key]: '' }));
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--ink-base)' }}
    >
      {/* Page header */}
      <div
        className="border-b px-4 sm:px-6 lg:px-8 py-8"
        style={{ borderColor: 'var(--ink-border)', background: 'var(--ink-surface)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border"
            style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)', color: 'var(--ink-text)' }}
          >
            <span>🇮🇳</span>
            <span style={{ color: 'var(--tricolor-saffron-dark)' }}>INDEPENDENCE DAY 2026</span>
            <span style={{ color: 'var(--ink-subtle)' }}>•</span>
            <span>PUBLIC TRANSPARENCY REGISTRY</span>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink-text)' }}>
            Civic Projects Directory
          </h1>
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
            Official government commitments, allocated funding, and current project status.
            All information is source-backed.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-5 flex gap-2"
            role="search"
            aria-label="Search civic projects"
          >
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--ink-muted)' }}
                aria-hidden="true"
              />
              <input
                id="project-search"
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, ward, department, or category…"
                className="cl-input pl-9"
                aria-label="Search projects"
              />
            </div>
            <button type="submit" className="cl-btn cl-btn--primary" aria-label="Search">
              Search
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(v => !v)}
              className="cl-btn cl-btn--secondary md:hidden"
              aria-expanded={filtersOpen}
              aria-controls="filter-panel"
              aria-label={`Filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
            >
              <SlidersHorizontal size={15} />
              {activeFilterCount > 0 && (
                <span
                  className="font-mono text-xs rounded-full px-1.5"
                  style={{ background: 'var(--ink-accent)', color: '#fff' }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">

          {/* ── Filter sidebar (desktop always visible, mobile toggle) ── */}
          <aside
            id="filter-panel"
            className={`md:w-56 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden'} md:block`}
            aria-label="Project filters"
          >
             <div className="cl-card p-4 space-y-5">
              <div className="flex items-center justify-between">
                <span className="cl-section-label">Filters</span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => setFilters({ ward: '', status: '', category: '', department: '', riskStatus: '' })}
                    className="text-xs font-medium"
                    style={{ color: 'var(--ink-accent)' }}
                    aria-label="Clear all filters"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <FilterGroup label="Status">
                <FilterSelect
                  value={filters.status}
                  onChange={v => setFilters(f => ({ ...f, status: v }))}
                  options={[{ value: '', label: 'All statuses' }, ...PROJECT_STATUSES.map(s => ({ value: s.value, label: s.label }))]}
                />
              </FilterGroup>

              <FilterGroup label="Risk Assessment">
                <FilterSelect
                  value={filters.riskStatus}
                  onChange={v => setFilters(f => ({ ...f, riskStatus: v }))}
                  options={[
                    { value: '', label: 'All risk levels' },
                    { value: 'ON_TRACK', label: 'On Track' },
                    { value: 'AT_RISK', label: 'At Risk' },
                    { value: 'BEHIND', label: 'Behind' },
                    { value: 'COMPLETED', label: 'Completed' }
                  ]}
                />
              </FilterGroup>

              <FilterGroup label="Category">
                <FilterSelect
                  value={filters.category}
                  onChange={v => setFilters(f => ({ ...f, category: v }))}
                  options={[{ value: '', label: 'All categories' }, ...PROJECT_CATEGORIES.map(c => ({ value: c, label: c }))]}
                />
              </FilterGroup>

              <FilterGroup label="Ward">
                <FilterSelect
                  value={filters.ward}
                  onChange={v => setFilters(f => ({ ...f, ward: v }))}
                  options={[{ value: '', label: 'All wards' }, ...DEMO_WARDS.map(w => ({ value: w, label: w }))]}
                />
              </FilterGroup>

              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(filters).map(([key, val]) =>
                    val ? (
                      <button
                        key={key}
                        onClick={() => clearFilter(key)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium min-h-touch"
                        style={{ background: 'var(--ink-accent-bg)', color: 'var(--ink-accent)', border: '1px solid var(--ink-accent)' }}
                        aria-label={`Remove ${key} filter: ${val}`}
                      >
                        {val} <X size={10} />
                      </button>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* ── Project grid ── */}
          <section className="flex-1 min-w-0" aria-label="Project results">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                {loading ? 'Loading…' : (
                  <span>
                    <span className="font-mono font-semibold" style={{ color: 'var(--ink-text)' }}>{total}</span>
                    {' '}project{total !== 1 ? 's' : ''} found
                  </span>
                )}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner size={24} />
              </div>
            ) : projects.length === 0 ? (
              <EmptyState
                title="No projects found"
                body="Try adjusting your search terms or filters."
                action={
                  <button
                    className="cl-btn cl-btn--secondary"
                    onClick={() => { setSearch(''); setFilters({ ward: '', status: '', category: '', department: '' }); }}
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map(p => (
                  <ProjectCard key={p.id} project={p} linkTo={`/civic-projects/${p.id}`} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

function FilterGroup({ label, children }) {
  return (
    <div>
      <label className="cl-section-label mb-2 block">{label}</label>
      {children}
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="cl-input text-sm"
      style={{ padding: '0.5rem 0.75rem' }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
