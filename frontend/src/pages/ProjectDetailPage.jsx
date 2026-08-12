/**
 * ProjectDetailPage — public transparency record for a project.
 * Layout: document-style reading column + sticky sources sidebar.
 * Mobile: tabbed sections (Promise | Funding | Progress | Sources).
 * Signature element: PromiseRealityBar in section 01.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Building2, User, FileText,
  ExternalLink, ShieldCheck, Info, ChevronDown, ChevronUp,
  CheckCircle2, Circle
} from 'lucide-react';
import api from '../services/api';
import {
  StatusPill, BudgetFigure, DateValue, ProgressBar,
  PromiseRealityBar, TrustLabel, Spinner, SectionLabel
} from '../components/shared';

const TABS = ['Overview', 'Funding', 'Progress', 'Sources'];

export const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [contractorUpdates, setContractorUpdates] = useState([]);
  const [citizenObs, setCitizenObs] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/projects/${projectId}`);
        if (res.data.success) {
          setProject(res.data.project);
          setContractorUpdates(res.data.contractorUpdates || []);
          setCitizenObs(res.data.citizenObservations || []);
          setAuditTrail(res.data.auditTrail || []);
        } else {
          setError('Project not found.');
        }
      } catch {
        setError('Unable to load project. It may have been removed or is not yet public.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ink-base)' }}>
        <div className="text-center">
          <Spinner size={28} className="mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>Loading project record…</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ink-base)' }}>
        <div className="cl-card p-10 text-center max-w-sm w-full">
          <p className="text-sm mb-4" style={{ color: 'var(--ink-muted)' }}>{error || 'Project not found.'}</p>
          <button onClick={() => navigate('/explore')} className="cl-btn cl-btn--primary">
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  const budget = project.budget || {};
  const spendPct = budget.released
    ? Math.min(Math.round((budget.reportedExpenditure / budget.released) * 100), 100)
    : 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>

      {/* ── Hero / Project header ── */}
      <div
        className="border-b px-4 sm:px-6 lg:px-8 py-6"
        style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)' }}
      >
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center gap-2 text-sm mb-5 group focus-visible:outline"
            style={{ color: 'var(--ink-muted)' }}
            aria-label="Back to projects"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            All projects
          </button>

          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="cl-badge text-xs"
                >
                  {project.category}
                </span>
                <StatusPill status={project.status} />
                {!project.isPublished && (
                  <span className="cl-badge text-xs" style={{ color: 'var(--ink-muted)' }}>
                    Draft
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold leading-snug mb-3">
                {project.name}
              </h1>
              <div
                className="flex flex-wrap gap-x-5 gap-y-1 text-sm"
                style={{ color: 'var(--ink-muted)' }}
              >
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} aria-hidden="true" /> {project.ward}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 size={13} aria-hidden="true" /> {project.department}
                </span>
                {project.contractorName && (
                  <span className="flex items-center gap-1.5">
                    <User size={13} aria-hidden="true" /> {project.contractorName}
                  </span>
                )}
              </div>
            </div>

            {/* Transparency Score — always explained, never bare */}
            <div
              className="cl-card-raised px-4 py-3 text-center flex-shrink-0"
              title={`Transparency score: ${project.transparencyScore}/100. Calculated from: data completeness, source documents attached, milestone detail, contractor information, progress reported.`}
              aria-label={`Transparency score: ${project.transparencyScore} out of 100`}
            >
              <SectionLabel className="mb-1">Transparency</SectionLabel>
              <div
                className="font-mono text-2xl font-bold"
                style={{ color: project.transparencyScore >= 70 ? 'var(--status-completed-text)' : project.transparencyScore >= 40 ? 'var(--status-atrisk-text)' : 'var(--status-delayed-text)' }}
              >
                {project.transparencyScore}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--ink-subtle)' }}>/ 100</div>
              <div
                className="h-1 mt-2 rounded-full overflow-hidden"
                style={{ background: 'var(--ink-border)', width: '64px' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${project.transparencyScore}%`,
                    background: project.transparencyScore >= 70
                      ? 'var(--status-completed-text)'
                      : project.transparencyScore >= 40
                        ? 'var(--status-atrisk-text)'
                        : 'var(--status-delayed-text)',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile tab navigation ── */}
      <div
        className="md:hidden border-b px-4 overflow-x-auto"
        style={{ borderColor: 'var(--ink-border)', background: 'var(--ink-surface)' }}
      >
        <div className="flex gap-0 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-3 text-sm font-medium border-b-2 transition-colors min-h-touch"
              style={{
                borderColor: activeTab === tab ? 'var(--ink-accent)' : 'transparent',
                color: activeTab === tab ? 'var(--ink-accent)' : 'var(--ink-muted)',
              }}
              aria-selected={activeTab === tab}
              role="tab"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left: sections */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* 01 — The Promise */}
            <DetailSection title="01 — The promise" show={activeTab === 'Overview'}>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--ink-muted)' }}>
                {project.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Start date', value: project.startDate },
                  { label: 'Expected completion', value: project.expectedCompletionDate },
                  { label: 'Ward', value: project.ward },
                  { label: 'Contractor', value: project.contractorName || 'Not yet assigned' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="cl-card-raised p-3 rounded"
                  >
                    <SectionLabel className="mb-1">{label}</SectionLabel>
                    <p className="font-mono text-sm font-medium" style={{ color: 'var(--ink-text)' }}>
                      {value || '—'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Signature element: Promise vs Reality bar */}
              {project.startDate && project.expectedCompletionDate && (
                <div className="cl-card-raised p-4 rounded">
                  <SectionLabel className="mb-3">Timeline vs today</SectionLabel>
                  <PromiseRealityBar
                    startDate={project.startDate}
                    expectedDate={project.expectedCompletionDate}
                    status={project.status}
                  />
                </div>
              )}
            </DetailSection>

            {/* 02 — Funding */}
            <DetailSection title="02 — The funding" show={activeTab === 'Funding'}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Allocated', amount: budget.allocated, color: 'var(--status-completed-text)' },
                  { label: 'Released', amount: budget.released, color: 'var(--status-ongoing-text)' },
                  { label: 'Spent', amount: budget.reportedExpenditure, color: 'var(--status-atrisk-text)' },
                  { label: 'Remaining', amount: budget.remaining, color: 'var(--ink-muted)' },
                ].map(({ label, amount, color }) => (
                  <div key={label} className="cl-card-raised p-3 rounded text-center">
                    <SectionLabel className="mb-1">{label}</SectionLabel>
                    <BudgetFigure
                      amount={amount}
                      className="text-base font-bold"
                      style={{ color }}
                    />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--ink-muted)' }}>
                  <span>Budget utilisation</span>
                  <span className="font-mono">{spendPct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${spendPct}%`,
                      background: 'var(--status-atrisk-text)',
                    }}
                  />
                </div>
              </div>

              {budget.year && (
                <p className="text-xs" style={{ color: 'var(--ink-subtle)' }}>
                  Budget year: <span className="font-mono">{budget.year}</span>
                </p>
              )}
              {budget.source && (
                <div
                  className="flex gap-2 items-start mt-3 p-3 rounded text-xs"
                  style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}
                >
                  <Info size={13} style={{ color: 'var(--ink-accent)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                  <span style={{ color: 'var(--ink-muted)' }}>
                    Budget source: <span style={{ color: 'var(--ink-text)' }}>{budget.source}</span>
                  </span>
                </div>
              )}
            </DetailSection>

            {/* 03 — Progress */}
            <DetailSection title="03 — Progress" show={activeTab === 'Progress'}>
              {project.officialProgress > 0 ? (
                <>
                  <div className="mb-5">
                    <ProgressBar
                      pct={project.officialProgress}
                      status={project.status}
                      showLabel
                    />
                  </div>
                  {project.milestones && project.milestones.length > 0 && (
                    <div className="space-y-3">
                      <SectionLabel className="mb-2">Milestones</SectionLabel>
                      {project.milestones.map((m, i) => (
                        <MilestoneRow key={i} milestone={m} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="p-5 rounded text-sm text-center"
                  style={{ background: 'var(--ink-surface-2)', color: 'var(--ink-muted)', border: '1px solid var(--ink-border)' }}
                >
                  Progress information will appear here once the contractor begins submitting updates.
                </div>
              )}

              {contractorUpdates.length > 0 && (
                <div className="mt-5 space-y-3">
                  <SectionLabel className="mb-2">Contractor reports</SectionLabel>
                  {contractorUpdates.map((u, i) => (
                    <div key={i} className="cl-card-raised p-4 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--ink-text)' }}>
                          {u.contractorName}
                        </span>
                        <TrustLabel type="CONTRACTOR" />
                      </div>
                      <p className="text-xs mb-2" style={{ color: 'var(--ink-muted)' }}>{u.description}</p>
                      <span className="font-mono text-xs" style={{ color: 'var(--ink-subtle)' }}>
                        {u.submittedAt ? new Date(u.submittedAt).toLocaleDateString() : ''}
                        {' · '}Progress: {u.progressPercentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {citizenObs.length > 0 && (
                <div className="mt-5 space-y-3">
                  <SectionLabel className="mb-2">Citizen observations</SectionLabel>
                  {citizenObs.map((obs, i) => (
                    <div key={i} className="cl-card-raised p-4 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--ink-text)' }}>
                          {obs.citizenName || 'Anonymous'}
                        </span>
                        <TrustLabel type={obs.verificationStatus === 'VERIFIED' ? 'CITIZEN' : 'UNVERIFIED'} />
                      </div>
                      <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>{obs.observation || obs.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>

          </div>

          {/* Right: sticky sidebar (desktop) */}
          <aside className="lg:w-72 flex-shrink-0 space-y-4">

            {/* Sources */}
            <div className="cl-card p-5" id="sources-panel">
              <SectionLabel className="mb-3 flex items-center gap-2">
                <FileText size={12} aria-hidden="true" /> Official sources
              </SectionLabel>
              {project.sources && project.sources.length > 0 ? (
                <div className="space-y-2">
                  {project.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 rounded transition-colors group focus-visible:outline"
                      style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}
                      aria-label={`Open source: ${src.title}`}
                    >
                      <FileText
                        size={14}
                        style={{ color: 'var(--ink-accent)', flexShrink: 0, marginTop: 2 }}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-medium leading-snug"
                          style={{ color: 'var(--ink-text)' }}
                        >
                          {src.title}
                        </p>
                        <p className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--ink-subtle)' }}>
                          {src.type}{src.page ? ` · p.${src.page}` : ''}
                        </p>
                      </div>
                      <ExternalLink size={11} style={{ color: 'var(--ink-muted)', flexShrink: 0 }} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs" style={{ color: 'var(--ink-subtle)' }}>
                  No source documents attached yet.
                </p>
              )}
            </div>

            {/* Location */}
            <div className="cl-card p-5">
              <SectionLabel className="mb-3">Location</SectionLabel>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Ward</span>
                  <p className="font-medium">{project.ward}</p>
                </div>
                {project.location?.address && (
                  <div>
                    <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Address</span>
                    <p className="text-sm">{project.location.address}</p>
                  </div>
                )}
                {project.location?.lat && project.location?.lng && (
                  <div>
                    <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Coordinates</span>
                    <p className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>
                      {project.location.lat.toFixed(4)}, {project.location.lng.toFixed(4)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-subtle)' }}>
                      Map view coming in next update.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Project record */}
            <div className="cl-card p-5">
              <SectionLabel className="mb-3">Project record</SectionLabel>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'ID', value: project.id },
                  { label: 'Created', value: project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—' },
                  { label: 'Updated', value: project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-3">
                    <span style={{ color: 'var(--ink-muted)' }}>{label}</span>
                    <span className="font-mono text-right" style={{ color: 'var(--ink-subtle)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit trail */}
            {auditTrail.length > 0 && (
              <div className="cl-card p-5">
                <SectionLabel className="mb-3 flex items-center gap-2">
                  <ShieldCheck size={12} aria-hidden="true" /> Audit trail
                </SectionLabel>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {[...auditTrail].reverse().map((a, i) => (
                    <div key={i} className="pl-3 border-l-2" style={{ borderColor: 'var(--ink-border-2)' }}>
                      <p className="text-xs font-medium" style={{ color: 'var(--ink-text)' }}>{a.action}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>{a.details}</p>
                      <p className="font-mono text-[10px] mt-1" style={{ color: 'var(--ink-subtle)' }}>
                        {a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link to="/explore" className="cl-btn cl-btn--secondary w-full no-underline justify-center">
              <ArrowLeft size={14} /> All projects
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

function DetailSection({ title, show, children }) {
  // On desktop: always show. On mobile: show based on tab or treat as accordion.
  return (
    <section
      className={`cl-card p-5 ${!show ? 'hidden md:block' : ''}`}
      aria-label={title}
    >
      <h2
        className="text-sm font-bold uppercase tracking-wider mb-4"
        style={{ color: 'var(--ink-muted)' }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function MilestoneRow({ milestone: m }) {
  const done = m.status === 'Completed' || m.progress >= 100;
  const delayed = m.status === 'Delayed' || m.status === 'Ongoing' && m.dueDate && new Date(m.dueDate) < new Date();
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
        style={{
          background: done ? 'var(--status-completed-bg)' : 'var(--ink-surface-2)',
          border: `1.5px solid ${done ? 'var(--status-completed-text)' : 'var(--ink-border)'}`,
        }}
        aria-hidden="true"
      >
        {done && <CheckCircle2 size={11} style={{ color: 'var(--status-completed-text)' }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm font-medium" style={{ color: done ? 'var(--ink-muted)' : 'var(--ink-text)' }}>
            {m.title}
          </p>
          <span className="font-mono text-xs" style={{ color: 'var(--ink-subtle)' }}>
            {m.dueDate}
          </span>
        </div>
        {m.progress !== undefined && m.progress > 0 && (
          <ProgressBar pct={m.progress} showLabel={false} className="mt-1.5" />
        )}
      </div>
    </div>
  );
}
