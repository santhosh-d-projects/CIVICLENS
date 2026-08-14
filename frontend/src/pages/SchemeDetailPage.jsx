/**
 * SchemeDetailPage — Detailed breakdown of an individual government scheme.
 * Contains benefits, eligibility criteria, required documents, step-by-step application instructions,
 * and direct links to official government portals with source attribution.
 */
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Building2, CheckCircle2, FileText,
  HelpCircle, ShieldCheck, AlertCircle, Info, Landmark, Share2,
  Calendar, Check, UserCheck
} from 'lucide-react';
import { SCHEMES_DATA } from '../constants/schemes';
import { SchemeCard } from '../components/SchemeCard';

export const SchemeDetailPage = () => {
  const { schemeId } = useParams();
  const navigate = useNavigate();

  const scheme = useMemo(() => {
    return SCHEMES_DATA.find((s) => s.id === schemeId);
  }, [schemeId]);

  const relatedSchemes = useMemo(() => {
    if (!scheme) return [];
    return SCHEMES_DATA.filter(
      (s) => s.id !== scheme.id && (s.category === scheme.category || s.governmentLevel === scheme.governmentLevel)
    ).slice(0, 3);
  }, [scheme]);

  if (!scheme) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ink-base)' }}>
        <div className="cl-card p-10 text-center max-w-md w-full border" style={{ borderColor: 'var(--ink-border)' }}>
          <AlertCircle size={36} className="mx-auto mb-3" style={{ color: 'var(--status-delayed-text)' }} />
          <h1 className="text-lg font-bold mb-2">Scheme Not Found</h1>
          <p className="text-xs mb-6" style={{ color: 'var(--ink-muted)' }}>
            The requested government scheme or yojana could not be found in the CivicLens directory.
          </p>
          <button
            onClick={() => navigate('/schemes')}
            className="cl-btn cl-btn--primary cl-btn--sm mx-auto"
          >
            ← Back to all schemes
          </button>
        </div>
      </div>
    );
  }

  const isCentral = scheme.governmentLevel === 'CENTRAL';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>
      {/* ── Top Header / Breadcrumb ── */}
      <div
        className="border-b px-4 sm:px-6 lg:px-8 py-6"
        style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)' }}
      >
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate('/schemes')}
            className="flex items-center gap-2 text-xs font-semibold mb-4 group focus-visible:outline transition-colors"
            style={{ color: 'var(--ink-muted)' }}
            aria-label="Back to all schemes"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>All Government Schemes</span>
          </button>

          {/* Scheme Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider"
              style={{
                background: isCentral ? 'rgba(255, 153, 51, 0.12)' : 'rgba(19, 136, 8, 0.12)',
                borderColor: isCentral ? 'var(--tricolor-saffron-dark)' : 'var(--tricolor-green-dark)',
                color: isCentral ? 'var(--tricolor-saffron-dark)' : 'var(--tricolor-green-dark)',
              }}
            >
              <span>{isCentral ? '🇮🇳 Central Government Scheme' : '🏛 Karnataka State Government Scheme'}</span>
            </span>

            <span
              className="text-xs font-semibold px-2.5 py-1 rounded"
              style={{
                background: 'var(--ink-surface-2)',
                color: 'var(--ink-text)',
                border: '1px solid var(--ink-border)',
              }}
            >
              {scheme.category}
            </span>

            {scheme.badgeText && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded border"
                style={{
                  background: 'var(--ink-surface-2)',
                  borderColor: 'var(--ink-border)',
                  color: 'var(--status-completed-text)',
                }}
              >
                {scheme.badgeText}
              </span>
            )}
          </div>

          {/* Scheme Title */}
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2" style={{ color: 'var(--ink-text)' }}>
            {scheme.name}
          </h1>

          {/* Ministry / Department */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs" style={{ color: 'var(--ink-muted)' }}>
            <span className="flex items-center gap-1.5 font-medium">
              <Building2 size={13} aria-hidden="true" />
              {scheme.department}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <UserCheck size={13} aria-hidden="true" />
              Target: {scheme.targetGroup}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {/* ── Summary & Official Portal Action Card ── */}
        <div
          className="cl-card p-6 sm:p-7 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
          style={{
            background: 'var(--ink-surface-2)',
            borderColor: 'var(--ink-border-2)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div className="flex-1 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--ink-subtle)' }}>
              Scheme Overview
            </span>
            <p className="text-sm sm:text-base font-medium leading-relaxed" style={{ color: 'var(--ink-text)' }}>
              {scheme.summary}
            </p>
            <div className="text-xs pt-1 flex items-center gap-2" style={{ color: 'var(--ink-muted)' }}>
              <ShieldCheck size={14} style={{ color: 'var(--status-completed-text)' }} />
              <span>Verified Government Record • Last Checked: {scheme.lastVerified}</span>
            </div>
          </div>

          <div className="w-full md:w-auto flex-shrink-0">
            <a
              href={scheme.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cl-btn cl-btn--primary w-full md:w-auto px-5 py-3 text-sm font-bold flex items-center justify-center gap-2 no-underline shadow-md"
            >
              <span>Visit Official Portal</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>

        {/* ── Key Benefits ── */}
        <section className="cl-card p-6 sm:p-7 rounded-xl border space-y-4" style={{ borderColor: 'var(--ink-border)' }}>
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--ink-border)' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--status-completed-text)' }} />
            <h2 className="text-base font-bold uppercase tracking-wider" style={{ color: 'var(--ink-text)' }}>
              Key Benefits & Entitlements
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {scheme.benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-lg border"
                style={{
                  background: 'var(--ink-surface)',
                  borderColor: 'var(--ink-border)',
                }}
              >
                <span
                  className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{
                    background: 'rgba(30, 101, 46, 0.1)',
                    color: 'var(--status-completed-text)',
                  }}
                >
                  ✓
                </span>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink-text)' }}>
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Eligibility & Required Documents Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eligibility Criteria */}
          <section className="cl-card p-6 rounded-xl border space-y-4" style={{ borderColor: 'var(--ink-border)' }}>
            <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--ink-border)' }}>
              <UserCheck size={18} style={{ color: 'var(--ink-accent)' }} />
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--ink-text)' }}>
                Eligibility Criteria
              </h2>
            </div>

            <ul className="space-y-3">
              {scheme.eligibility.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--ink-text)' }}>
                  <span className="font-bold text-ink-accent mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Required Documents */}
          <section className="cl-card p-6 rounded-xl border space-y-4" style={{ borderColor: 'var(--ink-border)' }}>
            <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--ink-border)' }}>
              <FileText size={18} style={{ color: 'var(--status-ongoing-text)' }} />
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--ink-text)' }}>
                Required Documents
              </h2>
            </div>

            <ul className="space-y-3">
              {scheme.documents.map((doc, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded border text-xs"
                  style={{
                    background: 'var(--ink-surface-2)',
                    borderColor: 'var(--ink-border)',
                    color: 'var(--ink-text)',
                  }}
                >
                  <FileText size={13} style={{ color: 'var(--ink-muted)' }} className="flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{doc}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ── Step-by-Step How to Apply ── */}
        <section className="cl-card p-6 sm:p-7 rounded-xl border space-y-4" style={{ borderColor: 'var(--ink-border)' }}>
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--ink-border)' }}>
            <Landmark size={18} style={{ color: 'var(--tricolor-saffron-dark)' }} />
            <h2 className="text-base font-bold uppercase tracking-wider" style={{ color: 'var(--ink-text)' }}>
              How to Apply & Application Procedure
            </h2>
          </div>

          <div className="space-y-3">
            {scheme.howToApply.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3.5 rounded-lg border"
                style={{
                  background: 'var(--ink-surface)',
                  borderColor: 'var(--ink-border)',
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold"
                  style={{
                    background: 'var(--ink-surface-2)',
                    border: '1px solid var(--ink-border-2)',
                    color: 'var(--ink-text)',
                  }}
                >
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink-text)' }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Official Source Attribution ── */}
        <div
          className="p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{
            background: 'var(--ink-surface)',
            borderColor: 'var(--ink-border)',
          }}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--ink-subtle)' }}>
              Source Attribution & Verification
            </span>
            <p className="text-xs font-medium" style={{ color: 'var(--ink-text)' }}>
              Information source: <span className="font-semibold">{scheme.source}</span>
            </p>
            <p className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>
              Official Portal Link: <span className="font-mono">{scheme.officialUrl}</span>
            </p>
          </div>

          <a
            href={scheme.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cl-btn cl-btn--secondary cl-btn--sm self-start sm:self-auto no-underline"
          >
            <span>Open Official Website</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {/* ── Related Schemes ── */}
        {relatedSchemes.length > 0 && (
          <section className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--ink-border)' }}>
            <h2 className="text-base font-bold" style={{ color: 'var(--ink-text)' }}>
              More Schemes & Yojanas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedSchemes.map((rel) => (
                <SchemeCard key={rel.id} scheme={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SchemeDetailPage;
