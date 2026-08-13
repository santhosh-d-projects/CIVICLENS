/**
 * ReviewUpdatePage — Government Admin interface to review a contractor's progress submission.
 * Route: /government/updates/:updateId
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, FileText, AlertCircle, Calendar, User, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { Spinner, Toast, SectionLabel, BudgetFigure, DateValue } from '../components/shared';

export const ReviewUpdatePage = () => {
  const { updateId } = useParams();
  const navigate = useNavigate();

  const [update, setUpdate] = useState(null);
  const [project, setProject] = useState(null);
  const [previousUpdates, setPreviousUpdates] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState([]);
  
  // Review state
  const [comment, setComment] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchUpdateDetails = async () => {
      try {
        const res = await api.get(`/government/updates/${updateId}`);
        if (res.data.success) {
          setUpdate(res.data.update);
          setProject(res.data.project);
          setPreviousUpdates(res.data.previousUpdates || []);
        }
      } catch (err) {
        showToast('Failed to load contractor submission details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUpdateDetails();
  }, [updateId]);

  const handleApprove = async () => {
    setErrors([]);
    setSaving(true);
    try {
      const res = await api.post(`/government/updates/${updateId}/approve`, {
        governmentComment: comment.trim()
      });
      if (res.data.success) {
        showToast('Update approved. Official progress updated.');
        setTimeout(() => navigate('/government/dashboard'), 1200);
      }
    } catch (err) {
      setErrors([err.response?.data?.error || 'Failed to approve update.']);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    setErrors([]);
    if (!comment.trim()) {
      setErrors(['A rejection reason (government comment) is required to reject an update.']);
      return;
    }
    setSaving(true);
    try {
      const res = await api.post(`/government/updates/${updateId}/reject`, {
        governmentComment: comment.trim()
      });
      if (res.data.success) {
        showToast('Update rejected. Official progress remains unchanged.');
        setTimeout(() => navigate('/government/dashboard'), 1200);
      }
    } catch (err) {
      setErrors([err.response?.data?.error || 'Failed to reject update.']);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ink-base)' }}>
        <Spinner size={24} />
      </div>
    );
  }

  if (!update || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--ink-base)' }}>
        <div className="cl-card p-8 text-center max-w-sm w-full">
          <p className="text-sm mb-4" style={{ color: 'var(--ink-muted)' }}>Update details not found or unauthorized.</p>
          <button onClick={() => navigate('/government/dashboard')} className="cl-btn cl-btn--primary">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const delta = update.progressPercentage - project.officialProgress;

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>
      <Toast message={toast?.message} type={toast?.type} onDismiss={() => setToast(null)} />

      {/* Header */}
      <div
        className="border-b px-4 sm:px-6 lg:px-8 py-5"
        style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)' }}
      >
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/government/dashboard')}
            className="flex items-center gap-2 text-sm mb-3 group"
            style={{ color: 'var(--ink-muted)' }}
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Admin dashboard
          </button>
          <h1 className="text-xl font-bold">Review contractor progress</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            Review completion claims submitted by <span className="font-semibold text-ink-text">{update.contractorName}</span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {errors.length > 0 && (
          <div
            className="p-4 rounded-lg"
            style={{ background: 'var(--status-delayed-bg)', border: '1px solid var(--status-delayed-border)' }}
            role="alert"
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={15} style={{ color: 'var(--status-delayed-text)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--status-delayed-text)' }}>
                Review error:
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--ink-text)' }}>{errors[0]}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main review column */}
          <div className="md:col-span-2 space-y-6">

            {/* Project Context */}
            <div className="cl-card p-5">
              <SectionLabel className="mb-2">Project</SectionLabel>
              <h2 className="text-base font-bold mb-3">{project.name}</h2>
              <div className="text-sm space-y-1.5 text-ink-muted">
                <div>Department: <span className="text-ink-text font-medium">{project.department}</span></div>
                <div>Ward: <span className="text-ink-text font-medium">{project.ward}</span></div>
              </div>
            </div>

            {/* Submission values details */}
            <div className="cl-card p-5 space-y-4">
              <SectionLabel>Progress Comparison</SectionLabel>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded" style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}>
                  <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Current Official</span>
                  <p className="font-mono text-xl font-bold mt-1 text-ink-muted">{project.officialProgress}%</p>
                </div>
                <div className="p-3 rounded" style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}>
                  <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Proposed Progress</span>
                  <p className="font-mono text-xl font-bold mt-1 text-ink-accent">{update.progressPercentage}%</p>
                </div>
                <div className="p-3 rounded" style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}>
                  <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Difference</span>
                  <p className="font-mono text-xl font-bold mt-1" style={{ color: delta >= 0 ? 'var(--status-completed-text)' : 'var(--status-delayed-text)' }}>
                    {delta >= 0 ? `+${delta}` : delta}%
                  </p>
                </div>
              </div>

              {/* Progress bars representation */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs" style={{ color: 'var(--ink-subtle)' }}>
                  <span>Proposed completion visualization</span>
                  <span className="font-mono">{update.progressPercentage}%</span>
                </div>
                <div className="h-3 rounded-full bg-ink-surface-2 overflow-hidden border border-ink-border relative">
                  {/* Current verified layer */}
                  <div
                    className="h-full bg-status-completed absolute left-0 top-0 rounded-l-full"
                    style={{ width: `${project.officialProgress}%`, opacity: 0.7 }}
                  />
                  {/* Proposed diff layer */}
                  {delta > 0 && (
                    <div
                      className="h-full bg-status-ongoing absolute rounded-r-full"
                      style={{
                        left: `${project.officialProgress}%`,
                        width: `${delta}%`,
                        background: 'var(--ink-accent)'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Description & delay */}
            <div className="cl-card p-5 space-y-4">
              <div>
                <SectionLabel className="mb-2">Contractor progress description</SectionLabel>
                <p className="text-sm leading-relaxed p-3 rounded" style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}>
                  {update.description}
                </p>
              </div>

              {update.milestone && (
                <div>
                  <SectionLabel className="mb-1">Target Milestone</SectionLabel>
                  <p className="text-sm font-semibold">{update.milestone}</p>
                </div>
              )}

              {update.delayReason && (
                <div>
                  <SectionLabel className="mb-2 text-status-delayed">Contractor-provided delay explanation</SectionLabel>
                  <p className="text-sm leading-relaxed p-3 rounded border border-status-delayed-border" style={{ background: 'var(--status-delayed-bg)', color: 'var(--status-delayed-text)' }}>
                    {update.delayReason}
                  </p>
                </div>
              )}
            </div>

            {/* Evidence items */}
            <div className="cl-card p-5">
              <SectionLabel className="mb-3">Submitted evidence</SectionLabel>
              {update.evidence && update.evidence.length > 0 ? (
                <div className="space-y-3">
                  {update.evidence.map((ev, idx) => {
                    const isImg = ['jpg', 'jpeg', 'png'].includes((ev.fileType || '').toLowerCase());
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between"
                        style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)' }}
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-ink-accent" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate max-w-[200px]" style={{ color: 'var(--ink-text)' }}>
                              {ev.fileName}
                            </p>
                            <p className="font-mono text-[9px]" style={{ color: 'var(--ink-subtle)' }}>
                              {ev.fileType} · Uploaded by {ev.uploadedBy}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <a
                            href={ev.fileReference}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cl-btn cl-btn--secondary cl-btn--sm"
                          >
                            <ExternalLink size={12} /> Open evidence
                          </a>
                        </div>

                        {/* If image, display simple inline thumbnail preview */}
                        {isImg && ev.fileReference.startsWith('http') && (
                          <div className="w-full sm:w-20 h-16 rounded overflow-hidden border border-ink-border mt-2 sm:mt-0 flex-shrink-0">
                            <img
                              src={ev.fileReference}
                              alt="Evidence thumbnail"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs" style={{ color: 'var(--ink-subtle)' }}>
                  No evidence uploaded with this update.
                </p>
              )}
            </div>

            {/* Government Comment Box */}
            <div className="cl-card p-5">
              <label htmlFor="field-review-comment" className="cl-label block mb-2 font-bold">
                Review Comment / Feedback
              </label>
              <textarea
                id="field-review-comment"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={errors.length > 0 ? "A reason comment is required to reject..." : "Provide verification details, site inspection notes, or rejection reasons..."}
                className={`cl-input ${errors.length > 0 && !comment.trim() ? 'cl-input--error' : ''}`}
                rows={3}
                required
              />
              <p className="text-xs mt-2" style={{ color: 'var(--ink-subtle)' }}>
                * A comment is <span className="font-semibold text-status-delayed">mandatory for rejections</span>.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReject}
                disabled={saving}
                id="btn-reject-update"
                className="cl-btn cl-btn--danger flex-1"
              >
                <X size={15} /> Reject Update
              </button>
              <button
                onClick={handleApprove}
                disabled={saving}
                id="btn-approve-update"
                className="cl-btn cl-btn--primary flex-1"
              >
                <Check size={15} /> Approve & Update Progress
              </button>
            </div>

          </div>

          {/* Right sidebar: previous history context */}
          <aside className="space-y-4">
            
            {/* Context Info */}
            <div className="cl-card p-5 space-y-3">
              <SectionLabel>Submission Meta</SectionLabel>
              <div>
                <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Contractor Representative</span>
                <p className="text-sm font-semibold">{update.submittedBy}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Date submitted</span>
                <p className="font-mono text-sm">
                  {update.submittedAt ? new Date(update.submittedAt).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>

            {/* Project updates log history */}
            <div className="cl-card p-5">
              <SectionLabel className="mb-3">Updates log history</SectionLabel>
              {previousUpdates.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--ink-subtle)' }}>
                  No previous updates.
                </p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {previousUpdates.map((u, i) => (
                    <div key={i} className="pl-3 border-l-2 text-xs space-y-1" style={{ borderColor: 'var(--ink-border-2)' }}>
                      <div className="flex justify-between gap-2">
                        <span className="font-mono font-bold">{u.progressPercentage}%</span>
                        <span className="font-semibold uppercase tracking-wider text-[9px]"
                          style={{
                            color: u.status === 'APPROVED'
                              ? 'var(--status-completed-text)'
                              : u.status === 'REJECTED'
                                ? 'var(--status-delayed-text)'
                                : 'var(--status-atrisk-text)'
                          }}
                        >
                          {u.status}
                        </span>
                      </div>
                      <p className="text-[11px] truncate" style={{ color: 'var(--ink-muted)' }}>
                        {u.description}
                      </p>
                      <span className="font-mono text-[9px]" style={{ color: 'var(--ink-subtle)' }}>
                        {u.submittedAt ? new Date(u.submittedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default ReviewUpdatePage;
