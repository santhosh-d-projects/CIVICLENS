import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, ArrowRight, CheckCircle2, Landmark, Building2, ShieldCheck, Tag } from 'lucide-react';

export const SchemeCard = ({ scheme, className = '' }) => {
  const navigate = useNavigate();

  const isCentral = scheme.governmentLevel === 'CENTRAL';

  const handleClick = () => {
    navigate(`/schemes/${scheme.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/schemes/${scheme.id}`);
    }
  };

  return (
    <article
      className={`cl-card cl-card-interactive p-5 flex flex-col justify-between rounded-xl border transition-all hover:shadow-md ${className}`}
      style={{
        background: 'var(--ink-surface)',
        borderColor: 'var(--ink-border)',
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`Scheme: ${scheme.name}`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider"
            style={{
              background: isCentral ? 'rgba(255, 153, 51, 0.1)' : 'rgba(19, 136, 8, 0.1)',
              borderColor: isCentral ? 'var(--tricolor-saffron-dark)' : 'var(--tricolor-green-dark)',
              color: isCentral ? 'var(--tricolor-saffron-dark)' : 'var(--tricolor-green-dark)',
            }}
          >
            <span>{isCentral ? '🇮🇳 Central Govt' : '🏛 Karnataka Govt'}</span>
          </span>

          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded"
            style={{
              background: 'var(--ink-surface-2)',
              color: 'var(--ink-muted)',
              border: '1px solid var(--ink-border)',
            }}
          >
            {scheme.category}
          </span>
        </div>

        {/* Scheme Name */}
        <h3
          className="text-base font-bold leading-snug mb-1.5 line-clamp-2"
          style={{ color: 'var(--ink-text)' }}
        >
          {scheme.name}
        </h3>

        {/* Department / Ministry */}
        <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'var(--ink-muted)' }}>
          <Building2 size={12} className="flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{scheme.department}</span>
        </div>

        {/* Summary Description */}
        <p
          className="text-xs leading-relaxed mb-4 line-clamp-3"
          style={{ color: 'var(--ink-muted)' }}
        >
          {scheme.summary}
        </p>

        {/* Benefits Tag */}
        {scheme.badgeText && (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold mb-4 w-full"
            style={{
              background: 'var(--ink-surface-2)',
              border: '1px solid var(--ink-border)',
              color: 'var(--ink-text)',
            }}
          >
            <CheckCircle2 size={13} style={{ color: 'var(--status-completed-text)' }} className="flex-shrink-0" />
            <span className="truncate">{scheme.badgeText}</span>
          </div>
        )}
      </div>

      {/* Footer / CTA Actions */}
      <div
        className="pt-3 border-t flex items-center justify-between gap-2 mt-2"
        style={{ borderColor: 'var(--ink-border)' }}
      >
        <span className="text-[11px] font-semibold" style={{ color: 'var(--ink-accent-text)' }}>
          Official Details →
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/schemes/${scheme.id}`);
          }}
          className="cl-btn cl-btn--secondary cl-btn--sm py-1 px-3 text-xs font-semibold"
          aria-label={`View details for ${scheme.shortName || scheme.name}`}
        >
          <span>View Details</span>
          <ArrowRight size={13} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};

export default SchemeCard;
