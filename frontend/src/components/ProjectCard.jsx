/**
 * ProjectCard — reusable project summary card.
 * Used on: Explore page, Citizen dashboard, Contractor dashboard.
 * Design rules:
 * - Status is always icon + color + sentence-case label
 * - Budget always in JetBrains Mono
 * - Promise/Reality bar only if project has both dates
 * - No gratuitous animation — only subtle border-color transition
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, Calendar, User } from 'lucide-react';
import { StatusPill, BudgetFigure, PromiseRealityBar } from './shared';

export function ProjectCard({ project, linkTo, className = '' }) {
  const navigate = useNavigate();
  const href = linkTo || `/civic-projects/${project.id}`;

  const handleClick = () => navigate(href);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <article
      className={`cl-card cl-card-interactive p-5 flex flex-col gap-4 ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`Project: ${project.name}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <span
            className="cl-section-label px-2 py-0.5 rounded"
            style={{ background: 'var(--ink-surface-2)', color: 'var(--ink-muted)' }}
          >
            {project.category}
          </span>
        </div>
        <StatusPill status={project.status} />
      </div>

      {/* Name */}
      <h3
        className="font-semibold leading-snug text-base"
        style={{ color: 'var(--ink-text)' }}
      >
        {project.name}
      </h3>

      {/* Meta row */}
      <div className="flex flex-col gap-1.5 text-sm" style={{ color: 'var(--ink-muted)' }}>
        <div className="flex items-center gap-2">
          <MapPin size={13} aria-hidden="true" />
          <span>{project.ward}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 size={13} aria-hidden="true" />
          <span>{project.department}</span>
        </div>
        {project.contractorName && (
          <div className="flex items-center gap-2">
            <User size={13} aria-hidden="true" />
            <span>{project.contractorName}</span>
          </div>
        )}
      </div>

      {/* Budget */}
      <div
        className="flex items-center justify-between py-2.5 px-3 rounded"
        style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}
      >
        <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Allocated budget</span>
        <BudgetFigure
          amount={project.budget?.allocated}
          className="text-sm font-semibold"
          style={{ color: 'var(--ink-text)' }}
        />
      </div>

      {/* Timeline bar — signature element */}
      {project.startDate && project.expectedCompletionDate && (
        <PromiseRealityBar
          startDate={project.startDate}
          expectedDate={project.expectedCompletionDate}
          status={project.status}
        />
      )}

      {/* Draft indicator */}
      {project.isPublished === false && (
        <div
          className="text-xs font-semibold px-2 py-1 rounded text-center"
          style={{ background: 'var(--ink-surface-2)', color: 'var(--ink-muted)', border: '1px dashed var(--ink-border)' }}
        >
          Draft — not publicly visible
        </div>
      )}
    </article>
  );
}
