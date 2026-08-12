/**
 * Citizen Dashboard — M2 scope.
 * Main purpose: navigate to explore projects.
 * Shows a brief summary of recently updated published projects.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusPill, BudgetFigure, Spinner } from '../components/shared';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/projects?ward=' + encodeURIComponent(user?.ward || ''));
        if (res.data.success) {
          // Show at most 3 recent projects
          setRecentProjects((res.data.projects || []).slice(0, 3));
        }
      } catch {
        // Silently fail — explore page is the main experience
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6">
          <h1 className="text-xl font-bold">
            Welcome, {user?.name?.split(' ')[0] || 'Citizen'}
          </h1>
          {user?.ward && (
            <div className="flex items-center gap-1.5 mt-1 text-sm" style={{ color: 'var(--ink-muted)' }}>
              <MapPin size={13} aria-hidden="true" />
              {user.ward}
            </div>
          )}
        </div>

        {/* Primary CTA: Explore projects */}
        <Link
          to="/explore"
          className="block cl-card p-5 mb-6 group no-underline cl-card-interactive"
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

        {/* Recent projects near user's ward */}
        <section aria-label="Recent projects near you">
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--ink-muted)' }}>
            {user?.ward ? `PROJECTS — ${user.ward.toUpperCase()}` : 'RECENT PROJECTS'}
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
