/**
 * SubmitProgressPage — contractor progress submission form.
 * Route: /contractor/projects/:projectId/update
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Spinner, Toast, SectionLabel } from '../components/shared';

export const SubmitProgressPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState([]);
  
  // Form state
  const [pct, setPct] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [evidence, setEvidence] = useState(null); // Uploaded evidence metadata
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`);
        if (res.data.success) {
          setProject(res.data.project);
          setPct(res.data.project.officialProgress || 0);
        }
      } catch (err) {
        showToast('Failed to load project details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(['Evidence file size exceeds 5MB limit.']);
      return;
    }

    const ext = file.name.includes('.') ? file.name.split('.').pop().lower() : '';
    if (!['jpg', 'jpeg', 'png', 'pdf'].includes(ext)) {
      setErrors(['Invalid file format. Only JPG, JPEG, PNG, and PDF are allowed.']);
      return;
    }

    setErrors([]);
    setUploading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/contractor/upload-evidence', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setEvidence(res.data.evidence);
        showToast('Evidence uploaded successfully.');
      } else {
        setErrors([res.data.error || 'Failed to upload evidence.']);
        setFileName('');
      }
    } catch (err) {
      setErrors([err.response?.data?.error || 'File upload failed.']);
      setFileName('');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return;

    const errs = [];
    if (!description.trim()) errs.push('Progress description is required.');
    if (pct < 0 || pct > 100) errs.push('Progress percentage must be between 0 and 100.');
    
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors([]);
    setSaving(true);

    try {
      const payload = {
        progressPercentage: Number(pct),
        description: description.trim(),
        milestone: selectedMilestone,
        delayReason: delayReason.trim(),
        evidence: evidence ? [evidence] : null
      };

      const res = await api.post(`/contractor/projects/${projectId}/updates`, payload);
      if (res.data.success) {
        showToast('Update submitted successfully.');
        setTimeout(() => navigate(`/contractor/projects/${projectId}`), 1200);
      }
    } catch (err) {
      setErrors([err.response?.data?.error || 'Failed to submit progress update.']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>
      <Toast message={toast?.message} type={toast?.type} onDismiss={() => setToast(null)} />

      {/* Header */}
      <div
        className="border-b px-4 sm:px-6 lg:px-8 py-5"
        style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)' }}
      >
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(`/contractor/projects/${projectId}`)}
            className="flex items-center gap-2 text-sm mb-3 group"
            style={{ color: 'var(--ink-muted)' }}
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Project details
          </button>
          <h1 className="text-xl font-bold">Submit progress update</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            Report contractor-observed completion level for: <span className="font-semibold text-ink-text">{project.name}</span>
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errors.length > 0 && (
          <div
            className="mb-6 p-4 rounded-lg"
            style={{ background: 'var(--status-delayed-bg)', border: '1px solid var(--status-delayed-border)' }}
            role="alert"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={15} style={{ color: 'var(--status-delayed-text)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--status-delayed-text)' }}>
                Verification errors:
              </span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-sm">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Progress Slider */}
          <div className="cl-card p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--ink-muted)' }}>
              Progress Percentage
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full flex-1">
                <input
                  id="progress-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={pct}
                  onChange={e => setPct(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ background: 'var(--ink-surface-2)', accentColor: 'var(--ink-accent)' }}
                  aria-label="Progress percentage slider"
                />
                <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--ink-subtle)' }}>
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <div
                className="w-24 px-3 py-2 rounded border text-center font-mono text-xl font-bold flex-shrink-0 flex items-center justify-center gap-1"
                style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)' }}
              >
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={pct}
                  onChange={e => setPct(Math.min(Math.max(Number(e.target.value), 0), 100))}
                  className="w-12 bg-transparent text-center focus:outline-none"
                  aria-label="Progress percentage input value"
                />
                <span className="text-sm text-ink-muted">%</span>
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--ink-subtle)' }}>
              Current verified official progress baseline: <span className="font-mono font-medium text-ink-text">{project.officialProgress}%</span>
            </p>
          </div>

          {/* Description */}
          <div className="cl-card p-5">
            <label htmlFor="field-description" className="cl-label block mb-2 font-bold">
              Progress Description *
            </label>
            <textarea
              id="field-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="State what specific works have been executed to support the reported progress percentage..."
              className="cl-input"
              rows={4}
              required
            />
          </div>

          {/* Milestone Selection */}
          <div className="cl-card p-5">
            <label htmlFor="field-milestone" className="cl-label block mb-2 font-bold">
              Associated Milestone (optional)
            </label>
            {project.milestones && project.milestones.length > 0 ? (
              <select
                id="field-milestone"
                value={selectedMilestone}
                onChange={e => setSelectedMilestone(e.target.value)}
                className="cl-input"
              >
                <option value="">No specific milestone</option>
                {project.milestones.map((m, i) => (
                  <option key={i} value={m.title}>{m.title} ({m.progress}% completed)</option>
                ))}
              </select>
            ) : (
              <input
                id="field-milestone"
                type="text"
                value={selectedMilestone}
                onChange={e => setSelectedMilestone(e.target.value)}
                placeholder="e.g. Curb Stone Installation"
                className="cl-input"
              />
            )}
          </div>

          {/* Delay Explanation */}
          <div className="cl-card p-5">
            <label htmlFor="field-delay" className="cl-label block mb-2 font-bold">
              Delay Explanation (optional)
            </label>
            <textarea
              id="field-delay"
              value={delayReason}
              onChange={e => setDelayReason(e.target.value)}
              placeholder="Detail reasons for project delays (e.g. material shortage, weather conditions)..."
              className="cl-input"
              rows={3}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--ink-subtle)' }}>
              Note: This will be labeled as <span className="font-semibold text-ink-muted">Contractor-provided explanation</span>.
            </p>
          </div>

          {/* Evidence Upload */}
          <div className="cl-card p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-muted)' }}>
              Evidence Document / Photo
            </h2>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-center relative cursor-pointer hover:border-ink-accent transition-colors"
                style={{ borderColor: 'var(--ink-border)', background: 'var(--ink-surface-2)' }}
              >
                <input
                  id="evidence-file-input"
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".jpg,.jpeg,.png,.pdf"
                  disabled={uploading}
                />
                {uploading ? (
                  <>
                    <Spinner size={20} className="mb-2" />
                    <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>Uploading file...</p>
                  </>
                ) : (
                  <>
                    <Upload size={20} className="text-ink-muted mb-2" />
                    <p className="text-sm font-medium" style={{ color: 'var(--ink-text)' }}>
                      Drag & drop file or click to select
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-subtle)' }}>
                      JPG, JPEG, PNG, or PDF format. Max file size: 5MB.
                    </p>
                  </>
                )}
              </div>

              {fileName && (
                <div
                  className="flex items-center gap-3 p-3 rounded"
                  style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)' }}
                >
                  <FileText size={16} className="text-ink-accent" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--ink-text)' }}>
                      {fileName}
                    </p>
                    {evidence && (
                      <p className="font-mono text-[10px]" style={{ color: 'var(--status-completed-text)' }}>
                        Uploaded ({evidence.fileType})
                      </p>
                    )}
                  </div>
                  {evidence && <CheckCircle2 size={14} style={{ color: 'var(--status-completed-text)' }} />}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--ink-border)' }}>
            <button
              type="button"
              onClick={() => navigate(`/contractor/projects/${projectId}`)}
              className="cl-btn cl-btn--secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="cl-btn cl-btn--primary"
            >
              {saving ? <Spinner size={14} /> : <Save size={14} />}
              {saving ? 'Submitting update…' : 'Submit update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitProgressPage;
