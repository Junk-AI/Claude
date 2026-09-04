import React from 'react';
import { pct } from '../lib/storage.js';

export const Bar = ({ value, large }) => (
  <div className={`bar${large ? ' bar-lg' : ''}`} role="progressbar"
       aria-valuenow={pct(value)} aria-valuemin={0} aria-valuemax={100}>
    <i style={{ width: `${Math.max(2, pct(value))}%` }} />
  </div>
);

export const Mastery = ({ value, label = 'mastery' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
    <div className="row-between">
      <span className="tiny dim">{label}</span>
      <span className="tiny mono muted" style={{ fontWeight: 600 }}>{pct(value)}%</span>
    </div>
    <Bar value={value} />
  </div>
);

export const Badge = ({ children, tone = '' }) => (
  <span className={`badge${tone ? ` badge-${tone}` : ''}`}>{children}</span>
);

export const Card = ({ children, tight, className = '', ...rest }) => (
  <div className={`card${tight ? ' card-tight' : ''} ${className}`} {...rest}>{children}</div>
);

export const Seg = ({ options, value, onChange, ariaLabel }) => (
  <div className="seg" role="group" aria-label={ariaLabel}>
    {options.map((o) => (
      <button key={o.value} type="button" aria-pressed={value === o.value}
              onClick={() => onChange(o.value)}>{o.label}</button>
    ))}
  </div>
);

export const Back = ({ onClick, children = 'Back' }) => (
  <button type="button" className="btn btn-ghost btn-sm" onClick={onClick}>&larr; {children}</button>
);

export const Empty = ({ children }) => (
  <div className="callout center dim small">{children}</div>
);

// A topic's accent colours are exposed as CSS variables on this wrapper, so
// no component below it needs to know which topic it is rendering.
export const TopicTheme = ({ topic, children, style, ...rest }) => (
  <div
    style={{
      '--accent': topic.accent,
      '--accent-deep': topic.accentDeep,
      '--accent-soft': topic.accentSoft,
      '--accent-tint': topic.accentTint,
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);
