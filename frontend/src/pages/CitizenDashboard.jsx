/**
 * Citizen Dashboard.
 * Displays user info, link to explore projects, and the user's own submitted observations list.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, ArrowRight, FolderOpen, Eye, Clock, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusPill, BudgetFigure, Spinner, SectionLabel, EmptyState } from '../components/shared';

// Create custom colored Leaflet markers using DivIcon to avoid asset import failures
const createCustomMarker = (status) => {
  const colors = {
    ON_TRACK: '#3D5B43',     // green
    AT_RISK: '#D97324',      // amber/saffron
    BEHIND: '#C22F4E',       // red
    COMPLETED: '#1A63CB'     // blue
  };

  const fill = colors[status] || '#D97324';
  
  return L.divIcon({
    html: `<div style="
      background-color: ${fill};
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
    className: 'custom-leaflet-marker',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [allProjects, setAllProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Map filter and search states
  const [mapFilter, setMapFilter] = useState('ALL');
  const [mapSearch, setMapSearch] = useState('');
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projRes, obsRes] = await Promise.all([
          api.get('/projects'),
          api.get('/citizen/my-observations')
        ]);
        if (projRes.data.success) {
          const list = projRes.data.projects || [];
          setAllProjects(list);
          
          const wardLower = (user?.ward || '').toLowerCase();
          const near = wardLower 
            ? list.filter(p => p.ward?.toLowerCase().includes(wardLower))
            : list;
          setRecentProjects(near.slice(0, 3));
        }
        if (obsRes.data.success) {
          setObservations(obsRes.data.observations || []);
        }
      } catch (err) {
        console.error('Failed to load citizen dashboard data:', err);
        setMapError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const filteredMapProjects = allProjects.filter(p => {
    if (!p.location || p.location.lat === undefined || p.location.lng === undefined || p.location.lat === null || p.location.lng === null) {
      return false;
    }
    const lat = parseFloat(p.location.lat);
    const lng = parseFloat(p.location.lng);
    if (isNaN(lat) || isNaN(lng)) return false;

    const status = p.assessment?.assessment?.status || 'ON_TRACK';
    if (mapFilter !== 'ALL' && status !== mapFilter) return false;

    if (mapSearch) {
      const q = mapSearch.toLowerCase();
      const nameMatch = p.name?.toLowerCase().includes(q);
      const wardMatch = p.ward?.toLowerCase().includes(q);
      const deptMatch = p.department?.toLowerCase().includes(q);
      if (!nameMatch && !wardMatch && !deptMatch) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="mb-2 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">
                Welcome, {user?.name?.split(' ')[0] || 'Citizen'}
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)', color: 'var(--ink-text)' }}
              >
                <span>🇮🇳</span>
                <span>15 AUG 2026</span>
              </span>
            </div>
            {user?.ward && (
              <div className="flex items-center gap-1.5 mt-1 text-sm" style={{ color: 'var(--ink-muted)' }}>
                <MapPin size={13} aria-hidden="true" />
                {user.ward}
              </div>
            )}
          </div>
        </div>

        {/* Project Map Section */}
        <section className="cl-card p-5 space-y-4" aria-label="Civic Project Map">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-text leading-tight">
                Project Map
              </h2>
              <p className="text-xs" style={{ color: 'var(--ink-muted)', marginTop: '2px' }}>
                Where public projects are happening around you
              </p>
            </div>
            
            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-subtle)' }} />
              <input
                type="text"
                placeholder="Search map projects…"
                value={mapSearch}
                onChange={e => setMapSearch(e.target.value)}
                className="cl-input pl-8 w-full text-xs"
                style={{ padding: '0.375rem 0.5rem 0.375rem 2rem', minHeight: '36px' }}
                aria-label="Search projects on map"
              />
            </div>
          </div>

          {/* Map Filters */}
          <div className="flex flex-wrap gap-1">
            {[
              { value: 'ALL', label: 'All' },
              { value: 'ON_TRACK', label: 'On Track' },
              { value: 'AT_RISK', label: 'At Risk' },
              { value: 'BEHIND', label: 'Behind' },
              { value: 'COMPLETED', label: 'Completed' }
            ].map(opt => {
              const isActive = mapFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setMapFilter(opt.value)}
                  className="px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer min-h-[28px] inline-flex items-center justify-center"
                  style={isActive ? {
                    backgroundColor: 'var(--ink-accent)',
                    color: '#ffffff',
                    borderColor: 'var(--ink-accent)'
                  } : {
                    backgroundColor: 'var(--ink-surface-2)',
                    color: 'var(--ink-muted)',
                    borderColor: 'var(--ink-border)'
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Leaflet Map Area */}
          <div className="rounded-lg overflow-hidden border border-ink-border relative" style={{ height: '380px', zIndex: 1 }}>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2 bg-ink-surface-2">
                <Spinner size={20} />
                <span className="text-xs text-ink-muted">Loading project map...</span>
              </div>
            ) : mapError ? (
              <div className="flex items-center justify-center h-full text-xs font-semibold" style={{ color: 'var(--status-delayed-text)', background: 'var(--status-delayed-bg)' }}>
                Unable to load project locations.
              </div>
            ) : filteredMapProjects.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-ink-muted bg-ink-surface-2">
                No mapped projects available.
              </div>
            ) : (
              <MapContainer
                center={[12.9716, 77.5946]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredMapProjects.map(p => {
                  const status = p.assessment?.assessment?.status || 'ON_TRACK';
                  const pos = [parseFloat(p.location.lat), parseFloat(p.location.lng)];
                  return (
                    <Marker key={p.id} position={pos} icon={createCustomMarker(status)}>
                      <Popup>
                        <div className="p-1 space-y-2 text-xs" style={{ minWidth: '180px', fontFamily: 'Inter, sans-serif' }}>
                          <h4 className="font-bold text-sm leading-snug m-0" style={{ color: 'var(--ink-text)' }}>
                            {p.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span
                              className="status-pill text-[9px] font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded animate-none"
                              style={{
                                color: status === 'COMPLETED' ? 'var(--status-completed-text)'
                                     : status === 'ON_TRACK' ? 'var(--status-completed-text)'
                                     : status === 'AT_RISK' ? 'var(--status-atrisk-text)'
                                     : 'var(--status-delayed-text)',
                                backgroundColor: status === 'COMPLETED' ? 'var(--status-completed-bg)'
                                               : status === 'ON_TRACK' ? 'var(--status-completed-bg)'
                                               : status === 'AT_RISK' ? 'var(--status-atrisk-bg)'
                                               : 'var(--status-delayed-bg)',
                                borderColor: status === 'COMPLETED' ? 'var(--status-completed-border)'
                                           : status === 'ON_TRACK' ? 'var(--status-completed-border)'
                                           : status === 'AT_RISK' ? 'var(--status-atrisk-border)'
                                           : 'var(--status-delayed-border)'
                              }}
                            >
                              {status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="space-y-1 mt-2 text-ink-muted">
                            <div>
                              <span className="font-semibold text-[10px]" style={{ color: 'var(--ink-muted)' }}>Official Progress:</span>{' '}
                              <span className="font-mono font-bold" style={{ color: 'var(--ink-text)' }}>{p.officialProgress}%</span>
                            </div>
                            <div>
                              <span className="font-semibold text-[10px]" style={{ color: 'var(--ink-muted)' }}>Budget:</span>{' '}
                              <span className="font-mono font-bold" style={{ color: 'var(--ink-text)' }}>
                                {p.budget?.allocated ? `₹${p.budget.allocated >= 10000000 ? `${(p.budget.allocated / 10000000).toFixed(1)} Crore` : `${(p.budget.allocated / 100000).toFixed(0)} Lakh`}` : '₹0'}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold text-[10px]" style={{ color: 'var(--ink-muted)' }}>Expected Completion:</span>{' '}
                              <span className="font-mono font-bold" style={{ color: 'var(--ink-text)' }}>{p.expectedCompletionDate || '—'}</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t" style={{ borderColor: 'var(--ink-border)' }}>
                            <button
                              onClick={() => navigate(`/civic-projects/${p.id}`)}
                              className="cl-btn cl-btn--primary w-full py-1 text-xs min-h-[30px]"
                              style={{ minHeight: '30px', padding: '4px 8px' }}
                            >
                              View Project
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>
        </section>

        {/* Primary CTA: Explore projects */}
        <Link
          to="/explore"
          className="block cl-card p-5 group no-underline cl-card-interactive"
          aria-label="Explore civic projects"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--ink-text)' }}>
                Explore civic projects
              </h2>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                Browse government commitments, allocated budgets, and current project status.
              </p>
            </div>
            <ArrowRight
              size={18}
              className="flex-shrink-0 ml-4 group-hover:translate-x-1 transition-transform"
              style={{ color: 'var(--ink-accent)' }}
              aria-hidden="true"
            />
          </div>
        </Link>

        {/* My Observations Section */}
        <section aria-label="My observations">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>
              My Observations
            </h2>
            {!loading && (
              <span
                className="font-mono text-xs px-2 py-0.5 rounded border"
                style={{ background: 'var(--ink-surface-2)', color: 'var(--ink-muted)', borderColor: 'var(--ink-border)' }}
              >
                {observations.length} report{observations.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size={20} />
            </div>
          ) : observations.length === 0 ? (
            <div
              className="cl-card p-6 text-center text-sm"
              style={{ color: 'var(--ink-muted)' }}
            >
              You haven't reported any observations yet. Find a project to contribute ground evidence.{' '}
              <Link to="/explore" className="text-ink-accent font-medium">
                Browse projects
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {[...observations].reverse().map(obs => (
                <div key={obs.id} className="cl-card p-5 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-ink-text leading-snug">{obs.projectName}</h3>
                      <p className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--ink-subtle)' }}>
                        {obs.observationType?.replace('_', ' ')}
                      </p>
                    </div>
                    <ObservationStatusBadge status={obs.status} />
                  </div>

                  <p className="text-sm leading-normal" style={{ color: 'var(--ink-text)' }}>
                    {obs.description}
                  </p>

                  {obs.governmentComment && (
                    <div className="p-2.5 rounded text-xs border" style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)' }}>
                      <span className="font-semibold text-ink-accent block mb-0.5">Government Comment:</span>
                      {obs.governmentComment}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px]" style={{ color: 'var(--ink-subtle)' }}>
                    <span className="font-mono">{obs.createdAt ? new Date(obs.createdAt).toLocaleString() : ''}</span>
                    <button
                      onClick={() => navigate(`/civic-projects/${obs.projectId}`)}
                      className="text-ink-accent font-medium hover:underline flex items-center gap-0.5 text-xs"
                    >
                      View project detail →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent projects near user's ward */}
        <section aria-label="Recent projects near you">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-muted)' }}>
            {user?.ward ? `Projects near ${user.ward.toUpperCase()}` : 'Recent projects'}
          </h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size={20} />
            </div>
          ) : recentProjects.length === 0 ? (
            <div
              className="cl-card p-6 text-center text-sm"
              style={{ color: 'var(--ink-muted)' }}
            >
              No published projects found near your area.{' '}
              <Link to="/explore" className="text-ink-accent font-medium">
                Browse all projects
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map(p => (
                <button
                  key={p.id}
                  className="cl-card cl-card-interactive w-full p-4 text-left"
                  onClick={() => navigate(`/civic-projects/${p.id}`)}
                  aria-label={`View project: ${p.name}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold leading-snug mb-1.5" style={{ color: 'var(--ink-text)' }}>
                        {p.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill status={p.status} />
                        <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{p.ward}</span>
                      </div>
                    </div>
                    <BudgetFigure amount={p.budget?.allocated} className="text-sm font-semibold flex-shrink-0" />
                  </div>
                </button>
              ))}

              <Link
                to="/explore"
                className="block text-sm text-center py-2 rounded font-medium no-underline mt-1"
                style={{ color: 'var(--ink-accent)' }}
              >
                View all projects →
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const ObservationStatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();
  if (normalized === 'ACKNOWLEDGED') {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border"
        style={{ color: 'var(--status-completed-text)', background: 'var(--status-completed-bg)', borderColor: 'var(--status-completed-border)' }}>
        <CheckCircle2 size={10} /> Acknowledged
      </span>
    );
  }
  if (normalized === 'DISMISSED') {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border"
        style={{ color: 'var(--ink-subtle)', background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)' }}>
        <AlertTriangle size={10} /> Dismissed
      </span>
    );
  }
  if (normalized === 'UNDER_REVIEW') {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border"
        style={{ color: 'var(--status-atrisk-text)', background: 'var(--status-atrisk-bg)', borderColor: 'var(--status-atrisk-border)' }}>
        <Clock size={10} /> Under Review
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border"
      style={{ color: 'var(--status-ongoing-text)', background: 'var(--status-ongoing-bg)', borderColor: 'var(--status-ongoing-border)' }}>
      <Clock size={10} /> Submitted
    </span>
  );
};

export default CitizenDashboard;
