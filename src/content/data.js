// ---------------------------------------------------------------------------
// GEO REVISE - CONTENT ENTRY POINT
//
// This is the only file components import content from. All seed material
// lives in this folder and can be edited without touching any component:
//
//   topics.js      topic names and accent colours
//   population.js  Topic 1 glossary, flashcards, blanks, drag-and-drop
//   housing.js     Topic 2 ditto
//   transport.js   Topic 3 ditto
//   datasets.js    the real DRQ chart data
//   questions.js   the exam question bank and its mark schemes
//   reference.js   GSE method, trend vocabulary, level descriptors,
//                  the examiner framework
// ---------------------------------------------------------------------------

import * as population from './population.js';
import * as housing from './housing.js';
import * as transport from './transport.js';

export { TOPICS, topicById } from './topics.js';
export { DATASETS, DESCRIBED_STIMULI } from './datasets.js';
export {
  QUESTIONS, questionsByTopic, questionById,
  EXAM_PAPERS, EXAM_INSTRUCTIONS, PLACE_TERMS,
} from './questions.js';
export {
  GSE_METHOD, TREND_VERBS, TREND_ADJECTIVES, ESSAY_STRUCTURE,
  LEVEL_DESCRIPTORS, EXAMINER_FRAMEWORK, EXAMINER_TRAPS,
} from './reference.js';

export const TOPIC_CONTENT = { population, housing, transport };

export const contentFor = (topicId) => TOPIC_CONTENT[topicId];
