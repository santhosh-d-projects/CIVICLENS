/**
 * Contractor Dashboard — M2 scope: view assigned projects only.
 * Progress submission (M3) is intentionally not here.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, Eye, FolderOpen } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  StatusPill, BudgetFigure, PromiseRealityBar, Spinner, EmptyState
} from '../components/shared';

export const ContractorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/contractor/projects');
        if (res.data.success) setProjects(res.data.projects);
      } catch (err) {
        console.error('Failed to load assigned projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HardHat size={16} style={{ color: 'var(--ink-muted)' }} aria-hidden="true" />
              <span className="cl-section-label">Contractor portal</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{user?.companyName || user?.name}</h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)', color: 'var(--ink-text)' }}
              >
                <span>🇮🇳</span>
                <span>15 AUG 2026</span>
              </span>
            </div>
            {user?.registrationId && (
              <p className="font-mono text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
                Reg. ID: {user.registrationId}
              </p>
            )}
          </div>
        </div>

        {/* Assigned projects */}
        <section aria-label="Assigned projects">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ color: 'var(--ink-muted)' }}>
              ASSIGNED PROJECTS
            </h2>
            {!loading && (
              <span
                className="font-mono text-xs px-2 py-0.5 rounded"
                style={{ background: 'var(--ink-surface-2)', color: 'var(--ink-muted)', border: '1px solid var(--ink-border)' }}
              >
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size={24} />
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No projects assigned"
              body="Projects assigned to you by the government admin will appear here."
            />
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <ContractorProjectRow
                  key={p.id}
                  project={p}
                  onView={() => navigate(`/contractor/projects/${p.id}`)}
                  onReport={() => navigate(`/contractor/projects/${p.id}/update`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

function ContractorProjectRow({ project: p, onView, onReport }) {
  const b = p.budget || {};
  return (
    <div
      className="cl-card p-5 rounded-lg"
      aria-label={`Project: ${p.name}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded"
              style={{ background: 'var(--ink-surface-2)', color: 'var(--ink-muted)', border: '1px solid var(--ink-border)' }}
            >
              {p.category}
            </span>
            <StatusPill status={p.status} />
          </div>
          <h3 className="text-base font-semibold leading-snug mb-1" style={{ color: 'var(--ink-text)' }}>
            {p.name}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: 'var(--ink-muted)' }}>
            <span>{p.department}</span>
            <span>{p.ward}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <BudgetFigure amount={b.allocated} className="text-base font-bold" />
          <div className="flex gap-2">
            <button
              id={`btn-view-${p.id}`}
              onClick={onView}
              className="cl-btn cl-btn--secondary cl-btn--sm"
              aria-label={`View ${p.name}`}
            >
              View project
            </button>
            <button
              id={`btn-report-${p.id}`}
              onClick={onReport}
              className="cl-btn cl-btn--primary cl-btn--sm"
              aria-label={`Report progress for ${p.name}`}
            >
              Report progress
            </button>
          </div>
        </div>
      </div>

      {/* Timeline bar */}
      {p.startDate && p.expectedCompletionDate && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--ink-border)' }}>
          <PromiseRealityBar
            startDate={p.startDate}
            expectedDate={p.expectedCompletionDate}
            status={p.status}
          />
        </div>
      )}
    </div>
  );
}
