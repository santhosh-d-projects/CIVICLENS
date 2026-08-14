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
  CheckCircle2, Circle, Sparkles, Send, AlertTriangle
} from 'lucide-react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import api from '../services/api';
import {
  StatusPill, BudgetFigure, DateValue, ProgressBar,
  PromiseRealityBar, TrustLabel, Spinner, SectionLabel
} from '../components/shared';

// Create custom colored Leaflet markers using DivIcon
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

const TABS = ['Overview', 'Funding', 'Progress', 'Sources'];

export const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [contractorUpdates, setContractorUpdates] = useState([]);
  const [citizenObs, setCitizenObs] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [assessment, setAssessment] = useState(null);
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
          setAssessment(res.data.assessment || null);
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
                {assessment && (
                  <span
                    className="status-pill font-bold tracking-wide text-[10px] uppercase border"
                    style={{
                      color: assessment.assessment.status === 'COMPLETED' ? 'var(--status-completed-text)'
                           : assessment.assessment.status === 'ON_TRACK' ? 'var(--status-completed-text)'
                           : assessment.assessment.status === 'AT_RISK' ? 'var(--status-atrisk-text)'
                           : 'var(--status-delayed-text)',
                      backgroundColor: assessment.assessment.status === 'COMPLETED' ? 'var(--status-completed-bg)'
                                     : assessment.assessment.status === 'ON_TRACK' ? 'var(--status-completed-bg)'
                                     : assessment.assessment.status === 'AT_RISK' ? 'var(--status-atrisk-bg)'
                                     : 'var(--status-delayed-bg)',
                      borderColor: assessment.assessment.status === 'COMPLETED' ? 'var(--status-completed-border)'
                                 : assessment.assessment.status === 'ON_TRACK' ? 'var(--status-completed-border)'
                                 : assessment.assessment.status === 'AT_RISK' ? 'var(--status-atrisk-border)'
                                 : 'var(--status-delayed-border)'
                    }}
                  >
                    Assessment: {assessment.assessment.status?.replace('_', ' ')}
                  </span>
                )}
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
                <div className="cl-card-raised p-4 rounded space-y-4">
                  <SectionLabel className="mb-1">Promise vs Reality Ledger</SectionLabel>
                  <PromiseRealityBar
                    startDate={project.startDate}
                    expectedDate={project.expectedCompletionDate}
                    status={project.status}
                    officialProgress={project.officialProgress}
                    expectedProgress={assessment?.assessment?.expectedProgress}
                    progressGap={assessment?.assessment?.progressGap}
                    showGapDetails={true}
                  />
                </div>
              )}

              {/* CivicLens Deterministic Risk Assessment Explanation */}
              {assessment && (
                <div className="cl-card p-4 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--ink-text)' }}>
                    <Info size={15} className="text-ink-accent flex-shrink-0" />
                    <span>CivicLens Assessment: {assessment.assessment.status?.replace('_', ' ')}</span>
                  </h3>
                  <div className="text-xs space-y-2">
                    <span className="uppercase block text-[10px] font-bold tracking-wider" style={{ color: 'var(--ink-muted)' }}>Why? (Assessment Reasons)</span>
                    <ul className="list-disc list-inside space-y-1.5" style={{ color: 'var(--ink-text)' }}>
                      {assessment.assessment.reasons?.map((reason, idx) => (
                        <li key={idx} className="text-xs font-medium leading-relaxed" style={{ color: 'var(--ink-text)' }}>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </DetailSection>

            {/* Source-Backed AI Section */}
            <AskCivicLensSection projectId={project.id} projectName={project.name} />

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
              
              {/* Conflict warning banner */}
              {(() => {
                const conflict = citizenObs.find(obs =>
                  ['PROGRESS_OBSERVATION', 'SITE_CONDITION', 'COMPLETION_OBSERVATION'].includes(obs.observationType) &&
                  ['SUBMITTED', 'ACKNOWLEDGED'].includes(obs.status)
                );
                if (!conflict) return null;
                return (
                  <div
                    className="p-4 rounded-lg border mb-5 space-y-3"
                    style={{ borderColor: 'var(--status-atrisk-border)', background: 'var(--status-atrisk-bg)' }}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--status-atrisk-text)' }}>
                      <AlertTriangle size={15} />
                      <span>Information requires verification</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded border" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'var(--ink-border)' }}>
                        <span className="font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--ink-subtle)' }}>Official Record</span>
                        <span className="font-mono text-base font-bold" style={{ color: 'var(--status-completed-text)' }}>{project.officialProgress}%</span> Government Verified
                      </div>
                      <div className="p-3 rounded border" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'var(--ink-border)' }}>
                        <span className="font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--ink-subtle)' }}>Citizen Observation</span>
                        <p className="font-medium" style={{ color: 'var(--ink-text)' }}>{conflict.description}</p>
                      </div>
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--ink-subtle)' }}>
                      CivicLens presents multiple information sources neutrally for public transparency. Ground observations do not automatically change official verification records.
                    </p>
                  </div>
                );
              })()}

              {/* Contractor progress mismatch warning */}
              {(() => {
                const pendingContr = contractorUpdates.find(u => u.status === 'PENDING');
                if (pendingContr && pendingContr.progressPercentage !== project.officialProgress) {
                  return (
                    <div
                      className="p-4 rounded-lg border mb-5 space-y-2 text-xs"
                      style={{ borderColor: 'var(--status-atrisk-border)', background: 'var(--status-atrisk-bg)' }}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--status-atrisk-text)' }}>
                        <Info size={15} />
                        <span>Progress Mismatch Notice</span>
                      </div>
                      <p className="font-semibold text-ink-text leading-normal">
                        Latest contractor progress differs from the current government-verified progress.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-1">
                        <div className="p-3 rounded border" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'var(--ink-border)' }}>
                          <span className="font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--ink-subtle)' }}>Official Record</span>
                          <span className="font-mono text-base font-bold" style={{ color: 'var(--status-completed-text)' }}>{project.officialProgress}%</span> Government Verified
                        </div>
                        <div className="p-3 rounded border" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'var(--ink-border)' }}>
                          <span className="font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--ink-subtle)' }}>Contractor Submission</span>
                          <span className="font-mono text-base font-bold text-ink-text">{pendingContr.progressPercentage}%</span> Proposed (Pending Verification)
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {project.officialProgress > 0 ? (
                <>
                  <div className="mb-5">
                    <div className="flex items-center gap-3 mb-2">
                      <ProgressBar
                        pct={project.officialProgress}
                        status={project.status}
                        showLabel={false}
                        className="flex-1"
                      />
                      <div className="flex-shrink-0 flex items-center gap-1.5 font-mono text-sm font-bold">
                        {project.officialProgress}%
                        <TrustLabel type="OFFICIAL" />
                      </div>
                    </div>
                  </div>
                  {project.milestones && project.milestones.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <SectionLabel className="mb-2">Milestones</SectionLabel>
                      {project.milestones.map((m, i) => (
                        <MilestoneRow key={i} milestone={m} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="p-5 rounded text-sm text-center mb-6"
                  style={{ background: 'var(--ink-surface-2)', color: 'var(--ink-muted)', border: '1px solid var(--ink-border)' }}
                >
                  Progress information will appear here once the contractor begins submitting updates.
                </div>
              )}

              {/* Latest Approved Update Block */}
              {(() => {
                const approved = contractorUpdates.filter(u => u.status === 'APPROVED');
                if (approved.length === 0) return null;
                const latest = [...approved].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
                return (
                  <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: 'var(--status-completed-border)', background: 'var(--status-completed-bg)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--status-completed-text)' }}>
                        Latest Approved Update
                      </span>
                      <TrustLabel type="OFFICIAL" />
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div>Verified Progress: <span className="font-mono font-bold text-ink-text">{latest.progressPercentage}%</span></div>
                      <p className="text-ink-muted text-xs leading-relaxed">{latest.description}</p>
                      {latest.governmentComment && (
                        <div className="mt-2 text-xs p-2 rounded" style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}>
                          <span className="font-semibold text-ink-accent block mb-0.5">Government verification note:</span>
                          {latest.governmentComment}
                        </div>
                      )}
                      <div className="text-[10px] text-ink-subtle pt-1">
                        Approved: {latest.reviewedAt ? new Date(latest.reviewedAt).toLocaleDateString() : ''} by {latest.reviewedBy}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Chronological updates history log */}
              {contractorUpdates.length > 0 && (
                <div className="mb-6 space-y-3">
                  <SectionLabel className="mb-2">Progress Update Timeline</SectionLabel>
                  <div className="space-y-3">
                    {[...contractorUpdates].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).map((u, i) => {
                      const isApproved = u.status === 'APPROVED';
                      const isPending = u.status === 'PENDING';
                      const isRejected = u.status === 'REJECTED';
                      
                      let trustType = 'UNVERIFIED';
                      let borderColor = 'var(--ink-border)';
                      let bgColor = 'var(--ink-surface-2)';
                      
                      if (isApproved) {
                        trustType = 'OFFICIAL';
                        borderColor = 'var(--status-completed-border)';
                        bgColor = 'var(--status-completed-bg)';
                      } else if (isPending) {
                        trustType = 'PENDING_VERIFICATION';
                        borderColor = 'var(--status-atrisk-border)';
                        bgColor = 'var(--status-atrisk-bg)';
                      } else if (isRejected) {
                        trustType = 'REJECTED';
                        borderColor = 'var(--status-delayed-border)';
                        bgColor = 'var(--status-delayed-bg)';
                      }

                      return (
                        <div
                          key={u.id}
                          className="p-4 rounded-lg border space-y-2.5"
                          style={{ borderColor, background: bgColor }}
                        >
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-base font-bold text-ink-text">
                                {u.progressPercentage}%
                              </span>
                              <span className="text-xs font-semibold" style={{ color: 'var(--ink-muted)' }}>
                                {isApproved ? 'government verified' : isPending ? 'contractor submitted' : 'rejected submission'}
                              </span>
                            </div>
                            <TrustLabel type={trustType} />
                          </div>

                          <p className="text-xs leading-normal" style={{ color: 'var(--ink-text)' }}>
                            {u.description}
                          </p>

                          {u.delayReason && (
                            <div className="p-2.5 rounded text-[11px]" style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)', color: 'var(--ink-muted)' }}>
                              <span className="font-semibold text-ink-subtle block mb-0.5">Contractor-provided explanation:</span>
                              {u.delayReason}
                            </div>
                          )}

                          {isApproved && u.governmentComment && (
                            <div className="p-2.5 rounded text-[11px]" style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)', color: 'var(--ink-text)' }}>
                              <span className="font-semibold text-ink-accent block mb-0.5">Government verification note:</span>
                              {u.governmentComment}
                            </div>
                          )}

                          {isRejected && u.governmentComment && (
                            <div className="p-2.5 rounded text-[11px]" style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)', color: 'var(--status-delayed-text)' }}>
                              <span className="font-semibold text-status-delayed-text block mb-0.5">Rejection reason:</span>
                              {u.governmentComment}
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[9px]" style={{ color: 'var(--ink-subtle)' }}>
                            <span className="font-mono">Submitted: {u.submittedAt ? new Date(u.submittedAt).toLocaleDateString() : ''}</span>
                            {isApproved && u.reviewedAt && (
                              <span>Approved: {new Date(u.reviewedAt).toLocaleDateString()}</span>
                            )}
                            {isRejected && u.reviewedAt && (
                              <span>Rejected: {new Date(u.reviewedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Citizen Observations list */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <SectionLabel>Citizen Observations ({citizenObs.length})</SectionLabel>
                  <button
                    onClick={() => navigate(`/citizen/projects/${project.id}/observe`)}
                    className="cl-btn cl-btn--primary cl-btn--sm"
                  >
                    Report what you observed
                  </button>
                </div>

                {citizenObs.length === 0 ? (
                  <div
                    className="p-5 rounded text-sm text-center"
                    style={{ background: 'var(--ink-surface-2)', color: 'var(--ink-muted)', border: '1px solid var(--ink-border)' }}
                  >
                    No citizen observations submitted for this project. Be the first to submit ground proof.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...citizenObs].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((obs, i) => {
                      const obsStatus = obs.status || obs.verificationStatus || 'SUBMITTED';
                      
                      let trustType = 'UNVERIFIED';
                      let borderColor = 'var(--ink-border)';
                      let bgColor = 'var(--ink-surface-2)';
                      
                      if (obsStatus === 'ACKNOWLEDGED') {
                        trustType = 'ACKNOWLEDGED';
                        borderColor = 'var(--status-completed-border)';
                        bgColor = 'var(--status-completed-bg)';
                      } else if (obsStatus === 'DISMISSED') {
                        trustType = 'DISMISSED';
                        borderColor = 'var(--ink-border)';
                        bgColor = 'var(--ink-surface-2)';
                      } else {
                        trustType = 'PENDING_VERIFICATION';
                        borderColor = 'var(--status-atrisk-border)';
                        bgColor = 'var(--status-atrisk-bg)';
                      }

                      return (
                        <div
                          key={obs.id || i}
                          className="p-4 rounded-lg border space-y-2.5"
                          style={{ borderColor, background: bgColor }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                                {obs.observationType?.replace('_', ' ') || 'Citizen Observation'}
                              </span>
                            </div>
                            <TrustLabel type={trustType} />
                          </div>

                          <p className="text-xs leading-normal" style={{ color: 'var(--ink-text)' }}>
                            {obs.description || obs.observationText}
                          </p>

                          {obs.location && obs.location.description && (
                            <div className="text-[11px]" style={{ color: 'var(--ink-subtle)' }}>
                              Location: <span className="font-semibold text-ink-muted">{obs.location.description}</span>
                            </div>
                          )}

                          {obs.evidence && obs.evidence.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {obs.evidence.map((ev, idx) => (
                                <a
                                  key={idx}
                                  href={ev.fileReference}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border hover:border-ink-accent transition-colors"
                                  style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)', color: 'var(--ink-muted)' }}
                                >
                                  <FileText size={10} /> {ev.fileName}
                                </a>
                              ))}
                            </div>
                          )}

                          {obs.governmentComment && (
                            <div className="p-2.5 rounded text-[11px]" style={{ background: 'var(--ink-surface)', border: '1px solid var(--ink-border)', color: 'var(--ink-text)' }}>
                              <span className="font-semibold text-ink-accent block mb-0.5">Government Comment:</span>
                              {obs.governmentComment}
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[9px]" style={{ color: 'var(--ink-subtle)' }}>
                            <span className="font-mono">Submitted: {obs.createdAt ? new Date(obs.createdAt).toLocaleDateString() : ''}</span>
                            {obs.reviewedBy && obs.reviewedAt && (
                              <span>Reviewed by {obs.reviewedBy}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
                  <div className="space-y-2">
                    <span className="text-xs block" style={{ color: 'var(--ink-muted)' }}>Coordinates</span>
                    <p className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>
                      {parseFloat(project.location.lat).toFixed(4)}, {parseFloat(project.location.lng).toFixed(4)}
                    </p>
                    
                    {/* Small Map Widget */}
                    <div
                      className="rounded overflow-hidden border border-ink-border cursor-pointer relative mt-2"
                      style={{ height: '140px', zIndex: 1 }}
                      onClick={() => navigate('/citizen/dashboard')}
                      title="Click to view on larger citizen map"
                    >
                      <MapContainer
                        center={[parseFloat(project.location.lat), parseFloat(project.location.lng)]}
                        zoom={14}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                        dragging={false}
                        doubleClickZoom={false}
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker
                          position={[parseFloat(project.location.lat), parseFloat(project.location.lng)]}
                          icon={createCustomMarker(assessment?.assessment?.status || 'ON_TRACK')}
                        />
                      </MapContainer>
                    </div>
                    <div className="text-[10px] text-center italic mt-1" style={{ color: 'var(--ink-subtle)' }}>
                      Click map to open larger Civic Map.
                    </div>
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

const SUGGESTED_QUESTIONS = [
  "Why is this project behind schedule?",
  "What is the sanctioned budget?",
  "What is the latest reported progress?",
  "Who is the contractor?"
];

function AskCivicLensSection({ projectId, projectName }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const handleAsk = async (queryToAsk) => {
    const q = (queryToAsk || question).trim();
    if (!q || loading) return;

    setQuestion(q);
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/ai/ask', {
        projectId,
        question: q
      });
      if (res.data && res.data.success) {
        setResponse(res.data);
      } else {
        setError(res.data?.error || "Unable to reach CivicLens AI right now.");
      }
    } catch {
      setError("Unable to reach CivicLens AI right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="cl-card p-5 space-y-4 my-6 border"
      style={{ borderColor: 'var(--ink-border)', background: 'var(--ink-surface-2)' }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: 'var(--ink-accent)' }} />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--ink-text)' }}>
            ASK CIVICLENS
          </h3>
        </div>
        <span className="cl-badge text-[10px] font-mono" style={{ color: 'var(--ink-accent)' }}>
          Source-Backed AI
        </span>
      </div>

      <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
        Ask a question about {projectName || 'this project'}. Answers are synthesized directly from official government records and field audit documents with verified citations.
      </p>

      {/* Suggested Questions */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((sq, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => handleAsk(sq)}
            className="text-xs px-3 py-1.5 rounded border transition-colors text-left disabled:opacity-50"
            style={{
              background: 'var(--ink-surface)',
              borderColor: 'var(--ink-border)',
              color: 'var(--ink-text)'
            }}
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleAsk(); }} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about budget, timeline, or progress..."
          disabled={loading}
          className="flex-1 rounded px-3 py-2 text-xs focus:outline-none disabled:opacity-50"
          style={{
            background: 'var(--ink-surface)',
            border: '1px solid var(--ink-border)',
            color: 'var(--ink-text)'
          }}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="cl-btn cl-btn--primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Spinner size={12} />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Send size={12} />
              <span>Ask</span>
            </>
          )}
        </button>
      </form>

      {/* Loading state */}
      {loading && (
        <div
          className="p-3.5 rounded text-xs flex items-center gap-2 border"
          style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)', color: 'var(--ink-accent)' }}
        >
          <Spinner size={14} />
          <span>Analyzing CivicLens sources...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className="p-3 rounded text-xs border"
          style={{ background: 'var(--status-delayed-bg)', borderColor: 'var(--status-delayed-border)', color: 'var(--status-delayed-text)' }}
        >
          {error}
        </div>
      )}

      {/* Answer Output Block */}
      {response && (
        <div
          className="p-4 rounded-lg border space-y-3 text-xs"
          style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)' }}
        >
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--ink-border)' }}>
            <span className="font-semibold uppercase tracking-wider text-[10px]" style={{ color: 'var(--ink-accent)' }}>
              Grounded Answer
            </span>
            <span
              className="text-[10px] font-mono font-bold"
              style={{ color: response.grounded ? 'var(--status-completed-text)' : 'var(--status-atrisk-text)' }}
            >
              {response.grounded ? 'Source Verified' : 'Notice'}
            </span>
          </div>

          <div className="leading-relaxed whitespace-pre-line text-xs" style={{ color: 'var(--ink-text)' }}>
            {response.answer}
          </div>

          {/* Page-level Citations */}
          {response.sources && response.sources.length > 0 && (
            <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--ink-border)' }}>
              <span className="uppercase tracking-wider text-[9px] font-bold block" style={{ color: 'var(--ink-muted)' }}>
                Sources:
              </span>
              <div className="flex flex-wrap gap-2">
                {response.sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px]"
                    style={{ background: 'var(--ink-surface-2)', borderColor: 'var(--ink-border)', color: 'var(--ink-text)' }}
                  >
                    <FileText size={11} style={{ color: 'var(--ink-accent)' }} />
                    <span>{src.documentName || src.document}</span>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--ink-subtle)' }}>Page {src.page}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
