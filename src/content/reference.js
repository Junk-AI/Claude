// ---------------------------------------------------------------------------
// METHOD AND RUBRIC REFERENCE
// Shown in Learn mode and used by the marker in src/lib/marking.js.
// ---------------------------------------------------------------------------

export const GSE_METHOD = {
  name: 'GSE',
  intro: 'Every trend-description answer needs three sentences. Each sentence is built the same way: Period + Trend + Evidence.',
  parts: [
    { letter: 'G', name: 'General trend', detail: 'The overall direction across the whole period, with the start and end values quoted.' },
    { letter: 'S', name: 'Specific feature', detail: 'The most striking sub-period: usually the sharpest rise or fall, with its values quoted.' },
    { letter: 'E', name: 'Exception', detail: 'The part that goes against the general trend, or a period of no change, with values quoted.' },
  ],
};

export const TREND_VERBS = [
  { word: 'rise, increase', meaning: 'positive change' },
  { word: 'drop, fall, decrease, decline', meaning: 'negative change' },
  { word: 'plummet, plunge', meaning: 'sudden negative change' },
  { word: 'remain constant', meaning: 'no change' },
  { word: 'fluctuate', meaning: 'vary between levels' },
  { word: 'peak', meaning: 'reach the highest point' },
];

export const TREND_ADJECTIVES = [
  { word: 'slight', meaning: 'a very small change' },
  { word: 'sharp', meaning: 'a sudden, large change' },
  { word: 'dramatic', meaning: 'a sudden, very large change' },
  { word: 'steady', meaning: 'an even change' },
  { word: 'gradual', meaning: 'a slow change over a long period' },
];

export const ESSAY_STRUCTURE = [
  { part: 'Introduction', detail: 'Rephrase the question and state a clear stand.' },
  { part: 'Body paragraph 1', detail: 'The given factor or strategy: Point, Explain, Evidence, Link.' },
  { part: 'Body paragraph 2', detail: 'A contrasting factor or strategy: Point, Explain, Evidence, Link.' },
  { part: 'Conclusion', detail: 'Reiterate both, then justify your stand with one or two geographical lines of reasoning: scale, time, cost or suitability.' },
];

export const LEVEL_DESCRIPTORS = [
  { level: 'L1', range: '1-3', detail: 'States a stand and explains the given factor or strategy with some detail. Mainly descriptive.' },
  { level: 'L2', range: '4-6', detail: 'States a stand and explains two factors or strategies, including the given one, with place-based examples. Considers two sides and links back to the question clearly.' },
  { level: 'L3', range: '7-9', detail: 'Meets L2, and develops at least one clear, convincing line of reasoning using a geographical criterion (scale, time, cost or suitability) in the conclusion. Comprehensive understanding and a well-supported judgement.' },
];

export const EXAMINER_FRAMEWORK = [
  { id: 'demand', n: 1, name: 'Question demand', ask: 'Did the answer address the exact command word: state, explain, evaluate, to what extent?' },
  { id: 'argument', n: 2, name: 'Best response or argument', ask: 'Is there one clear strongest line of reasoning or judgement?' },
  { id: 'evidence', n: 3, name: 'Precise evidence', ask: 'Is data from the figure, or a specific geographical example, actually used rather than a vague generalisation?' },
  { id: 'chain', n: 4, name: 'Reasoning chain', ask: 'Is there a visible how or why chain linking evidence to outcome, rather than just naming a fact?' },
  { id: 'discriminator', n: 5, name: 'Top-band discriminator', ask: 'For higher-mark questions: is there comparison, balance, an explicit evaluation criterion, a qualification, or a developed link that lifts the answer above description?' },
  { id: 'trap', n: 6, name: 'Examiner trap avoidance', ask: 'Does the answer fall into any of the common weak-answer patterns below?' },
];

export const EXAMINER_TRAPS = [
  {
    id: 'no-explanation', name: 'Description without explanation',
    detail: 'Saying slums are "poor and dirty" without a consequence chain showing what that leads to.',
    feedback: 'You stated facts but never carried them through to a consequence. Add "which means", "so" or "as a result".',
  },
  {
    id: 'naked-example', name: 'Naming an example without explaining it',
    detail: 'Dropping in "Tengah" or "Nairobi" without saying what the example proves.',
    feedback: 'An example is named but not explained. Say what it proves, not just that it exists.',
  },
  {
    id: 'fake-evaluation', name: 'Fake evaluation',
    detail: 'Restating a benefit and calling it evaluation, instead of weighing a genuine strength against a genuine limitation.',
    feedback: 'A benefit is restated instead of evaluated. Give a real limitation and judge both against one criterion.',
  },
  {
    id: 'shifting-criterion', name: 'Shifting the criterion',
    detail: 'Judging one side on cost and the other on scale, instead of applying one consistent criterion to both.',
    feedback: 'Two different criteria are used without connecting them. Pick one criterion and apply it to both sides.',
  },
];
