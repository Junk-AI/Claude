import React, { useMemo, useState } from 'react';
import { Card, Bar, Back, Badge } from './ui.jsx';
import { shuffle } from '../lib/deck.js';
import { dragMastery, pct, touchStreak } from '../lib/storage.js';

// One component covers all three drag-and-drop kinds, because each is really
// "put every token on the right target". Only the target list differs.
//
// Every interaction works by tapping as well as dragging: tap a token to pick
// it up, tap a target to drop it. That keeps it usable on a phone and with a
// keyboard, where HTML5 drag events do not fire.

function buildBoard(set) {
  if (set.type === 'match') {
    return {
      layout: 'rows',
      targets: set.pairs.map((p, i) => ({ id: `t${i}`, label: p.left })),
      tokens: shuffle(set.pairs.map((p, i) => ({ id: `k${i}`, text: p.right, correct: `t${i}` }))),
    };
  }
  if (set.type === 'categorise') {
    return {
      layout: 'columns',
      targets: set.categories.map((c) => ({ id: c.id, label: c.label })),
      tokens: shuffle(set.items.map((it, i) => ({ id: `k${i}`, text: it.text, correct: it.category }))),
    };
  }
  // sequence
  return {
    layout: 'rows',
    targets: set.items.map((_, i) => ({ id: `s${i}`, label: `${i + 1}` })),
    tokens: shuffle(set.items.map((text, i) => ({ id: `k${i}`, text, correct: `s${i}` }))),
  };
}

export default function DragDrop({ topic, sets, state, setState, onBack }) {
  const [setIdx, setSetIdx] = useState(0);
  const set = sets[setIdx];
  const [board, setBoard] = useState(() => buildBoard(set));
  const [placed, setPlaced] = useState({});   // tokenId -> targetId
  const [held, setHeld] = useState(null);     // tokenId picked up by tapping
  const [over, setOver] = useState(null);
  const [checked, setChecked] = useState(false);

  const mastery = useMemo(() => dragMastery(state, sets.map((s) => s.id)), [state, sets]);

  const restart = (i) => {
    setSetIdx(i);
    setBoard(buildBoard(sets[i]));
    setPlaced({});
    setHeld(null);
    setChecked(false);
  };

  const pool = board.tokens.filter((t) => !placed[t.id]);
  const inTarget = (targetId) => board.tokens.filter((t) => placed[t.id] === targetId);
  const singleSlot = set.type !== 'categorise';

  const place = (tokenId, targetId) => {
    if (checked) return;
    setPlaced((p) => {
      const next = { ...p };
      if (singleSlot) {
        // One token per target: whatever was there goes back to the pool.
        Object.keys(next).forEach((k) => { if (next[k] === targetId) delete next[k]; });
      }
      next[tokenId] = targetId;
      return next;
    });
    setHeld(null);
    setOver(null);
  };

  const unplace = (tokenId) => {
    if (checked) return;
    setPlaced((p) => { const n = { ...p }; delete n[tokenId]; return n; });
  };

  const allPlaced = pool.length === 0;
  const correctCount = board.tokens.filter((t) => placed[t.id] === t.correct).length;
  const score = board.tokens.length ? correctCount / board.tokens.length : 0;

  const check = () => {
    setChecked(true);
    setState((prev) => {
      const rec = prev.drags[set.id] || { best: 0, plays: 0 };
      return touchStreak({
        ...prev,
        drags: { ...prev.drags, [set.id]: { best: Math.max(rec.best || 0, score), plays: (rec.plays || 0) + 1 } },
      });
    });
  };

  const tokenClass = (t) => {
    if (!checked) return 'chip';
    return `chip ${placed[t.id] === t.correct ? 'ok' : 'no'}`;
  };

  const Token = ({ t, inPool }) => (
    <span
      className={inPool && held === t.id ? 'chip' : tokenClass(t)}
      aria-pressed={held === t.id}
      role="button"
      tabIndex={0}
      draggable={!checked}
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.id); setHeld(t.id); }}
      onDragEnd={() => setHeld(null)}
      onClick={() => (inPool ? setHeld(held === t.id ? null : t.id) : unplace(t.id))}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inPool ? setHeld(held === t.id ? null : t.id) : unplace(t.id);
        }
      }}
    >
      {t.text}
      {checked && placed[t.id] !== t.correct && (
        <em className="tiny" style={{ display: 'block', color: 'var(--ink-2)', fontStyle: 'normal' }}>
          &rarr; {board.targets.find((x) => x.id === t.correct)?.label}
        </em>
      )}
    </span>
  );

  const Zone = ({ target, children, style }) => (
    <div
      className={`dropzone${over === target.id ? ' over' : ''}${inTarget(target.id).length ? ' filled' : ''}`}
      style={style}
      onDragOver={(e) => { e.preventDefault(); setOver(target.id); }}
      onDragLeave={() => setOver(null)}
      onDrop={(e) => { e.preventDefault(); place(e.dataTransfer.getData('text/plain'), target.id); }}
      onClick={() => held && place(held, target.id)}
      role={held ? 'button' : undefined}
      aria-label={held ? `Place here: ${target.label}` : undefined}
    >
      {children}
      {!inTarget(target.id).length && (
        <span className="tiny dim" style={{ alignSelf: 'center' }}>
          {held ? 'Tap to place here' : 'Drop here'}
        </span>
      )}
    </div>
  );

  return (
    <div className="stack">
      <div className="row-between">
        <Back onClick={onBack}>{topic.short}</Back>
        <Badge>{pct(mastery)}% across {sets.length} sets</Badge>
      </div>

      <Bar value={mastery} />

      <div className="row">
        {sets.map((s, i) => (
          <button key={s.id} type="button"
                  className={`btn btn-sm${i === setIdx ? ' btn-soft' : ''}`}
                  onClick={() => restart(i)}>
            {s.title}
            {state.drags[s.id]?.best === 1 ? ' ✓' : ''}
          </button>
        ))}
      </div>

      <Card>
        <span className="eyebrow" style={{ color: 'var(--accent-deep)' }}>
          {set.type === 'match' ? 'Matching' : set.type === 'sequence' ? 'Sequencing' : 'Categorising'}
        </span>
        <h3 style={{ marginTop: 6 }}>{set.title}</h3>
        <p className="small muted">{set.prompt}</p>

        <div style={{ margin: '16px 0' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            Cards {held ? '· one picked up, now tap a target' : `· ${pool.length} left`}
          </div>
          <div className="pool" style={{ minHeight: 44 }}>
            {pool.length
              ? pool.map((t) => <Token key={t.id} t={t} inPool />)
              : <span className="tiny dim">All placed.</span>}
          </div>
        </div>

        {board.layout === 'columns' ? (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(board.targets.length, 3)}, 1fr)`, gap: 12 }}>
            {board.targets.map((target) => (
              <div key={target.id}>
                <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>{target.label}</div>
                <Zone target={target} style={{ minHeight: 120, flexDirection: 'column' }}>
                  {inTarget(target.id).map((t) => <Token key={t.id} t={t} />)}
                </Zone>
              </div>
            ))}
          </div>
        ) : (
          <div className="stack" style={{ gap: 8 }}>
            {board.targets.map((target) => (
              <div key={target.id} style={{ display: 'grid', gridTemplateColumns: set.type === 'sequence' ? '38px 1fr' : 'minmax(120px, 1fr) 1.3fr', gap: 10, alignItems: 'stretch' }}>
                <div className="small" style={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  {target.label}
                </div>
                <Zone target={target}>
                  {inTarget(target.id).map((t) => <Token key={t.id} t={t} />)}
                </Zone>
              </div>
            ))}
          </div>
        )}

        <div className="row" style={{ marginTop: 18 }}>
          {!checked
            ? <button type="button" className="btn btn-primary" disabled={!allPlaced} onClick={check}>
                Check answers
              </button>
            : <>
                <Badge tone={score === 1 ? 'good' : score >= 0.6 ? 'warn' : 'bad'}>
                  {correctCount} of {board.tokens.length} correct
                </Badge>
                <button type="button" className="btn" onClick={() => restart(setIdx)}>Try again</button>
                {setIdx < sets.length - 1 && (
                  <button type="button" className="btn btn-primary" onClick={() => restart(setIdx + 1)}>Next set</button>
                )}
              </>}
          {!allPlaced && !checked && <span className="tiny dim">Place every card to check.</span>}
        </div>
      </Card>
    </div>
  );
}
