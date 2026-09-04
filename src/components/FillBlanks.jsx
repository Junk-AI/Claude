import React, { useMemo, useState } from 'react';
import { Card, Bar, Back, Badge } from './ui.jsx';
import { shuffle } from '../lib/deck.js';
import { blankMastery, pct, touchStreak } from '../lib/storage.js';

const clean = (s) => (s || '').toLowerCase().trim()
  .replace(/[$%,.]/g, '').replace(/\s+/g, ' ');

const matches = (input, answers) => {
  const v = clean(input);
  if (!v) return false;
  return answers.some((a) => clean(a) === v);
};

export default function FillBlanks({ topic, items, state, setState, onBack }) {
  const [order] = useState(() => shuffle(items.map((i) => i.id)));
  const [idx, setIdx] = useState(0);
  const [values, setValues] = useState({});
  const [checked, setChecked] = useState(false);

  const mastery = useMemo(() => blankMastery(state, items.map((i) => i.id)), [state, items]);
  const item = items.find((i) => i.id === order[idx]);
  if (!item) return null;

  const parts = item.text.split('___');
  const results = item.blanks.map((b, i) => matches(values[i], b.answers));
  const allRight = results.every(Boolean);

  const check = () => {
    setChecked(true);
    setState((prev) => {
      const rec = prev.blanks[item.id] || { correct: false, attempts: 0 };
      return touchStreak({
        ...prev,
        blanks: {
          ...prev.blanks,
          [item.id]: { correct: rec.correct || allRight, attempts: (rec.attempts || 0) + 1 },
        },
      });
    });
  };

  const next = () => {
    setChecked(false);
    setValues({});
    setIdx((i) => (i + 1) % order.length);
  };

  const retry = () => {
    setChecked(false);
    setValues((v) => {
      const kept = {};
      results.forEach((ok, i) => { if (ok) kept[i] = v[i]; });
      return kept;
    });
  };

  return (
    <div className="stack">
      <div className="row-between">
        <Back onClick={onBack}>{topic.short}</Back>
        <div className="row">
          <Badge tone="neutral">{idx + 1} of {order.length}</Badge>
          <Badge>{pct(mastery)}% complete</Badge>
        </div>
      </div>

      <Bar value={mastery} />

      <Card>
        <span className="eyebrow" style={{ color: 'var(--accent-deep)' }}>Fill the blanks</span>
        <p style={{ fontSize: '1.02rem', lineHeight: 2.4, marginTop: 10 }}>
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i < item.blanks.length && (
                <input
                  type="text"
                  className={`blank-input${checked ? (results[i] ? ' ok' : ' no') : ''}`}
                  value={values[i] || ''}
                  aria-label={`Blank ${i + 1}${item.blanks[i].hint ? `, ${item.blanks[i].hint}` : ''}`}
                  placeholder={item.blanks[i].hint || ''}
                  disabled={checked && results[i]}
                  onChange={(e) => setValues((v) => ({ ...v, [i]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !checked) check(); }}
                />
              )}
            </React.Fragment>
          ))}
        </p>

        {checked && (
          <div className={`callout ${allRight ? 'callout-good' : 'callout-warn'}`} style={{ marginTop: 14 }}>
            {allRight ? (
              <strong className="small">Correct.</strong>
            ) : (
              <div className="small">
                <strong>Not quite.</strong>{' '}
                {results.filter(Boolean).length} of {results.length} right.
                <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                  {results.map((ok, i) => ok ? null : (
                    <li key={i}>Blank {i + 1}: <strong>{item.blanks[i].answers[0]}</strong></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="row" style={{ marginTop: 16 }}>
          {!checked && (
            <button type="button" className="btn btn-primary"
                    disabled={item.blanks.some((_, i) => !values[i])} onClick={check}>
              Check
            </button>
          )}
          {checked && !allRight && (
            <button type="button" className="btn" onClick={retry}>Try again</button>
          )}
          {checked && (
            <button type="button" className="btn btn-primary" onClick={next}>Next sentence</button>
          )}
          {!checked && <button type="button" className="btn btn-ghost" onClick={next}>Skip</button>}
        </div>
      </Card>
    </div>
  );
}
