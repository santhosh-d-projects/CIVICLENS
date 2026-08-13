/**
 * ContractorProjectDetailPage — contractor-centric view of a project,
 * showing details, timeline, and submission history.
 * Route: /contractor/projects/:projectId
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, MapPin, Building2, User, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import {
  StatusPill, BudgetFigure, DateValue, PromiseRealityBar,
  Spinner, SectionLabel, TrustLabel
} from '../components/shared';

export const ContractorProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectAndUpdates = async () => {
      try {
        const [projRes, updRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/contractor/projects/${projectId}/updates`)
        ]);
        if (projRes.data.success) setProject(projRes.data.project);
        if (updRes.data.success) setUpdates(updRes.data.updates || []);
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectAndUpdates();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ink-base)' }}>
        <Spinner size={24} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--ink-base)' }}>
        <div className="cl-card p-8 text-center max-w-sm w-full">
          <p className="text-sm mb-4" style={{ color: 'var(--ink-muted)' }}>Project not found or unauthorized.</p>
          <button onClick={() => navigate('/contractor/dashboard')} className="cl-btn cl-btn--primary">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const b = project.budget || {};

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>
      {/* Header */}
      <div
        className="border-b px-4 sm:px-6 lg:px-8 py-5"
        style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)' }}
      >
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/contractor/dashboard')}
              className="flex items-center gap-2 text-sm mb-3 group"
              style={{ color: 'var(--ink-muted)' }}
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Contractor dashboard
            </button>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="cl-badge text-xs">{project.category}</span>
              <StatusPill status={project.status} />
            </div>
            <h1 className="text-xl font-bold leading-tight">{project.name}</h1>
          </div>
          <button
            id="btn-report-progress"
            onClick={() => navigate(`/contractor/projects/${project.id}/update`)}
            className="cl-btn cl-btn--primary"
          >
            <Plus size={15} /> Report progress
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left / Center column: Details & updates */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Overview */}
            <div className="cl-card p-5">
              <SectionLabel className="mb-3">Overview</SectionLabel>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                {project.description}
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded" style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}>
                  <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Department</span>
                  <p className="text-sm font-semibold">{project.department}</p>
                </div>
                <div className="p-3 rounded" style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}>
                  <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Ward</span>
                  <p className="text-sm font-semibold">{project.ward}</p>
                </div>
              </div>
            </div>

            {/* Updates History */}
            <div className="cl-card p-5">
              <SectionLabel className="mb-4">Contractor Updates History</SectionLabel>
              {updates.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--ink-muted)' }}>
                  No updates submitted yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {[...updates].reverse().map((u, i) => (
                    <div
                      key={u.id}
                      className="p-4 rounded-lg space-y-3"
                      style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-bold text-ink-text">
                            {u.progressPercentage}%
                          </span>
                          <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>reported</span>
                        </div>
                        <UpdateStatusBadge status={u.status} />
                      </div>

                      <p className="text-sm leading-normal" style={{ color: 'var(--ink-text)' }}>
                        {u.description}
                      </p>

                      {u.delayReason && (
                        <div className="p-2.5 rounded text-xs" style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)', color: 'var(--ink-muted)' }}>
                          <span className="font-semibold text-ink-subtle block mb-1">Contractor delay explanation:</span>
                          {u.delayReason}
                        </div>
                      )}

                      {u.governmentComment && (
                        <div className="p-2.5 rounded text-xs" style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)', color: 'var(--ink-text)' }}>
                          <span className="font-semibold text-ink-accent block mb-1">Government feedback:</span>
                          {u.governmentComment}
                        </div>
                      )}

                      {u.evidence && u.evidence.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {u.evidence.map((ev, idx) => (
                            <a
                              key={idx}
                              href={ev.fileReference}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border hover:border-ink-accent transition-colors"
                              style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)', color: 'var(--ink-muted)' }}
                            >
                              <FileText size={12} />
                              <span className="truncate max-w-[120px]">{ev.fileName}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[10px]" style={{ color: 'var(--ink-subtle)' }}>
                        <span className="font-mono">{u.submittedAt ? new Date(u.submittedAt).toLocaleString() : ''}</span>
                        {u.reviewedBy && (
                          <span>Reviewed by {u.reviewedBy}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right column: metrics / dates */}
          <div className="space-y-4">
            
            {/* Status overview */}
            <div className="cl-card p-5 space-y-4">
              <div>
                <SectionLabel className="mb-1">Official verified progress</SectionLabel>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-black text-ink-text">{project.officialProgress}%</span>
                  <TrustLabel type="OFFICIAL" />
                </div>
              </div>

              {project.startDate && project.expectedCompletionDate && (
                <div className="pt-4 border-t" style={{ borderColor: 'var(--ink-border)' }}>
                  <PromiseRealityBar
                    startDate={project.startDate}
                    expectedDate={project.expectedCompletionDate}
                    status={project.status}
                  />
                </div>
              )}
            </div>

            {/* Budget summary */}
            <div className="cl-card p-5 space-y-3">
              <SectionLabel>Financial allocation</SectionLabel>
              <div>
                <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Allocated budget</span>
                <p className="text-base font-bold"><BudgetFigure amount={b.allocated} /></p>
              </div>
              {b.year && (
                <div>
                  <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Budget year</span>
                  <p className="font-mono text-sm">{b.year}</p>
                </div>
              )}
              {b.source && (
                <div>
                  <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Reference source</span>
                  <p className="text-xs leading-normal" style={{ color: 'var(--ink-muted)' }}>{b.source}</p>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="cl-card p-5 space-y-2.5">
              <SectionLabel>Project dates</SectionLabel>
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: 'var(--ink-muted)' }}>Start date</span>
                <span className="font-mono">{project.startDate || '—'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: 'var(--ink-muted)' }}>Expected completion</span>
                <span className="font-mono">{project.expectedCompletionDate || '—'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const UpdateStatusBadge = ({ status }) => {
  if (status === 'APPROVED' || status === 'Approved') {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border"
        style={{ color: 'var(--status-completed-text)', background: 'var(--status-completed-bg)', borderColor: 'var(--status-completed-border)' }}>
        <CheckCircle2 size={10} /> Approved
      </span>
    );
  }
  if (status === 'REJECTED' || status === 'Rejected') {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border"
        style={{ color: 'var(--status-delayed-text)', background: 'var(--status-delayed-bg)', borderColor: 'var(--status-delayed-border)' }}>
        <AlertTriangle size={10} /> Rejected
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border"
      style={{ color: 'var(--status-atrisk-text)', background: 'var(--status-atrisk-bg)', borderColor: 'var(--status-atrisk-border)' }}>
      <Clock size={10} /> Pending review
    </span>
  );
};

export default ContractorProjectDetailPage;
