import React, { useMemo, useState } from 'react';
import { Card, Bar, Back, Badge } from './ui.jsx';
import { pickNext, dueCount } from '../lib/deck.js';
import { cardMastery, pct, MAX_BOX, touchStreak } from '../lib/storage.js';

export default function Flashcards({ topic, cards, state, setState, onBack }) {
  const [current, setCurrent] = useState(() => pickNext(cards, state, null));
  const [flipped, setFlipped] = useState(false);
  const [session, setSession] = useState({ got: 0, again: 0 });

  const mastery = useMemo(() => cardMastery(state, cards.map((c) => c.id)), [state, cards]);
  const remaining = dueCount(cards, state);

  if (!current) return null;

  const record = (gotIt) => {
    setState((prev) => {
      const rec = prev.cards[current.id] || { box: 0, seen: 0, again: 0 };
      const box = gotIt ? Math.min((rec.box || 0) + 1, MAX_BOX) : 0;
      const next = {
        ...prev,
        cards: {
          ...prev.cards,
          [current.id]: { box, seen: (rec.seen || 0) + 1, again: (rec.again || 0) + (gotIt ? 0 : 1) },
        },
      };
      return touchStreak(next);
    });
    setSession((s) => ({ got: s.got + (gotIt ? 1 : 0), again: s.again + (gotIt ? 0 : 1) }));
    setFlipped(false);
    setCurrent((c) => pickNext(cards, state, c.id));
  };

  const box = state.cards[current.id]?.box ?? 0;

  return (
    <div className="stack">
      <div className="row-between">
        <Back onClick={onBack}>{topic.short}</Back>
        <div className="row">
          <Badge tone="neutral">{remaining} left to master</Badge>
          <Badge>{pct(mastery)}% deck mastery</Badge>
        </div>
      </div>

      <Bar value={mastery} />

      <div
        className="flashcard"
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Card back. Press to flip to the front.' : 'Card front. Press to reveal the answer.'}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped((f) => !f); }
        }}
      >
        <span className="eyebrow" style={{ color: 'var(--accent-deep)' }}>
          {flipped ? 'Answer' : 'Question'}
          {box > 0 && !flipped ? ` · seen ${state.cards[current.id]?.seen || 0}x` : ''}
        </span>
        {flipped ? (
          <>
            <div className="small dim" style={{ marginBottom: 2 }}>{current.front}</div>
            <div className="face-back">{current.back}</div>
          </>
        ) : (
          <div className="face-front">{current.front}</div>
        )}
        {current.supplementary && (
          <span className="note-supp">Student-sourced supplementary material, not department notes</span>
        )}
        {!flipped && <span className="tiny dim">Tap the card, or press Enter, to reveal</span>}
      </div>

      {flipped ? (
        <div className="grid-2">
          <button type="button" className="btn btn-block" onClick={() => record(false)}>
            Review again
          </button>
          <button type="button" className="btn btn-primary btn-block" onClick={() => record(true)}>
            Got it
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn-soft btn-block" onClick={() => setFlipped(true)}>
          Reveal answer
        </button>
      )}

      <Card tight className="card-flat">
        <div className="row-between small muted">
          <span>This session: {session.got} got it, {session.again} to review</span>
          <span className="tiny dim">Cards you mark &ldquo;review again&rdquo; come back far more often.</span>
        </div>
      </Card>
    </div>
  );
}
