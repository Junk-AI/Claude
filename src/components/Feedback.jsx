import React from 'react';
import { Card, Badge } from './ui.jsx';

const tone = (a, m) => (a === m ? 'good' : a === 0 ? 'bad' : 'warn');

export function MarkHeader({ result, question }) {
  return (
    <div className="row-between">
      <div className="row">
        <Badge tone={tone(result.awarded, result.max)}>
          {result.awarded} / {result.max} marks
        </Badge>
        {result.level && <Badge tone="neutral">Level {result.level}</Badge>}
      </div>
      <span className="tiny dim">{question.marks}-mark {question.type === 'drq' ? 'DRQ' : question.type === 'essay' ? 'LDQ' : 'short answer'}</span>
    </div>
  );
}

export default function Feedback({ result, question, examinerMode, onToggleExaminer, showModel, onToggleModel }) {
  const { examiner = {} } = result;

  return (
    <div className="stack">
      <Card>
        <MarkHeader result={result} question={question} />

        <hr className="rule" />

        <div className="eyebrow" style={{ marginBottom: 10 }}>What to fix next</div>
        <ul className="checklist">
          {result.actions?.map((a, i) => (
            <li key={i}>
              <span className={`tick ${result.awarded === result.max ? 'yes' : 'half'}`} aria-hidden="true">
                {result.awarded === result.max ? '✓' : '!'}
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ul>

        <hr className="rule" />

        <div className="eyebrow" style={{ marginBottom: 10 }}>Mark scheme, point by point</div>
        <ul className="checklist">
          {result.breakdown?.map((b) => (
            <li key={b.id}>
              <span className={`tick ${b.earned ? 'yes' : b.partial ? 'half' : 'no'}`} aria-hidden="true">
                {b.earned ? '✓' : b.partial ? '~' : '×'}
              </span>
              <span>
                <strong style={{ fontWeight: 580 }}>{b.label}</strong>
                {b.weight && <span className="tiny dim"> ({b.weight})</span>}
                {b.detail && <span className="muted"> {b.detail}</span>}
              </span>
            </li>
          ))}
        </ul>

        {result.notes?.length > 0 && (
          <div className="callout callout-warn small" style={{ marginTop: 14 }}>
            {result.notes.map((n, i) => <div key={i}>{n}</div>)}
          </div>
        )}
      </Card>

      <Card tight>
        <div className="row-between">
          <div>
            <strong className="small">Examiner Mode</strong>
            <div className="tiny dim">The six things an examiner is actually looking for.</div>
          </div>
          <button type="button" className={`btn btn-sm${examinerMode ? ' btn-soft' : ''}`}
                  aria-pressed={examinerMode} onClick={onToggleExaminer}>
            {examinerMode ? 'On' : 'Off'}
          </button>
        </div>

        {examinerMode && (
          <div className="stack" style={{ marginTop: 14 }}>
            <div className="callout callout-accent">
              <div className="eyebrow" style={{ marginBottom: 8 }}>Top-band discriminator</div>
              {examiner.hit?.length > 0 && (
                <ul className="checklist" style={{ marginBottom: examiner.missed?.length ? 10 : 0 }}>
                  {examiner.hit.map((h, i) => (
                    <li key={i}><span className="tick yes" aria-hidden="true">✓</span><span>{h}</span></li>
                  ))}
                </ul>
              )}
              {examiner.missed?.length > 0 && (
                <ul className="checklist">
                  {examiner.missed.map((m, i) => (
                    <li key={i}><span className="tick no" aria-hidden="true">×</span><span>{m}</span></li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`callout ${examiner.traps?.length ? 'callout-warn' : 'callout-good'}`}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Examiner trap</div>
              {examiner.traps?.length ? (
                <ul className="checklist">
                  {examiner.traps.map((t) => (
                    <li key={t.id}>
                      <span className="tick half" aria-hidden="true">!</span>
                      <span><strong style={{ fontWeight: 580 }}>{t.name}.</strong> {t.feedback || t.detail}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="small">None of the common weak-answer patterns were triggered.</span>
              )}
            </div>
          </div>
        )}
      </Card>

      {question.modelAnswer && (
        <Card tight>
          <div className="row-between">
            <strong className="small">Model answer</strong>
            <button type="button" className="btn btn-sm" onClick={onToggleModel}>
              {showModel ? 'Hide' : 'Show'}
            </button>
          </div>
          {showModel && (
            <>
              {(question.studentSourced || question.noOfficialKey || question.guidanceOnly) && (
                <div className="note-supp" style={{ marginTop: 10 }}>
                  {question.noOfficialKey || question.guidanceOnly
                    ? 'No official answer key was supplied for this question. This is structural guidance, not a marked model.'
                    : 'Student-sourced model answer, not an official mark scheme.'}
                </div>
              )}
              <p className="small muted" style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
                {question.modelAnswer}
              </p>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
