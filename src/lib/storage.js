// Progress persistence. Everything lives in one localStorage key so it can be
// cleared, inspected or exported in one go.

const KEY = 'geo-revise-v1';

const EMPTY = {
  cards: {},     // cardId -> { box: 0..3, seen, again }
  blanks: {},    // blankId -> { correct: bool, attempts }
  drags: {},     // setId  -> { best: 0..1, plays }
  tests: {},     // questionId -> { awarded, max, at, level }
  exams: [],     // { paperId, awarded, max, at, minutes, perQuestion: [...] }
  streak: { last: null, count: 0, days: [] },
};

const clone = (o) => JSON.parse(JSON.stringify(o));

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return clone(EMPTY);
    return { ...clone(EMPTY), ...JSON.parse(raw) };
  } catch {
    return clone(EMPTY);
  }
}

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota or private mode */ }
  return state;
}

export function reset() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  return clone(EMPTY);
}

const today = () => new Date().toISOString().slice(0, 10);

export function touchStreak(state) {
  const d = today();
  const s = state.streak || { last: null, count: 0, days: [] };
  if (s.last === d) return state;
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const count = s.last === yesterday ? s.count + 1 : 1;
  const days = [...new Set([...(s.days || []), d])].slice(-90);
  return { ...state, streak: { last: d, count, days } };
}

// --- mastery -------------------------------------------------------------

export const MAX_BOX = 3;

export const cardMastery = (state, ids) => {
  if (!ids.length) return 0;
  const total = ids.reduce((a, id) => a + Math.min(state.cards[id]?.box || 0, MAX_BOX), 0);
  return total / (ids.length * MAX_BOX);
};

export const blankMastery = (state, ids) => {
  if (!ids.length) return 0;
  return ids.filter((id) => state.blanks[id]?.correct).length / ids.length;
};

export const dragMastery = (state, ids) => {
  if (!ids.length) return 0;
  return ids.reduce((a, id) => a + (state.drags[id]?.best || 0), 0) / ids.length;
};

export const testMastery = (state, ids) => {
  const done = ids.filter((id) => state.tests[id]);
  if (!done.length) return null;
  const awarded = done.reduce((a, id) => a + state.tests[id].awarded, 0);
  const max = done.reduce((a, id) => a + state.tests[id].max, 0);
  return max ? awarded / max : 0;
};

// Overall topic mastery. Learn activities carry most of the weight until the
// student has attempted test questions, which then count for a third.
export function topicMastery(state, topic) {
  const cards = cardMastery(state, topic.cardIds);
  const blanks = blankMastery(state, topic.blankIds);
  const drags = dragMastery(state, topic.dragIds);
  const tests = testMastery(state, topic.questionIds);
  if (tests === null) return cards * 0.5 + blanks * 0.28 + drags * 0.22;
  return cards * 0.34 + blanks * 0.19 + drags * 0.14 + tests * 0.33;
}

export const pct = (n) => Math.round((n || 0) * 100);
