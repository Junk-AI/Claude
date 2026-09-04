// Weighted resurfacing for flashcards.
//
// A card sits in a box from 0 (never got it, or marked "review again") up to
// MAX_BOX. Lower boxes are drawn far more often, so cards the student keeps
// missing keep coming back, while mastered cards appear occasionally.

import { MAX_BOX } from './storage.js';

const weightFor = (box) => [8, 4, 2, 1][Math.min(box, MAX_BOX)];

export function pickNext(cards, state, exclude) {
  const pool = cards.filter((c) => c.id !== exclude);
  if (!pool.length) return cards[0] || null;

  const weighted = pool.map((c) => {
    const rec = state.cards[c.id];
    // Never-seen cards go first, in order, so the deck is worked through once.
    const box = rec ? Math.min(rec.box || 0, MAX_BOX) : -1;
    return { card: c, weight: box === -1 ? 40 : weightFor(box) };
  });

  const unseen = weighted.filter((w) => w.weight === 40);
  if (unseen.length) return unseen[0].card;

  const total = weighted.reduce((a, w) => a + w.weight, 0);
  let r = Math.random() * total;
  for (const w of weighted) {
    r -= w.weight;
    if (r <= 0) return w.card;
  }
  return weighted[weighted.length - 1].card;
}

export const dueCount = (cards, state) =>
  cards.filter((c) => (state.cards[c.id]?.box ?? 0) < MAX_BOX).length;

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
