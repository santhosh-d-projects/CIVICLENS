/**
 * ReportObservationPage — Citizen ground-observation reporting form.
 * Route: /citizen/projects/:projectId/observe
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, AlertCircle, FileText, CheckCircle2, Info } from 'lucide-react';
import api from '../services/api';
import { Spinner, Toast, SectionLabel } from '../components/shared';

const OBS_TYPES = [
  { value: 'PROGRESS_OBSERVATION', label: 'Progress' },
  { value: 'SITE_CONDITION', label: 'Site Condition' },
  { value: 'COMPLETION_OBSERVATION', label: 'Completion' },
  { value: 'ACCESSIBILITY_OBSERVATION', label: 'Accessibility' },
  { value: 'GENERAL_OBSERVATION', label: 'General' }
];

export const ReportObservationPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState([]);

  // Form state
  const [obsType, setObsType] = useState('PROGRESS_OBSERVATION');
  const [description, setDescription] = useState('');
  const [locDesc, setLocDesc] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [evidence, setEvidence] = useState(null); // Metadata of uploaded evidence
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
      setErrors(['Evidence photo size exceeds 5MB limit.']);
      return;
    }

    const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
      setErrors(['Invalid format. Only JPG, JPEG, and PNG are allowed.']);
      return;
    }

    setErrors([]);
    setUploading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/citizen/upload-evidence', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setEvidence(res.data.evidence);
        showToast('Evidence photo uploaded successfully.');
      } else {
        setErrors([res.data.error || 'Failed to upload photo.']);
        setFileName('');
      }
    } catch (err) {
      setErrors([err.response?.data?.error || 'Photo upload failed.']);
      setFileName('');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return;

    const errs = [];
    if (!description.trim()) errs.push('Description is required.');
    if (description.length > 1000) errs.push('Description cannot exceed 1000 characters.');
    
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors([]);
    setSaving(true);

    try {
      const payload = {
        observationType: obsType,
        description: description.trim(),
        location: {
          description: locDesc.trim() || null,
          lat: lat ? Number(lat) : null,
          lng: lng ? Number(lng) : null
        },
        evidence: evidence ? [evidence] : []
      };

      const res = await api.post(`/citizen/projects/${projectId}/observations`, payload);
      if (res.data.success) {
        showToast('Observation recorded successfully.');
        setTimeout(() => navigate(`/civic-projects/${projectId}`), 1200);
      }
    } catch (err) {
      setErrors([err.response?.data?.error || 'Failed to submit observation.']);
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
          <button onClick={() => navigate('/explore')} className="cl-btn cl-btn--primary">
            Explore projects
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
            onClick={() => navigate(`/civic-projects/${projectId}`)}
            className="flex items-center gap-2 text-sm mb-3 group"
            style={{ color: 'var(--ink-muted)' }}
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Project transparency details
          </button>
          <h1 className="text-xl font-bold">Report what you observed</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            Submit ground-level evidence about project: <span className="font-semibold text-ink-text">{project.name}</span>
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
                Submission errors:
              </span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-sm">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Observation Type */}
          <div className="cl-card p-5">
            <label htmlFor="field-obs-type" className="cl-label block mb-2 font-bold">
              Observation Type *
            </label>
            <select
              id="field-obs-type"
              value={obsType}
              onChange={e => setObsType(e.target.value)}
              className="cl-input"
            >
              {OBS_TYPES.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="cl-card p-5">
            <label htmlFor="field-description" className="cl-label block mb-2 font-bold">
              What did you observe? *
            </label>
            
            {/* Fact-focused writing helper prompt */}
            <div
              className="flex gap-2 items-start p-3 rounded text-xs mb-3"
              style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}
            >
              <Info size={14} className="text-ink-accent flex-shrink-0 mt-0.5" />
              <span style={{ color: 'var(--ink-muted)' }}>
                <strong>Neutral Reporting Tip:</strong> Describe what you observed rather than making assumptions about why it happened.
              </span>
            </div>

            <textarea
              id="field-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., The pavement on the west side near the school is missing. Traffic is diverted."
              className="cl-input"
              rows={4}
              maxLength={1000}
              required
            />
            <div className="flex justify-between items-center text-[10px] mt-1.5" style={{ color: 'var(--ink-subtle)' }}>
              <span>Please keep the report objective and factual.</span>
              <span className="font-mono">{description.length}/1000 chars</span>
            </div>
          </div>

          {/* Optional Location */}
          <div className="cl-card p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>
              Location details (optional)
            </h2>
            
            <div>
              <label htmlFor="field-loc-desc" className="cl-label block mb-1.5 font-bold">
                Address / Location Landmark
              </label>
              <input
                id="field-loc-desc"
                type="text"
                value={locDesc}
                onChange={e => setLocDesc(e.target.value)}
                placeholder="e.g., Near the main gate of the Government Primary School"
                className="cl-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="field-lat" className="cl-label block mb-1.5 font-bold">
                  Latitude
                </label>
                <input
                  id="field-lat"
                  type="number"
                  step="any"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  placeholder="e.g. 12.9718"
                  className="cl-input font-mono"
                />
              </div>
              <div>
                <label htmlFor="field-lng" className="cl-label block mb-1.5 font-bold">
                  Longitude
                </label>
                <input
                  id="field-lng"
                  type="number"
                  step="any"
                  value={lng}
                  onChange={e => setLng(e.target.value)}
                  placeholder="e.g. 77.5948"
                  className="cl-input font-mono"
                />
              </div>
            </div>
          </div>

          {/* Evidence Upload */}
          <div className="cl-card p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-muted)' }}>
              Upload Observation Photo
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
                  accept=".jpg,.jpeg,.png"
                  disabled={uploading}
                />
                {uploading ? (
                  <>
                    <Spinner size={20} className="mb-2" />
                    <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>Uploading photo...</p>
                  </>
                ) : (
                  <>
                    <Upload size={20} className="text-ink-muted mb-2" />
                    <p className="text-sm font-medium" style={{ color: 'var(--ink-text)' }}>
                      Drag & drop file or click to select
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-subtle)' }}>
                      PNG, JPG, or JPEG format. Max file size: 5MB.
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
              onClick={() => navigate(`/civic-projects/${projectId}`)}
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
              {saving ? 'Submitting report…' : 'Submit observation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportObservationPage;
