/**
 * Project form page — create and edit civic projects.
 * Route: /government/projects/new and /government/projects/:id/edit
 * Validates: required fields, dates, budget, lat/lng.
 * Does NOT trust frontend role — backend validates independently.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Globe, EyeOff, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Spinner, Toast, SectionLabel } from '../components/shared';
import {
  PROJECT_CATEGORIES, PROJECT_STATUSES, DEMO_DEPARTMENTS, DEMO_WARDS, BUDGET_YEARS
} from '../constants/civic';

const EMPTY_FORM = {
  name: '',
  description: '',
  category: '',
  department: '',
  ward: '',
  locationAddress: '',
  lat: '',
  lng: '',
  allocatedBudget: '',
  releasedBudget: '',
  reportedExpenditure: '',
  budgetYear: '2025-2026',
  budgetSource: '',
  startDate: '',
  expectedCompletionDate: '',
  contractorId: '',
  status: 'PLANNED',
  isPublished: false,
};

export const ManageProjectsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(projectId);

  const [form, setForm] = useState(EMPTY_FORM);
  const [contractors, setContractors] = useState([]);
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch existing project on edit
  useEffect(() => {
    const init = async () => {
      try {
        const [conRes] = await Promise.all([
          api.get('/government/contractors'),
        ]);
        if (conRes.data.success) setContractors(conRes.data.contractors || []);

        if (isEdit) {
          const projRes = await api.get(`/projects/${projectId}`);
          if (projRes.data.success) {
            const p = projRes.data.project;
            const b = p.budget || {};
            setForm({
              name: p.name || '',
              description: p.description || '',
              category: p.category || '',
              department: p.department || '',
              ward: p.ward || '',
              locationAddress: p.location?.address || '',
              lat: p.location?.lat?.toString() || '',
              lng: p.location?.lng?.toString() || '',
              allocatedBudget: b.allocated?.toString() || '',
              releasedBudget: b.released?.toString() || '',
              reportedExpenditure: b.reportedExpenditure?.toString() || '',
              budgetYear: b.year || '2025-2026',
              budgetSource: b.source || '',
              startDate: p.startDate || '',
              expectedCompletionDate: p.expectedCompletionDate || '',
              contractorId: p.contractorId || '',
              status: p.status || 'PLANNED',
              isPublished: p.isPublished || false,
            });
          }
        }
      } catch (err) {
        showToast('Failed to load project data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [projectId, isEdit]);

  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    // Clear field error on change
    if (fieldErrors[key]) {
      setFieldErrors(fe => { const next = { ...fe }; delete next[key]; return next; });
    }
  };

  const clientValidate = () => {
    const errs = [];
    const fe = {};
    if (!form.name.trim())        { errs.push('Project name is required.'); fe.name = true; }
    if (!form.description.trim()) { errs.push('Description is required.'); fe.description = true; }
    if (!form.category)           { errs.push('Category is required.'); fe.category = true; }
    if (!form.department.trim())  { errs.push('Department is required.'); fe.department = true; }
    if (!form.ward.trim())        { errs.push('Ward is required.'); fe.ward = true; }
    if (!form.startDate)          { errs.push('Start date is required.'); fe.startDate = true; }
    if (!form.expectedCompletionDate) { errs.push('Expected completion date is required.'); fe.expectedCompletionDate = true; }
    if (!form.allocatedBudget)    { errs.push('Allocated budget is required.'); fe.allocatedBudget = true; }
    if (form.allocatedBudget && Number(form.allocatedBudget) <= 0) {
      errs.push('Budget must be a positive number.'); fe.allocatedBudget = true;
    }
    if (form.startDate && form.expectedCompletionDate &&
        new Date(form.expectedCompletionDate) < new Date(form.startDate)) {
      errs.push('Completion date cannot be before start date.');
      fe.expectedCompletionDate = true;
    }
    return { errs, fe };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errs, fe } = clientValidate();
    if (errs.length > 0) {
      setErrors(errs);
      setFieldErrors(fe);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors([]);
    setFieldErrors({});
    setSaving(true);

    try {
      const payload = {
        ...form,
        allocatedBudget: Number(form.allocatedBudget),
        releasedBudget: Number(form.releasedBudget || form.allocatedBudget),
        reportedExpenditure: Number(form.reportedExpenditure || 0),
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
      };

      let res;
      if (isEdit) {
        res = await api.put(`/government/projects/${projectId}`, payload);
      } else {
        res = await api.post('/government/projects', payload);
      }

      if (res.data.success) {
        showToast(isEdit ? 'Project updated.' : 'Project created.');
        setTimeout(() => navigate('/government/dashboard'), 1200);
      } else {
        const backendErrors = res.data.errors || [res.data.error || 'An error occurred.'];
        setErrors(backendErrors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      const msgs = err?.response?.data?.errors || [err?.response?.data?.error || 'Request failed.'];
      setErrors(msgs);
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>
      <Toast message={toast?.message} type={toast?.type} onDismiss={() => setToast(null)} />

      {/* Page header */}
      <div
        className="border-b px-4 sm:px-6 lg:px-8 py-5"
        style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)' }}
      >
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/government/dashboard')}
            className="flex items-center gap-2 text-sm mb-3 group"
            style={{ color: 'var(--ink-muted)' }}
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Admin dashboard
          </button>
          <h1 className="text-xl font-bold">
            {isEdit ? 'Edit civic project' : 'New civic project'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            {isEdit
              ? 'Update the project details. Changes are logged to the audit trail.'
              : 'Create a new project record. Save as draft to review before publishing.'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Validation errors */}
        {errors.length > 0 && (
          <div
            className="mb-6 p-4 rounded-lg"
            style={{ background: 'var(--status-delayed-bg)', border: '1px solid var(--status-delayed-border)' }}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={15} style={{ color: 'var(--status-delayed-text)' }} aria-hidden="true" />
              <span className="text-sm font-semibold" style={{ color: 'var(--status-delayed-text)' }}>
                Please fix the following:
              </span>
            </div>
            <ul className="list-disc list-inside space-y-0.5">
              {errors.map((e, i) => (
                <li key={i} className="text-sm" style={{ color: 'var(--ink-text)' }}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-8">

            {/* Basic information */}
            <FormSection title="Basic information">
              <FormField label="Project name *" error={fieldErrors.name}>
                <input
                  id="field-name"
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Ward 12 Road Development"
                  className={`cl-input ${fieldErrors.name ? 'cl-input--error' : ''}`}
                  required
                  maxLength={200}
                  aria-describedby={fieldErrors.name ? 'err-name' : undefined}
                />
              </FormField>

              <FormField label="Description *" error={fieldErrors.description}>
                <textarea
                  id="field-description"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describe the work, its scope, and intended beneficiaries."
                  className={`cl-input ${fieldErrors.description ? 'cl-input--error' : ''}`}
                  rows={4}
                  required
                  style={{ resize: 'vertical' }}
                  aria-describedby={fieldErrors.description ? 'err-description' : undefined}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Category *" error={fieldErrors.category}>
                  <select
                    id="field-category"
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                    className={`cl-input ${fieldErrors.category ? 'cl-input--error' : ''}`}
                    required
                  >
                    <option value="">Select category</option>
                    {PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>

                <FormField label="Department *" error={fieldErrors.department}>
                  <select
                    id="field-department"
                    value={form.department}
                    onChange={e => set('department', e.target.value)}
                    className={`cl-input ${fieldErrors.department ? 'cl-input--error' : ''}`}
                    required
                  >
                    <option value="">Select department</option>
                    {DEMO_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </FormField>
              </div>
            </FormSection>

            {/* Location */}
            <FormSection title="Location">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Ward *" error={fieldErrors.ward}>
                  <select
                    id="field-ward"
                    value={form.ward}
                    onChange={e => set('ward', e.target.value)}
                    className={`cl-input ${fieldErrors.ward ? 'cl-input--error' : ''}`}
                    required
                  >
                    <option value="">Select ward</option>
                    {DEMO_WARDS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </FormField>

                <FormField label="Address / location description">
                  <input
                    id="field-address"
                    type="text"
                    value={form.locationAddress}
                    onChange={e => set('locationAddress', e.target.value)}
                    placeholder="e.g. Main Road, Ward 12"
                    className="cl-input"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Latitude (optional)">
                  <input
                    id="field-lat"
                    type="number"
                    value={form.lat}
                    onChange={e => set('lat', e.target.value)}
                    placeholder="e.g. 12.9716"
                    className="cl-input font-mono"
                    step="any"
                    min="-90"
                    max="90"
                  />
                </FormField>
                <FormField label="Longitude (optional)">
                  <input
                    id="field-lng"
                    type="number"
                    value={form.lng}
                    onChange={e => set('lng', e.target.value)}
                    placeholder="e.g. 77.5946"
                    className="cl-input font-mono"
                    step="any"
                    min="-180"
                    max="180"
                  />
                </FormField>
              </div>
              <p className="text-xs" style={{ color: 'var(--ink-subtle)' }}>
                Coordinates will be used for the map integration in the next milestone.
              </p>
            </FormSection>

            {/* Financial information */}
            <FormSection title="Financial information">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Allocated budget (₹) *" error={fieldErrors.allocatedBudget}>
                  <input
                    id="field-allocated"
                    type="number"
                    value={form.allocatedBudget}
                    onChange={e => set('allocatedBudget', e.target.value)}
                    placeholder="e.g. 5000000"
                    className={`cl-input font-mono ${fieldErrors.allocatedBudget ? 'cl-input--error' : ''}`}
                    min="1"
                    required
                  />
                </FormField>
                <FormField label="Released budget (₹)">
                  <input
                    id="field-released"
                    type="number"
                    value={form.releasedBudget}
                    onChange={e => set('releasedBudget', e.target.value)}
                    placeholder="Same as allocated if unknown"
                    className="cl-input font-mono"
                    min="0"
                  />
                </FormField>
                <FormField label="Reported expenditure (₹)">
                  <input
                    id="field-expenditure"
                    type="number"
                    value={form.reportedExpenditure}
                    onChange={e => set('reportedExpenditure', e.target.value)}
                    placeholder="0"
                    className="cl-input font-mono"
                    min="0"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Budget year">
                  <select
                    id="field-budget-year"
                    value={form.budgetYear}
                    onChange={e => set('budgetYear', e.target.value)}
                    className="cl-input"
                  >
                    {BUDGET_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </FormField>
                <FormField label="Budget source / reference">
                  <input
                    id="field-budget-source"
                    type="text"
                    value={form.budgetSource}
                    onChange={e => set('budgetSource', e.target.value)}
                    placeholder="e.g. BBMP Budget 2025-26, Head 440"
                    className="cl-input"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Timeline */}
            <FormSection title="Timeline">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Start date *" error={fieldErrors.startDate}>
                  <input
                    id="field-start-date"
                    type="date"
                    value={form.startDate}
                    onChange={e => set('startDate', e.target.value)}
                    className={`cl-input font-mono ${fieldErrors.startDate ? 'cl-input--error' : ''}`}
                    required
                  />
                </FormField>
                <FormField label="Expected completion date *" error={fieldErrors.expectedCompletionDate}>
                  <input
                    id="field-end-date"
                    type="date"
                    value={form.expectedCompletionDate}
                    onChange={e => set('expectedCompletionDate', e.target.value)}
                    className={`cl-input font-mono ${fieldErrors.expectedCompletionDate ? 'cl-input--error' : ''}`}
                    required
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Contractor assignment */}
            <FormSection title="Contractor assignment">
              <FormField label="Assigned contractor">
                <select
                  id="field-contractor"
                  value={form.contractorId}
                  onChange={e => set('contractorId', e.target.value)}
                  className="cl-input"
                >
                  <option value="">No contractor assigned</option>
                  {contractors.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </FormField>
              <p className="text-xs" style={{ color: 'var(--ink-subtle)' }}>
                Only registered contractors appear here. Contact CivicLens admin to add new contractors.
              </p>
            </FormSection>

            {/* Status */}
            <FormSection title="Project status">
              <FormField label="Current status">
                <select
                  id="field-status"
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  className="cl-input"
                >
                  {PROJECT_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </FormField>
            </FormSection>

            {/* Publication */}
            <FormSection title="Publication">
              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink-text)' }}>
                    {form.isPublished ? 'Published — visible to all citizens' : 'Draft — not yet public'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                    {form.isPublished
                      ? 'This project appears on the public Explore page and project directory.'
                      : 'Only government admins can see this project. Publish when ready.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => set('isPublished', !form.isPublished)}
                  id="toggle-publish"
                  className="flex items-center gap-2 cl-btn cl-btn--sm"
                  style={form.isPublished
                    ? { background: 'var(--status-completed-bg)', color: 'var(--status-completed-text)', border: '1px solid var(--status-completed-border)' }
                    : { background: 'var(--ink-surface)', color: 'var(--ink-muted)', border: '1px solid var(--ink-border)' }
                  }
                  aria-pressed={form.isPublished}
                >
                  {form.isPublished ? <Globe size={13} /> : <EyeOff size={13} />}
                  {form.isPublished ? 'Published' : 'Draft'}
                </button>
              </div>
            </FormSection>

            {/* Actions */}
            <div
              className="flex flex-wrap gap-3 pt-4 border-t"
              style={{ borderColor: 'var(--ink-border)' }}
            >
              <button
                type="button"
                onClick={() => navigate('/government/dashboard')}
                className="cl-btn cl-btn--secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-save-project"
                disabled={saving}
                className="cl-btn cl-btn--primary"
              >
                {saving ? <Spinner size={14} /> : <Save size={14} />}
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

function FormSection({ title, children }) {
  return (
    <fieldset className="cl-card p-5 rounded-lg space-y-4" style={{ border: '1px solid var(--ink-border)' }}>
      <legend className="text-sm font-bold px-1" style={{ color: 'var(--ink-muted)' }}>
        {title.toUpperCase()}
      </legend>
      {children}
    </fieldset>
  );
}

function FormField({ label, children, error }) {
  return (
    <div>
      <label
        className="cl-label"
        style={error ? { color: 'var(--status-delayed-text)' } : {}}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1" style={{ color: 'var(--status-delayed-text)' }} role="alert">
          This field is required.
        </p>
      )}
    </div>
  );
}
