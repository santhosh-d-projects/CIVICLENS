/**
 * Government Admin Dashboard — work-queue first layout.
 * Priority: actionable items (pending updates, observations) → project table.
 * NOT a vanity stats hero. Stats are shown as a compact horizontal strip.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus, Search, Edit3, Trash2, Eye, RefreshCw, FolderOpen,
  ArrowRight, FileText, CheckCircle2, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusPill, BudgetFigure, Spinner, EmptyState, Toast } from '../components/shared';
import { PROJECT_STATUSES, DEMO_WARDS } from '../constants/civic';

export const GovernmentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [pendingObservations, setPendingObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [pubFilter, setPubFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // Observation review states
  const [reviewObs, setReviewObs] = useState(null);
  const [obsComment, setObsComment] = useState('');
  const [submittingObs, setSubmittingObs] = useState(false);
  const [obsErrors, setObsErrors] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (riskFilter)   params.append('riskStatus', riskFilter);
      if (pubFilter)    params.append('published', pubFilter);
      if (search)       params.append('search', search);

      const [projRes, statsRes, updatesRes, obsRes] = await Promise.all([
        api.get(`/government/projects?${params}`),
        api.get('/government/stats'),
        api.get('/government/updates?status=PENDING'),
        api.get('/government/observations?status=SUBMITTED')
      ]);
      if (projRes.data.success)  setProjects(projRes.data.projects);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (updatesRes.data.success) setPendingUpdates(updatesRes.data.updates || []);
      if (obsRes.data.success) setPendingObservations(obsRes.data.observations || []);
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, riskFilter, pubFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePublishToggle = async (project) => {
    try {
      const newState = !project.isPublished;
      await api.post(`/government/projects/${project.id}/publish`, { publish: newState });
      showToast(`Project ${newState ? 'published' : 'unpublished'} successfully.`);
      fetchData();
    } catch {
      showToast('Failed to update publication status.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/government/projects/${deleteTarget.id}`);
      showToast(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchData();
    } catch {
      showToast('Failed to delete project.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleAcknowledgeObs = async (obsId) => {
    setObsErrors([]);
    setSubmittingObs(true);
    try {
      const res = await api.post(`/government/observations/${obsId}/acknowledge`, {
        governmentComment: obsComment.trim()
      });
      if (res.data.success) {
        showToast('Observation acknowledged successfully.');
        setReviewObs(null);
        setObsComment('');
        fetchData();
      }
    } catch (err) {
      setObsErrors([err.response?.data?.error || 'Failed to acknowledge observation.']);
    } finally {
      setSubmittingObs(false);
    }
  };

  const handleDismissObs = async (obsId) => {
    setObsErrors([]);
    if (!obsComment.trim()) {
      setObsErrors(['A dismissal reason (comment) is required to dismiss an observation.']);
      return;
    }
    setSubmittingObs(true);
    try {
      const res = await api.post(`/government/observations/${obsId}/dismiss`, {
        governmentComment: obsComment.trim()
      });
      if (res.data.success) {
        showToast('Observation dismissed successfully.');
        setReviewObs(null);
        setObsComment('');
        fetchData();
      }
    } catch (err) {
      setObsErrors([err.response?.data?.error || 'Failed to dismiss observation.']);
    } finally {
      setSubmittingObs(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>
      <Toast message={toast?.message} type={toast?.type} onDismiss={() => setToast(null)} />

      {/* Delete modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Delete project confirmation"
        >
          <div className="cl-card p-8 max-w-sm w-full rounded-xl">
            <h2 className="text-base font-bold mb-2">Delete project?</h2>
            <p className="text-sm mb-1" style={{ color: 'var(--ink-muted)' }}>
              You are about to permanently delete:
            </p>
            <p className="text-sm font-semibold mb-4">"{deleteTarget.name}"</p>
            <p className="text-xs mb-6" style={{ color: 'var(--status-delayed-text)' }}>
              This cannot be undone. The project record will be removed from public view.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="cl-btn cl-btn--secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="cl-btn cl-btn--danger flex-1"
              >
                {deleting ? <Spinner size={14} /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="cl-section-label px-2 py-0.5 rounded"
                style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}
              >
                Government admin
              </span>
              <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                {user?.department || user?.name}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)', color: 'var(--ink-text)' }}
              >
                <span>🇮🇳</span>
                <span>15 AUG 2026</span>
              </span>
            </div>
            <h1 className="text-xl font-bold">Civic project management</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="cl-btn cl-btn--secondary cl-btn--sm"
              aria-label="Refresh projects"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              id="btn-new-project"
              onClick={() => navigate('/government/projects/new')}
              className="cl-btn cl-btn--primary"
            >
              <Plus size={15} /> New project
            </button>
          </div>
        </div>

        {/* ── Stats strip (compact, not hero) ── */}
        {stats && (
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg"
            style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)' }}
          >
            <StatCell label="Total projects" value={stats.totalProjects} mono />
            <StatCell label="Published" value={stats.publishedProjects} mono />
            <StatCell label="Drafts" value={stats.draftProjects} mono />
            <StatCell
              label="Budget allocated"
              value={<BudgetFigure amount={stats.totalBudgetAllocated} className="text-sm" />}
            />
          </div>
        )}

        {/* Action queue notice */}
        {stats && (stats.pendingUpdatesCount > 0 || stats.unverifiedObservationsCount > 0) && (
          <div
            className="flex flex-wrap gap-3 p-4 rounded-lg text-sm"
            style={{ background: 'var(--status-atrisk-bg)', border: '1px solid var(--status-atrisk-border)' }}
            role="status"
          >
            <span style={{ color: 'var(--status-atrisk-text)' }} className="font-semibold">
              Action required:
            </span>
            {stats.pendingUpdatesCount > 0 && (
              <span style={{ color: 'var(--ink-text)' }}>
                <span className="font-mono">{stats.pendingUpdatesCount}</span> contractor update{stats.pendingUpdatesCount !== 1 ? 's' : ''} pending review
              </span>
            )}
            {stats.unverifiedObservationsCount > 0 && (
              <span style={{ color: 'var(--ink-text)' }}>
                <span className="font-mono">{stats.unverifiedObservationsCount}</span> citizen observation{stats.unverifiedObservationsCount !== 1 ? 's' : ''} unverified
              </span>
            )}
          </div>
        )}

        {/* Pending Contractor Updates Queue */}
        {pendingUpdates.length > 0 && (
          <div className="cl-card p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>
              Pending Contractor Updates ({pendingUpdates.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="cl-table" aria-label="Pending updates review queue">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Contractor</th>
                    <th className="text-center">Official</th>
                    <th className="text-center">Proposed</th>
                    <th className="text-center">Delta</th>
                    <th className="hidden sm:table-cell text-center">Submitted</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUpdates.map(u => {
                    const baselineProgress = projects.find(p => p.id === u.projectId)?.officialProgress || 0;
                    const diff = u.progressPercentage - baselineProgress;
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="font-semibold text-sm truncate max-w-xs">{u.projectName}</div>
                          <div className="text-[10px]" style={{ color: 'var(--ink-subtle)' }}>{u.id}</div>
                        </td>
                        <td className="text-sm" style={{ color: 'var(--ink-muted)' }}>{u.contractorName}</td>
                        <td className="text-center font-mono" style={{ color: 'var(--ink-muted)' }}>
                          {baselineProgress}%
                        </td>
                        <td className="text-center font-mono font-bold" style={{ color: 'var(--ink-accent)' }}>{u.progressPercentage}%</td>
                        <td className="text-center font-mono font-bold" style={{ color: diff >= 0 ? 'var(--status-completed-text)' : 'var(--status-delayed-text)' }}>
                          {diff >= 0 ? `+${diff}` : diff}%
                        </td>
                        <td className="hidden sm:table-cell text-center text-xs font-mono" style={{ color: 'var(--ink-subtle)' }}>
                          {u.submittedAt ? new Date(u.submittedAt).toLocaleDateString() : ''}
                        </td>
                        <td className="text-right">
                          <button
                            id={`btn-review-${u.id}`}
                            onClick={() => navigate(`/government/updates/${u.id}`)}
                            className="cl-btn cl-btn--primary cl-btn--sm"
                            aria-label={`Review update for ${u.projectName}`}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Citizen Observations Queue */}
        {pendingObservations.length > 0 && (
          <div className="cl-card p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>
              Pending Citizen Observations ({pendingObservations.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="cl-table" aria-label="Pending citizen observations review queue">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Type</th>
                    <th className="hidden sm:table-cell">Observation Description</th>
                    <th className="hidden md:table-cell text-center">Submitted</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingObservations.map(obs => (
                    <tr key={obs.id}>
                      <td>
                        <div className="font-semibold text-sm truncate max-w-xs">{obs.projectName}</div>
                        <div className="text-[10px]" style={{ color: 'var(--ink-subtle)' }}>{obs.id}</div>
                      </td>
                      <td className="text-xs font-semibold" style={{ color: 'var(--ink-muted)' }}>
                        {obs.observationType?.replace('_', ' ')}
                      </td>
                      <td className="hidden sm:table-cell text-xs max-w-xs truncate" style={{ color: 'var(--ink-muted)' }}>
                        {obs.description || obs.observationText}
                      </td>
                      <td className="hidden md:table-cell text-center text-xs font-mono" style={{ color: 'var(--ink-subtle)' }}>
                        {obs.createdAt ? new Date(obs.createdAt).toLocaleDateString() : ''}
                      </td>
                      <td className="text-right">
                        <button
                          id={`btn-review-obs-${obs.id}`}
                          onClick={() => {
                            setReviewObs(obs);
                            setObsComment('');
                            setObsErrors([]);
                          }}
                          className="cl-btn cl-btn--secondary cl-btn--sm"
                          aria-label={`Review observation ${obs.id}`}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Filter + Search ── */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-wrap gap-2"
          role="search"
          aria-label="Filter projects"
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--ink-muted)' }}
            />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="cl-input pl-9"
              style={{ padding: '0.5rem 0.75rem 0.5rem 2.25rem' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="cl-input"
            style={{ width: 'auto', padding: '0.5rem 0.75rem' }}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {PROJECT_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="cl-input"
            style={{ width: 'auto', padding: '0.5rem 0.75rem' }}
            aria-label="Filter by risk status"
          >
            <option value="">All risk levels</option>
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk</option>
            <option value="BEHIND">Behind</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select
            value={pubFilter}
            onChange={e => setPubFilter(e.target.value)}
            className="cl-input"
            style={{ width: 'auto', padding: '0.5rem 0.75rem' }}
            aria-label="Filter by publication"
          >
            <option value="">All</option>
            <option value="true">Published</option>
            <option value="false">Drafts</option>
          </select>
          <button type="submit" className="cl-btn cl-btn--secondary">Filter</button>
        </form>

        {/* ── Projects table ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={24} />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No projects found"
            body="Create your first civic project to get started."
            action={
              <button
                onClick={() => navigate('/government/projects/new')}
                className="cl-btn cl-btn--primary"
              >
                <Plus size={15} /> New project
              </button>
            }
          />
        ) : (
          <div className="cl-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="cl-table" aria-label="Projects list">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th className="hidden sm:table-cell">Ward</th>
                    <th className="hidden md:table-cell">Budget</th>
                    <th>Status</th>
                    <th>Risk</th>
                    <th className="hidden lg:table-cell">Published</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id}>
                      <td className="max-w-xs">
                        <div className="font-medium text-sm leading-snug line-clamp-2">
                          {p.name}
                        </div>
                        <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--ink-subtle)' }}>
                          {p.id}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell text-sm" style={{ color: 'var(--ink-muted)' }}>
                        {p.ward}
                      </td>
                      <td className="hidden md:table-cell">
                        <BudgetFigure amount={p.budget?.allocated} className="text-sm" />
                      </td>
                      <td>
                        <StatusPill status={p.status} />
                      </td>
                      <td>
                        {p.assessment ? (
                          <span
                            className="status-pill text-[10px] font-bold uppercase tracking-wider border cl-explainer"
                            data-tip={p.assessment.assessment.reasons?.join(' · ') || 'Assessment details'}
                            style={{
                              color: p.assessment.assessment.status === 'COMPLETED' ? 'var(--status-completed-text)'
                                   : p.assessment.assessment.status === 'ON_TRACK' ? 'var(--status-completed-text)'
                                   : p.assessment.assessment.status === 'AT_RISK' ? 'var(--status-atrisk-text)'
                                   : 'var(--status-delayed-text)',
                              backgroundColor: p.assessment.assessment.status === 'COMPLETED' ? 'var(--status-completed-bg)'
                                             : p.assessment.assessment.status === 'ON_TRACK' ? 'var(--status-completed-bg)'
                                             : p.assessment.assessment.status === 'AT_RISK' ? 'var(--status-atrisk-bg)'
                                             : 'var(--status-delayed-bg)',
                              borderColor: p.assessment.assessment.status === 'COMPLETED' ? 'var(--status-completed-border)'
                                         : p.assessment.assessment.status === 'ON_TRACK' ? 'var(--status-completed-border)'
                                         : p.assessment.assessment.status === 'AT_RISK' ? 'var(--status-atrisk-border)'
                                         : 'var(--status-delayed-border)'
                            }}
                          >
                            {p.assessment.assessment.status?.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-ink-subtle">—</span>
                        )}
                      </td>
                      <td className="hidden lg:table-cell">
                        <button
                          onClick={() => handlePublishToggle(p)}
                          className="text-xs font-semibold px-2 py-1 rounded transition-colors min-h-touch flex items-center gap-1"
                          style={p.isPublished
                            ? { color: 'var(--status-completed-text)', background: 'var(--status-completed-bg)', border: '1px solid var(--status-completed-border)' }
                            : { color: 'var(--ink-muted)', background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }
                          }
                          aria-label={p.isPublished ? 'Click to unpublish' : 'Click to publish'}
                          title={p.isPublished ? 'Visible to public — click to unpublish' : 'Draft — click to publish'}
                        >
                          {p.isPublished ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                          {p.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <ActionBtn
                            id={`btn-view-${p.id}`}
                            label="View public page"
                            onClick={() => navigate(`/civic-projects/${p.id}`)}
                            icon={<Eye size={14} />}
                          />
                          <ActionBtn
                            id={`btn-edit-${p.id}`}
                            label="Edit project"
                            onClick={() => navigate(`/government/projects/${p.id}/edit`)}
                            icon={<Edit3 size={14} />}
                          />
                          <ActionBtn
                            id={`btn-delete-${p.id}`}
                            label="Delete project"
                            onClick={() => setDeleteTarget(p)}
                            icon={<Trash2 size={14} />}
                            danger
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Citizen Observation Review Modal */}
        {reviewObs && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Review Citizen Observation"
          >
            <div className="cl-card max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--ink-border)' }}>
                <h3 className="text-base font-bold">Review Citizen Observation</h3>
                <button
                  onClick={() => setReviewObs(null)}
                  className="text-ink-subtle hover:text-ink-text text-sm font-semibold"
                >
                  Close
                </button>
              </div>

              {obsErrors.length > 0 && (
                <div
                  className="p-3 rounded text-xs"
                  style={{ background: 'var(--status-delayed-bg)', color: 'var(--status-delayed-text)', border: '1px solid var(--status-delayed-border)' }}
                >
                  {obsErrors[0]}
                </div>
              )}

              {/* Meta */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-ink-subtle block font-semibold uppercase tracking-wider">Project</span>
                  <span className="text-sm font-bold text-ink-text">{reviewObs.projectName}</span>
                </div>
                <div>
                  <span className="text-ink-subtle block font-semibold uppercase tracking-wider">Type</span>
                  <span className="text-ink-text font-medium">{reviewObs.observationType?.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-ink-subtle block font-semibold uppercase tracking-wider">Submitted By</span>
                  <span className="text-ink-text font-medium">Citizen Observation</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded border text-sm" style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-ink-muted">Citizen description</span>
                <p className="text-ink-text leading-relaxed">{reviewObs.description || reviewObs.observationText}</p>
              </div>

              {/* Location details */}
              {reviewObs.location && reviewObs.location.description && (
                <div className="text-xs">
                  <span className="text-ink-subtle block font-semibold uppercase tracking-wider">Landmark Location</span>
                  <span className="text-ink-text font-mono">{reviewObs.location.description}</span>
                  {reviewObs.location.lat && reviewObs.location.lng && (
                    <span className="block text-[10px] text-ink-subtle mt-0.5 font-mono">
                      Coordinates: {reviewObs.location.lat}, {reviewObs.location.lng}
                    </span>
                  )}
                </div>
              )}

              {/* Evidence details */}
              {reviewObs.evidence && reviewObs.evidence.length > 0 && (
                <div className="space-y-2">
                  <span className="text-ink-subtle block font-semibold uppercase tracking-wider text-xs">Submitted Evidence</span>
                  {reviewObs.evidence.map((ev, index) => {
                    const isImg = ['jpg', 'jpeg', 'png'].includes((ev.fileType || '').toLowerCase());
                    return (
                      <div
                        key={index}
                        className="p-2.5 rounded border flex items-center justify-between gap-3"
                        style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)' }}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate max-w-[200px]">{ev.fileName}</p>
                          <p className="font-mono text-[9px] text-ink-subtle">{ev.fileType}</p>
                        </div>
                        <a
                          href={ev.fileReference}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cl-btn cl-btn--secondary cl-btn--xs px-2 py-1 text-xs no-underline"
                        >
                          View file
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Feedback comment input */}
              <div className="space-y-1.5">
                <label htmlFor="field-review-obs-comment" className="cl-label block font-bold">
                  Government Comment / Rejection Reason
                </label>
                <textarea
                  id="field-review-obs-comment"
                  value={obsComment}
                  onChange={e => setObsComment(e.target.value)}
                  placeholder="Provide review details. Rejection dismissal requires a reason..."
                  className="cl-input text-sm"
                  rows={3}
                  required
                />
                <p className="text-[10px]" style={{ color: 'var(--ink-subtle)' }}>
                  * A comment is <span className="font-semibold text-status-delayed-text">mandatory to dismiss</span> an observation.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setReviewObs(null)}
                  className="cl-btn cl-btn--secondary flex-1"
                  disabled={submittingObs}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDismissObs(reviewObs.id)}
                  id="btn-dismiss-obs"
                  className="cl-btn cl-btn--danger flex-1"
                  disabled={submittingObs}
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleAcknowledgeObs(reviewObs.id)}
                  id="btn-acknowledge-obs"
                  className="cl-btn cl-btn--primary flex-1"
                  disabled={submittingObs}
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function StatCell({ label, value, mono }) {
  return (
    <div>
      <p className="cl-section-label mb-1">{label}</p>
      <p className={`text-xl font-bold ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--ink-text)' }}>
        {value}
      </p>
    </div>
  );
}

function ActionBtn({ id, label, onClick, icon, danger }) {
  return (
    <button
      id={id}
      onClick={onClick}
      title={label}
      aria-label={label}
      className="p-2 rounded transition-colors min-h-touch flex items-center justify-center"
      style={{
        color: 'var(--ink-muted)',
        background: 'var(--ink-surface-2)',
        border: '1px solid var(--ink-border)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = danger ? 'var(--status-delayed-text)' : 'var(--ink-accent)';
        e.currentTarget.style.borderColor = danger ? 'var(--status-delayed-border)' : 'var(--ink-accent)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--ink-muted)';
        e.currentTarget.style.borderColor = 'var(--ink-border)';
      }}
    >
      {icon}
    </button>
  );
}
