import React, { useState } from 'react';
import { Card, Back, Badge, Seg } from './ui.jsx';
import QuestionView from './QuestionView.jsx';
import Feedback from './Feedback.jsx';
import { markAnswer } from '../lib/marking.js';
import { questionsByTopic, GSE_METHOD, LEVEL_DESCRIPTORS } from '../content/data.js';
import { touchStreak } from '../lib/storage.js';

const TYPE_LABEL = { drq: 'DRQ', short: 'Short answer', essay: '9-mark LDQ' };

export default function TestMode({ topic, state, setState, onBack, examinerMode, setExaminerMode }) {
  const all = questionsByTopic(topic.id);
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [showModel, setShowModel] = useState(false);

  const list = filter === 'all' ? all : all.filter((q) => q.type === filter);
  const question = all.find((q) => q.id === openId);

  const open = (q) => {
    setOpenId(q.id);
    setAnswer('');
    setResult(null);
    setShowModel(false);
  };

  const submit = () => {
    const r = markAnswer(answer, question);
    setResult(r);
    setState((prev) => touchStreak({
      ...prev,
      tests: {
        ...prev.tests,
        [question.id]: { awarded: r.awarded, max: r.max, level: r.level || null, at: Date.now() },
      },
    }));
  };

  if (question) {
    return (
      <div className="stack">
        <div className="row-between">
          <Back onClick={() => setOpenId(null)}>All questions</Back>
          <Badge tone="neutral">{TYPE_LABEL[question.type]}</Badge>
        </div>

        <Card>
          <QuestionView question={question} />

          {question.type === 'drq' && !result && (
            <div className="callout callout-accent small" style={{ marginTop: 14 }}>
              <strong>{GSE_METHOD.name}:</strong>{' '}
              {GSE_METHOD.parts.map((p) => `${p.letter} = ${p.name}`).join(' · ')}. {GSE_METHOD.intro}
            </div>
          )}
          {question.type === 'essay' && !result && (
            <div className="callout callout-accent small" style={{ marginTop: 14 }}>
              <strong>Aim for L3 (7-9):</strong> {LEVEL_DESCRIPTORS[2].detail}
            </div>
          )}

          <textarea
            style={{ marginTop: 16 }}
            rows={question.type === 'essay' ? 16 : question.marks >= 5 ? 9 : 6}
            value={answer}
            disabled={!!result}
            placeholder={question.type === 'drq'
              ? 'Write three sentences: general trend, specific feature, exception. Each with a period and quoted values.'
              : question.type === 'essay'
                ? 'Introduction with a clear stand, then two body paragraphs (Point, Explain, Evidence, Link), then a conclusion with a geographical criterion.'
                : 'Write your answer.'}
            onChange={(e) => setAnswer(e.target.value)}
          />

          <div className="row-between" style={{ marginTop: 12 }}>
            <span className="tiny dim">
              {answer.trim() ? `${answer.trim().split(/\s+/).length} words` : 'Not started'}
            </span>
            {!result ? (
              <button type="button" className="btn btn-primary" disabled={!answer.trim()} onClick={submit}>
                Mark my answer
              </button>
            ) : (
              <button type="button" className="btn" onClick={() => { setResult(null); setShowModel(false); }}>
                Edit and re-mark
              </button>
            )}
          </div>
        </Card>

        {result && (
          <Feedback
            result={result}
            question={question}
            examinerMode={examinerMode}
            onToggleExaminer={() => setExaminerMode((v) => !v)}
            showModel={showModel}
            onToggleModel={() => setShowModel((v) => !v)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="row-between">
        <Back onClick={onBack}>{topic.short}</Back>
        <Seg
          ariaLabel="Filter by question type"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'drq', label: 'DRQ' },
            { value: 'short', label: 'Short' },
            { value: 'essay', label: 'Essay' },
          ]}
        />
      </div>

      <div className="stack" style={{ gap: 10 }}>
        {list.map((q) => {
          const prev = state.tests[q.id];
          return (
            <Card key={q.id} tight>
              <div className="row-between" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                    <Badge tone="neutral">{TYPE_LABEL[q.type]}</Badge>
                    <span className="tiny mono dim">[{q.marks}]</span>
                    {q.source && <span className="tiny dim">{q.source}</span>}
                  </div>
                  <div className="small">{q.prompt}</div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  {prev && (
                    <Badge tone={prev.awarded === prev.max ? 'good' : prev.awarded === 0 ? 'bad' : 'warn'}>
                      {prev.awarded}/{prev.max}{prev.level ? ` ${prev.level}` : ''}
                    </Badge>
                  )}
                  <button type="button" className="btn btn-sm btn-soft" onClick={() => open(q)}>
                    {prev ? 'Retry' : 'Attempt'}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
