// ---------------------------------------------------------------------------
// THE MARKER
//
// This is a deterministic rubric engine. It marks against the specific mark
// scheme attached to each question in content/questions.js - GSE for DRQs,
// point-and-example schemes for short answers, the L1/L2/L3 descriptors for
// essays - and never against a generic rubric. For DRQs it cross-checks every
// figure the student quotes against the real seeded dataset.
//
// It runs entirely in the browser. It reads what a student wrote for the
// things the mark scheme actually rewards; it is not a language model and
// cannot judge an unusual but valid phrasing the way a teacher would. Treat
// a mark from it as a structured self-check, not as a final grade.
// ---------------------------------------------------------------------------

import {
  normalise, sentences, wordCount, numbersIn, hits,
  LINK_WORDS, COMPARE_WORDS, LIMIT_WORDS, BENEFIT_WORDS, STANCE_WORDS,
  SUPERLATIVES, RISE_WORDS, FALL_WORDS, FLAT_WORDS,
} from './text.js';
import { DATASETS, PLACE_TERMS, EXAMINER_TRAPS } from '../content/data.js';

const anyIn = (text, terms) => terms.some((t) => text.includes(t));

// --- dataset analysis ------------------------------------------------------

export function analyseSeries(datasetId, seriesName) {
  const ds = DATASETS[datasetId];
  if (!ds) return null;
  const series = ds.series.find((s) => s.name === seriesName) || ds.series[0];
  const all = series.points;
  const known = all.filter((p) => p.y !== null && p.y !== undefined);
  if (known.length < 2) return null;

  const first = known[0];
  const last = known[known.length - 1];
  const dir = last.y > first.y ? 'up' : last.y < first.y ? 'down' : 'flat';

  const segments = [];
  for (let i = 0; i < known.length - 1; i++) {
    const a = known[i];
    const b = known[i + 1];
    const ia = all.indexOf(a);
    const ib = all.indexOf(b);
    const bridged = ib - ia > 1; // there were null years in between
    const dy = b.y - a.y;
    segments.push({
      x0: a.x, x1: b.x, y0: a.y, y1: b.y, dy,
      rate: dy / (b.x - a.x),
      dir: dy > 0 ? 'up' : dy < 0 ? 'down' : 'flat',
      bridged,
      approx: !!(a.approx || b.approx || ds.approxAll),
    });
  }

  // Ranked by rate per year, so a segment spanning years the source did not
  // supply is compared fairly against a single-year one.
  const byRate = [...segments].sort((a, b) => Math.abs(b.rate) - Math.abs(a.rate));
  const steepest = byRate.slice(0, 2);
  const exceptions = segments.filter((s) => s.dir !== dir);

  return {
    dataset: ds, series, all, known, first, last, dir, segments,
    steepest, exceptions,
    xs: all.map((p) => p.x),
    ys: known.map((p) => p.y),
    approx: !!ds.approxAll,
  };
}

const valueClose = (v, target, approx) => {
  if (target === null || target === undefined) return false;
  const tol = approx
    ? Math.max(Math.abs(target) * 0.12, 1)
    : Math.max(Math.abs(target) * 0.03, 0.06);
  const candidates = [v, v / 1e6, v * 1e6, v / 1e3, v * 1e3];
  return candidates.some((c) => Math.abs(c - target) <= tol);
};

// --- per-sentence parsing --------------------------------------------------

function parseSentence(text, analysis) {
  const t = normalise(text);
  const nums = numbersIn(t);
  const xs = analysis ? new Set(analysis.xs) : new Set();
  const years = nums.filter((n) => xs.has(n));
  // A short year suffix such as "2014 to 15" is not parsed; that is fine.
  const values = nums.filter((n) => !xs.has(n));
  return {
    text: t,
    nums, years, values,
    rise: anyIn(t, RISE_WORDS),
    fall: anyIn(t, FALL_WORDS),
    flat: anyIn(t, FLAT_WORDS),
    superlative: anyIn(t, SUPERLATIVES) || anyIn(t, ['sharp', 'dramatic', 'rapid', 'steep']),
    general: anyIn(t, ['overall', 'general', 'on the whole', 'in general']),
  };
}

const sentDir = (s) => (s.flat && !s.rise && !s.fall ? 'flat' : s.rise && !s.fall ? 'up' : s.fall && !s.rise ? 'down' : s.rise && s.fall ? 'mixed' : null);

const matchesValue = (s, target, approx) => s.values.some((v) => valueClose(v, target, approx)) || s.nums.some((v) => valueClose(v, target, approx));

// --- DRQ / GSE marking -----------------------------------------------------

function markGSE(answer, cfg, question) {
  const analysis = analyseSeries(cfg.dataset, cfg.series);
  const compare = cfg.compareSeries ? analyseSeries(cfg.dataset, cfg.compareSeries) : null;
  const max = cfg.marksOverride || question.marks;
  const sents = sentences(answer).map((s) => parseSentence(s, analysis));
  const breakdown = [];

  if (!analysis) {
    return { awarded: 0, max, breakdown: [], notes: ['This question has no seeded dataset to mark against.'] };
  }

  const approx = analysis.approx;
  // On a comparison question a value quoted from either series is valid evidence.
  const valuePool = compare ? [...analysis.ys, ...compare.ys] : analysis.ys;
  const hasAnyValue = (s, targets) => targets.some((y) => matchesValue(s, y, approx));

  // G - general trend, with period and evidence
  const gSent = sents.find((s) => {
    if (sentDir(s) !== analysis.dir && sentDir(s) !== 'mixed') return false;
    const periodOk = s.general || (s.years.includes(analysis.first.x) && s.years.includes(analysis.last.x));
    const endpoints = compare
      ? [analysis.first.y, analysis.last.y, compare.first.y, compare.last.y]
      : [analysis.first.y, analysis.last.y];
    const evidenceOk = hasAnyValue(s, endpoints);
    return periodOk && evidenceOk;
  });
  const gPartial = sents.find((s) => sentDir(s) === analysis.dir);
  breakdown.push({
    id: 'G', label: 'General trend: overall direction across the whole period, with the period stated and start or end values quoted.',
    earned: !!gSent,
    detail: gSent
      ? `Awarded. Overall the data ${analysis.dir === 'up' ? 'increases' : analysis.dir === 'down' ? 'decreases' : 'stays level'} from ${analysis.first.y} (${analysis.first.x}) to ${analysis.last.y} (${analysis.last.x}).`
      : gPartial
        ? `Not awarded. The direction is right, but the mark needs the period (${analysis.first.x} to ${analysis.last.x}) and at least one quoted value (${analysis.first.y} or ${analysis.last.y}).`
        : `Not awarded. The overall trend is ${analysis.dir === 'up' ? 'an increase' : analysis.dir === 'down' ? 'a decrease' : 'no change'} from ${analysis.first.y} in ${analysis.first.x} to ${analysis.last.y} in ${analysis.last.x}.`,
  });

  // S - specific / steepest feature
  const steepDesc = analysis.steepest
    .map((s) => `${s.x0}-${s.x1} (${s.y0} to ${s.y1})`).join(' or ');
  const sSent = sents.find((s) => {
    if (!s.superlative) return false;
    const segs = compare ? [...analysis.steepest, ...compare.steepest] : analysis.steepest;
    return segs.some((seg) => {
      const yearsOk = s.years.includes(seg.x0) && s.years.includes(seg.x1);
      // A wider span is accepted if it brackets the steepest segment and is not
      // simply a restatement of the whole period.
      const lo = Math.min(...s.years, Infinity);
      const hi = Math.max(...s.years, -Infinity);
      const bracketsOk = s.years.length >= 2 && lo <= seg.x0 && hi >= seg.x1
        && !(lo === analysis.first.x && hi === analysis.last.x);
      const valsOk = matchesValue(s, seg.y0, approx) && matchesValue(s, seg.y1, approx);
      return yearsOk || bracketsOk || valsOk;
    });
  });
  const sWrongPeriod = sents.find((s) => s.superlative && s.years.length >= 2);
  breakdown.push({
    id: 'S', label: 'Specific feature: the sharpest change, with its period and values quoted.',
    earned: !!sSent,
    detail: sSent
      ? `Awarded. The steepest change is ${analysis.steepest[0].x0}-${analysis.steepest[0].x1}.`
      : sWrongPeriod
        ? `Not awarded. A sharpest change was claimed for the wrong period. In this data the steepest change is ${steepDesc}.`
        : `Not awarded. Identify the steepest change: ${steepDesc}, and use a trend adjective such as "sharpest".`,
  });

  // E - exception
  const exDesc = analysis.exceptions.length
    ? analysis.exceptions.map((s) => `${s.x0}-${s.x1} (${s.y0} to ${s.y1}, ${s.dir === 'flat' ? 'no change' : s.dir === 'up' ? 'an increase' : 'a decrease'})`).join('; ')
    : 'there is no segment against the general trend, so quote the gentlest change instead';
  const usedYears = new Set([...(gSent?.years || []), ...(sSent?.years || [])]);
  const eSent = sents.find((s) => {
    if (s === gSent || s === sSent) return false;
    if (analysis.exceptions.length) {
      return analysis.exceptions.some((seg) => {
        const yearsOk = s.years.includes(seg.x0) && s.years.includes(seg.x1);
        const dirOk = sentDir(s) === seg.dir || (seg.dir === 'flat' && s.flat);
        const valsOk = matchesValue(s, seg.y0, approx) || matchesValue(s, seg.y1, approx);
        return yearsOk && dirOk && valsOk;
      });
    }
    // Monotonic data: accept any additional correctly evidenced sub-period,
    // e.g. the gentlest change or a slower stretch of growth.
    return s.years.length >= 2 && s.years.some((y) => !usedYears.has(y)) && hasAnyValue(s, valuePool);
  });
  breakdown.push({
    id: 'E', label: 'Exception: the part that goes against the general trend, or a period of no change, with values quoted.',
    earned: !!eSent,
    detail: eSent ? 'Awarded.' : `Not awarded. In this data, ${exDesc}.`,
  });

  // Comparison questions need both places named and an explicit comparison.
  const notes = [];
  if (compare) {
    const t = normalise(answer);
    const bothNamed = t.includes(normalise(analysis.series.name)) && t.includes(normalise(compare.series.name));
    const comparative = anyIn(t, COMPARE_WORDS) || anyIn(t, ['both', 'greater', 'higher than', 'lower than']);
    if (!bothNamed) notes.push(`This is a comparison question: name both ${analysis.series.name} and ${compare.series.name} explicitly.`);
    if (!comparative) notes.push('No comparative language found. Use "whereas", "while", "both" or "a greater decrease than" so the comparison is explicit.');
    if (!bothNamed || !comparative) {
      // A comparison answer that never compares cannot reach full marks.
      breakdown.forEach((b) => { if (b.id === 'S' && b.earned) { b.earned = false; b.detail = 'Withheld: the comparison itself was not made explicit.'; } });
    }
  }

  // Cross-check every figure quoted against the real data.
  const allNums = numbersIn(answer);
  const xs = new Set(analysis.xs);
  const misquoted = allNums.filter((n) => {
    if (xs.has(n)) return false;               // it is a year
    if (n >= 1900 && n <= 2100) return false;  // plausibly a year outside the series
    if (n <= 100 && analysis.dataset.unit !== '%' && n % 1 === 0 && n < 20) return false; // small counting numbers
    if (valuePool.some((y) => valueClose(n, y, approx))) return false;
    // A calculated difference between two plotted values is legitimate evidence
    // ("a fall of 18.3 percentage points"), so it must not be flagged.
    for (const a of valuePool) {
      for (const b of valuePool) {
        if (a !== b && valueClose(n, Math.abs(a - b), approx)) return false;
      }
    }
    return true;
  });
  if (misquoted.length) {
    notes.push(`Figures that do not match the data: ${misquoted.join(', ')}. Read values off the chart carefully - quoting a wrong number loses the evidence mark.`);
  }

  const raw = breakdown.filter((b) => b.earned).length;
  return { awarded: Math.min(raw, max), max, breakdown, notes, analysis, misquoted };
}

// --- point-by-point short answers -----------------------------------------

function pointEarned(text, point) {
  const t = normalise(text);
  if (point.all) return point.all.every((group) => group.some((term) => t.includes(normalise(term))));
  if (point.any) return point.any.some((term) => t.includes(normalise(term)));
  return false;
}

function markPoints(answer, cfg) {
  const t = normalise(answer);
  const max = cfg.marks;
  const breakdown = cfg.points.map((p) => ({
    id: p.id, label: p.label, earned: pointEarned(t, p),
    detail: pointEarned(t, p) ? 'Awarded.' : 'Not awarded.',
  }));

  let awarded;
  if (cfg.maxGroups) {
    const groups = {};
    breakdown.forEach((b, i) => {
      const g = cfg.points[i].group || b.id;
      groups[g] = (groups[g] || 0) + (b.earned ? 1 : 0);
    });
    awarded = Object.values(groups).sort((a, b) => b - a).slice(0, cfg.maxGroups).reduce((a, b) => a + b, 0);
  } else {
    awarded = breakdown.filter((b) => b.earned).length;
  }

  const notes = [];
  if (cfg.requiresComparative && !anyIn(t, COMPARE_WORDS)) {
    notes.push('This question asks you to compare. Without a comparative connective such as "whereas" or "in contrast", the difference is only described, not compared.');
    awarded = Math.max(0, awarded - 1);
  }
  if (cfg.requiresEvaluation && !(anyIn(t, BENEFIT_WORDS) && anyIn(t, LIMIT_WORDS))) {
    notes.push('An "evaluate" question needs a genuine strength AND a genuine limitation, judged against a stated criterion. Restating the benefit is not evaluation.');
  }
  return { awarded: Math.min(awarded, max), max, breakdown, notes };
}

// --- "choose N from a list of options" short answers ------------------------

function markOptions(answer, cfg) {
  const t = normalise(answer);
  const max = cfg.marks;
  const perOption = cfg.perOption || 2;
  const scored = cfg.options.map((o) => {
    const identified = o.identify.some((term) => t.includes(normalise(term)));
    const developed = identified && o.develop.some((term) => t.includes(normalise(term)));
    return { ...o, identified, developed, score: (identified ? 1 : 0) + (developed ? 1 : 0) };
  });
  const chosen = [...scored].sort((a, b) => b.score - a.score).slice(0, cfg.maxOptions || 2);
  const awarded = Math.min(chosen.reduce((a, b) => a + b.score, 0), max);

  const breakdown = chosen.map((o) => ({
    id: o.id, label: o.label, weight: `up to ${perOption} marks: 1 to identify, 1 to develop`,
    earned: o.score === perOption,
    partial: o.score > 0 && o.score < perOption,
    detail: o.score === 0
      ? 'Not credited: this option was not used.'
      : o.developed
        ? 'Full credit: identified and developed with the required detail or example.'
        : `Half credit: identified but not developed. ${o.developNote || 'Add the "how" or "why", plus the specific figure or place.'}`,
  }));

  const notes = [];
  const used = scored.filter((o) => o.identified).length;
  if (used < (cfg.maxOptions || 2)) {
    notes.push(`This question needs ${cfg.maxOptions || 2} separate points. Only ${used} could be identified.`);
  }
  return { awarded, max, breakdown, notes };
}

// --- 9-mark essays ---------------------------------------------------------

function markEssay(answer, cfg) {
  const t = normalise(answer);
  const words = wordCount(answer);
  const max = cfg.marks;
  const tail = t.slice(Math.floor(t.length * 0.65)); // roughly the conclusion

  const stance = anyIn(t, STANCE_WORDS);
  const factorsCovered = cfg.factors.map((f) => ({
    ...f, found: hits(t, f.terms), covered: hits(t, f.terms).length > 0,
    developed: hits(t, f.terms).length >= 2,
  }));
  const bothSides = factorsCovered.filter((f) => f.covered).length >= 2;
  const examples = hits(t, [...(cfg.exampleTerms || []), ...PLACE_TERMS]);
  const uniqueExamples = [...new Set(examples)];
  const linked = anyIn(t, LINK_WORDS);
  const compared = anyIn(t, COMPARE_WORDS);
  const criterion = hits(tail, cfg.criteriaTerms || []);
  const hasCriterion = criterion.length > 0;

  let level = 'L0';
  let awarded = 0;
  if (words < 40 || (!stance && !factorsCovered.some((f) => f.covered))) {
    level = 'L0'; awarded = 0;
  } else if (!bothSides || uniqueExamples.length === 0 || !linked) {
    level = 'L1';
    awarded = 1 + (stance ? 1 : 0) + (factorsCovered.some((f) => f.developed) ? 1 : 0);
  } else if (!hasCriterion || !compared || uniqueExamples.length < 2) {
    level = 'L2';
    awarded = 4 + (uniqueExamples.length >= 2 ? 1 : 0) + (compared ? 1 : 0);
  } else {
    level = 'L3';
    awarded = 7
      + (factorsCovered.every((f) => f.developed) ? 1 : 0)
      + (words >= 260 && uniqueExamples.length >= 3 ? 1 : 0);
  }
  awarded = Math.max(0, Math.min(awarded, max));

  const breakdown = [
    { id: 'stand', label: 'A clear stand is stated (e.g. "to a large extent", "to a limited extent").', earned: stance,
      detail: stance ? 'Awarded.' : 'Not found. State your stand in the introduction and hold it to the conclusion.' },
    ...factorsCovered.map((f) => ({
      id: f.id, label: `${f.label} is explained.`, earned: f.covered, partial: f.covered && !f.developed,
      detail: f.covered ? (f.developed ? 'Awarded, with detail.' : 'Mentioned but thin. Develop it with a second supporting point.') : 'Not found.',
    })),
    { id: 'examples', label: 'Place-based examples are used.', earned: uniqueExamples.length >= 2, partial: uniqueExamples.length === 1,
      detail: uniqueExamples.length ? `Found: ${uniqueExamples.slice(0, 6).join(', ')}. ${uniqueExamples.length < 2 ? 'L2 needs a place-based example for each side.' : ''}` : 'No place-based example found. Every body paragraph needs one.' },
    { id: 'chain', label: 'A visible reasoning chain links evidence to outcome.', earned: linked,
      detail: linked ? 'Awarded.' : 'No linking words found ("because", "this leads to", "as a result"). Facts alone stay at L1.' },
    { id: 'twosided', label: 'Two sides are genuinely weighed against each other.', earned: compared && bothSides,
      detail: compared && bothSides ? 'Awarded.' : 'Not awarded. Use "whereas", "however" or "more effective than" to weigh the two sides.' },
    { id: 'criterion', label: 'An explicit geographical criterion (scale, time, cost, suitability) is used in the conclusion.', earned: hasCriterion,
      detail: hasCriterion ? `Awarded: "${criterion.join(', ')}". This is the L3 discriminator.` : 'Not found in the conclusion. This is the single thing separating L2 from L3.' },
  ];

  return { awarded, max, level, breakdown, notes: [], meta: { words, uniqueExamples, criterion, compared, linked, stance, bothSides } };
}

// --- examiner framework ----------------------------------------------------

export function examinerFeedback(answer, question, result) {
  const t = normalise(answer);
  const hit = [];
  const missed = [];
  const traps = [];
  const trap = (id) => EXAMINER_TRAPS.find((x) => x.id === id);

  const commandWord = /to what extent|how far/.test(question.prompt.toLowerCase())
    ? 'to what extent'
    : /evaluate/.test(question.prompt.toLowerCase()) ? 'evaluate'
      : /explain|describe|compare|state/.exec(question.prompt.toLowerCase())?.[0] || 'answer';

  // 1. Question demand
  if (commandWord === 'to what extent' || commandWord === 'evaluate') {
    if (anyIn(t, STANCE_WORDS) || (anyIn(t, BENEFIT_WORDS) && anyIn(t, LIMIT_WORDS))) {
      hit.push(`Addressed the command word "${commandWord}" with a position, not just a description.`);
    } else {
      missed.push(`"${commandWord}" requires a judgement. The answer describes without deciding.`);
    }
  } else if (commandWord === 'compare') {
    anyIn(t, COMPARE_WORDS)
      ? hit.push('Comparative language used, so the two things are actually compared.')
      : missed.push('"Compare" needs comparative connectives, not two separate descriptions.');
  } else if (commandWord === 'describe') {
    numbersIn(t).length >= 2
      ? hit.push('Quoted figures, which is what "describe the trend" rewards.')
      : missed.push('"Describe" a trend means quoting values from the figure, not just naming a direction.');
  }

  // 3. Precise evidence. On a DRQ the command-word check above already says
  // whether figures were quoted, so this would only repeat it.
  const places = [...new Set(hits(t, PLACE_TERMS))];
  const figures = numbersIn(t);
  const isDrq = question.type === 'drq';
  if (!isDrq) {
    if (places.length || figures.length >= 2) {
      hit.push(`Precise evidence used${places.length ? `: ${places.slice(0, 4).join(', ')}` : ''}${figures.length >= 2 ? `${places.length ? ', plus' : ':'} quoted figures` : ''}.`);
    } else {
      missed.push('No specific place or figure. Generic answers cannot reach the top band.');
    }
  } else if (!places.length && figures.length < 2) {
    missed.push('No values quoted from the figure. A trend description without evidence cannot score.');
  }

  // 4. Reasoning chain. Describing a trend does not require one.
  if (!isDrq) {
    anyIn(t, LINK_WORDS)
      ? hit.push('A how/why chain is visible, so evidence is linked to an outcome.')
      : missed.push('Evidence is named but not explained through to a consequence.');
  }

  // 5. Top-band discriminator (higher-mark questions only)
  if (question.marks >= 4 && question.type !== 'drq') {
    if (anyIn(t, COMPARE_WORDS) && (result.meta?.criterion?.length || anyIn(t, ['scale', 'cost', 'time', 'suitab', 'irreversib', 'duration', 'equit', 'afford']))) {
      hit.push('Top-band discriminator hit: an explicit comparison judged against a stated criterion.');
    } else if (anyIn(t, COMPARE_WORDS)) {
      missed.push('Top-band discriminator missed: there is a comparison, but no stated criterion for judging (scale, time, cost, suitability).');
    } else {
      missed.push('Top-band discriminator missed: no comparison, balance or evaluation criterion.');
    }
  }

  // 6. Traps. A DRQ asks the student to describe, so the explanation traps
  // do not apply to one.
  const isDescribe = question.type === 'drq';
  if (!isDescribe && !anyIn(t, LINK_WORDS) && figures.length + places.length > 0) traps.push(trap('no-explanation'));
  if (!isDescribe && places.length) {
    const placeSentences = sentences(t).filter((s) => hits(s, PLACE_TERMS).length);
    const explained = placeSentences.some((s) => anyIn(s, LINK_WORDS) || anyIn(s, ['shows', 'meaning', 'this is because', 'so']));
    if (!explained) traps.push(trap('naked-example'));
  }
  if (!isDescribe && (question.type === 'essay' || question.marks >= 4) && anyIn(t, BENEFIT_WORDS) && !anyIn(t, LIMIT_WORDS)) {
    traps.push(trap('fake-evaluation'));
  }
  const criteriaUsed = [...new Set(hits(t, ['scale', 'cost', 'time', 'suitab', 'equit', 'afford', 'irreversib', 'duration', 'speed']))];
  if (!isDescribe && criteriaUsed.length >= 2 && !anyIn(t, COMPARE_WORDS)) traps.push(trap('shifting-criterion'));

  return { hit, missed, traps: traps.filter(Boolean), commandWord };
}

// --- public entry point ----------------------------------------------------

export function markAnswer(answer, question) {
  const text = (answer || '').trim();
  if (!text) {
    return {
      awarded: 0, max: question.marks, breakdown: [], notes: ['No answer given.'],
      examiner: { hit: [], missed: ['Nothing written.'], traps: [] }, empty: true,
    };
  }
  const cfg = question.marking;
  let result;
  if (cfg.kind === 'gse') result = markGSE(text, cfg, question);
  else if (cfg.kind === 'points') result = markPoints(text, cfg);
  else if (cfg.kind === 'options') result = markOptions(text, cfg);
  else if (cfg.kind === 'essay') result = markEssay(text, cfg);
  else result = { awarded: 0, max: question.marks, breakdown: [], notes: ['No mark scheme attached to this question.'] };

  result.examiner = examinerFeedback(text, question, result);
  result.actions = buildActions(result, question);
  return result;
}

// Two or three short actionable bullets, never a wall of text.
function buildActions(result, question) {
  const out = [];
  const missedPoints = result.breakdown?.filter((b) => !b.earned) || [];
  if (result.level) out.push(`Level ${result.level}. ${result.awarded}/${result.max}.`);
  missedPoints.slice(0, 2).forEach((b) => {
    const stem = b.label.split(':')[0].trim();
    const d = (b.detail || '').replace(/^(Not awarded|Not credited)[.:]\s*/, '');
    out.push(d ? `${stem}: ${d}` : `Missing: ${b.label}`);
  });
  if (result.examiner?.traps?.length) {
    const tr = result.examiner.traps[0];
    out.push(`Trap: ${tr.name}. ${tr.feedback || tr.detail}`);
  }
  if (result.notes?.length) out.push(result.notes[0]);
  if (!out.length) out.push('Full marks. Keep this structure.');
  return out.slice(0, 4);
}
