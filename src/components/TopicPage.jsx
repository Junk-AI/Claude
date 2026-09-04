import React, { useState } from 'react';
import { Card, Back, Seg, Mastery, Badge } from './ui.jsx';
import Flashcards from './Flashcards.jsx';
import FillBlanks from './FillBlanks.jsx';
import DragDrop from './DragDrop.jsx';
import Reference from './Reference.jsx';
import TestMode from './TestMode.jsx';
import { contentFor, questionsByTopic } from '../content/data.js';
import { cardMastery, blankMastery, dragMastery, testMastery, pct } from '../lib/storage.js';

const ACTIVITIES = [
  { id: 'cards', name: 'Flashcards', blurb: 'Terms, case studies and the figure attached to each one. Cards you miss come back more often.' },
  { id: 'blanks', name: 'Fill in the blanks', blurb: 'The exact figures and place names, taken out of the case-study sentences you need to quote.' },
  { id: 'drag', name: 'Drag and drop', blurb: 'Matching, sequencing and categorising: concept to definition, case study to place, factor to column.' },
  { id: 'ref', name: 'Method and glossary', blurb: 'GSE, trend vocabulary, the essay structure, the level descriptors and the examiner framework.' },
];

export default function TopicPage({ topic, state, setState, onBack, examinerMode, setExaminerMode, initialMode = 'learn' }) {
  const [mode, setMode] = useState(initialMode);
  const [activity, setActivity] = useState(null);
  const content = contentFor(topic.id);
  const questions = questionsByTopic(topic.id);

  const m = {
    cards: cardMastery(state, content.flashcards.map((c) => c.id)),
    blanks: blankMastery(state, content.fillBlanks.map((b) => b.id)),
    drag: dragMastery(state, content.dragDrop.map((d) => d.id)),
    test: testMastery(state, questions.map((q) => q.id)),
  };

  const back = () => setActivity(null);

  if (activity === 'cards') return <Flashcards topic={topic} cards={content.flashcards} state={state} setState={setState} onBack={back} />;
  if (activity === 'blanks') return <FillBlanks topic={topic} items={content.fillBlanks} state={state} setState={setState} onBack={back} />;
  if (activity === 'drag') return <DragDrop topic={topic} sets={content.dragDrop} state={state} setState={setState} onBack={back} />;
  if (activity === 'ref') return <Reference topic={topic} onBack={back} />;

  return (
    <div className="stack">
      <div className="row-between">
        <Back onClick={onBack}>Dashboard</Back>
        <Seg
          ariaLabel="Learn or test"
          value={mode}
          onChange={setMode}
          options={[{ value: 'learn', label: 'Learn' }, { value: 'test', label: 'Test' }]}
        />
      </div>

      <Card>
        <div className="topic-swatch" />
        <h1 style={{ marginTop: 12, marginBottom: 4 }}>{topic.name}</h1>
        <p className="muted small" style={{ marginBottom: 16 }}>{topic.blurb}</p>
        <div className="grid-2" style={{ gap: 18 }}>
          <Mastery value={m.cards} label="flashcards" />
          <Mastery value={m.blanks} label="fill in the blanks" />
          <Mastery value={m.drag} label="drag and drop" />
          <Mastery value={m.test ?? 0} label={m.test === null ? 'test questions (none attempted)' : 'test questions'} />
        </div>
      </Card>

      {mode === 'learn' ? (
        <div className="stack" style={{ gap: 12 }}>
          {ACTIVITIES.map((a) => (
            <Card key={a.id} tight>
              <div className="row-between" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <strong className="small">{a.name}</strong>
                    {a.id !== 'ref' && <Badge>{pct(m[a.id])}%</Badge>}
                  </div>
                  <div className="tiny dim" style={{ marginTop: 2 }}>{a.blurb}</div>
                </div>
                <button type="button" className="btn btn-sm btn-soft" onClick={() => setActivity(a.id)}>
                  {a.id === 'ref' ? 'Open' : 'Practise'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <TestMode
          topic={topic}
          state={state}
          setState={setState}
          onBack={() => setMode('learn')}
          examinerMode={examinerMode}
          setExaminerMode={setExaminerMode}
        />
      )}
    </div>
  );
}
