// Small text helpers shared by the marker.

export const lower = (s) => (s || '').toLowerCase();

export const normalise = (s) =>
  lower(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ');

export const sentences = (s) =>
  normalise(s)
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((x) => x.trim())
    .filter((x) => x.length > 2);

export const wordCount = (s) => normalise(s).split(/\s+/).filter(Boolean).length;

// Numbers, with thousands separators and decimals preserved.
// "39,400" -> 39400 ; "5.93 million" -> 5.93 ; "16.7%" -> 16.7
export const numbersIn = (s) => {
  const out = [];
  const re = /-?\d{1,3}(?:,\d{3})+(?:\.\d+)?|-?\d+(?:\.\d+)?/g;
  let m;
  while ((m = re.exec(normalise(s))) !== null) {
    const v = parseFloat(m[0].replace(/,/g, ''));
    if (!Number.isNaN(v)) out.push(v);
  }
  return out;
};

export const has = (text, terms) => terms.some((t) => normalise(text).includes(normalise(t)));

export const hits = (text, terms) => {
  const t = normalise(text);
  return terms.filter((term) => t.includes(normalise(term)));
};

export const LINK_WORDS = [
  'because', 'therefore', 'as a result', 'this leads', 'leads to', 'so that',
  'which means', 'this means', 'resulting in', 'consequently', 'hence', 'thus',
  'this causes', 'causes', 'so ', 'since ', 'in turn', 'meaning that',
  'results in', 'lead to', 'this is why', 'which is why', 'due to',
];

export const COMPARE_WORDS = [
  'whereas', 'however', 'on the other hand', 'in contrast', 'compared',
  'unlike', 'but ', 'while ', 'more than', 'less than', 'greater than',
  'more effective', 'less effective', 'more serious', 'more important',
];

export const LIMIT_WORDS = [
  'however', 'limitation', 'disadvantage', 'drawback', 'weakness', 'but ',
  'although', 'nevertheless', 'on the other hand', 'criticism', 'fails to',
  'does not', 'cannot', 'downside', 'costly', 'expensive',
];

export const BENEFIT_WORDS = [
  'advantage', 'strength', 'benefit', 'effective', 'successful', 'improves',
  'reduces', 'increases access', 'works well', 'helps',
];

export const STANCE_WORDS = [
  'to a large extent', 'to a limited extent', 'to a small extent',
  'to a great extent', 'to a certain extent', 'to some extent',
  'i agree', 'i disagree', 'i do not agree', 'agree to', 'strongly agree',
  'i believe', 'in my opinion', 'i think that', 'largely agree', 'only to',
];

export const SUPERLATIVES = [
  'sharpest', 'steepest', 'greatest', 'biggest', 'largest', 'most rapid',
  'fastest', 'highest', 'most dramatic', 'most significant', 'peak',
];

export const RISE_WORDS = ['increas', 'rise', 'rose', 'rising', 'grew', 'growth', 'grow', 'climb', 'went up', 'upward'];
export const FALL_WORDS = ['decreas', 'decline', 'declin', 'fall', 'fell', 'drop', 'plummet', 'plunge', 'reduc', 'went down', 'downward', 'shrank', 'shrink'];
export const FLAT_WORDS = ['no change', 'remain', 'constant', 'stagnat', 'unchanged', 'plateau', 'stable', 'same'];
