import React from 'react';
import { Card, Mastery, Badge, TopicTheme } from './ui.jsx';
import { TOPICS, contentFor, questionsByTopic } from '../content/data.js';
import { topicMastery, pct } from '../lib/storage.js';

const topicIds = (topic) => {
  const c = contentFor(topic.id);
  return {
    cardIds: c.flashcards.map((x) => x.id),
    blankIds: c.fillBlanks.map((x) => x.id),
    dragIds: c.dragDrop.map((x) => x.id),
    questionIds: questionsByTopic(topic.id).map((q) => q.id),
  };
};

export default function Dashboard({ state, onOpenTopic, onOpenExam }) {
  const masteries = TOPICS.map((t) => ({ topic: t, value: topicMastery(state, topicIds(t)) }));
  const overall = masteries.reduce((a, m) => a + m.value, 0) / masteries.length;
  const streak = state.streak?.count || 0;
  const attempted = Object.keys(state.tests || {}).length;
  const papers = (state.exams || []).length;

  return (
    <div className="stack">
      <div className="row-between">
        <div>
          <h1 style={{ marginBottom: 2 }}>Geo Revise</h1>
          <p className="muted small" style={{ marginBottom: 0 }}>
            Secondary 2 Geography. Three topics, learn then test.
          </p>
        </div>
        <div className="row">
          {streak > 0 && <Badge tone="good">{streak}-day streak</Badge>}
          <Badge tone="neutral">{pct(overall)}% overall</Badge>
        </div>
      </div>

      <div className="grid-3">
        {masteries.map(({ topic, value }) => (
          <TopicTheme key={topic.id} topic={topic} className="card topic-card">
            <div className="topic-swatch" />
            <div>
              <h3 style={{ marginBottom: 2 }}>{topic.name}</h3>
              <p className="tiny dim" style={{ marginBottom: 0 }}>{topic.blurb}</p>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <Mastery value={value} />
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button type="button" className="btn btn-sm btn-soft"
                      onClick={() => onOpenTopic(topic.id, 'learn')}>Learn</button>
              <button type="button" className="btn btn-sm"
                      onClick={() => onOpenTopic(topic.id, 'test')}>Test</button>
            </div>
          </TopicTheme>
        ))}
      </div>

      <Card>
        <div className="row-between">
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="eyebrow">Exam mode</div>
            <h3 style={{ margin: '4px 0 2px' }}>Sit a full timed paper</h3>
            <p className="small muted" style={{ marginBottom: 0 }}>
              1 h 15 min as standard, or 1 h 30 min extended. Timed countdown, auto-submit,
              no feedback until the whole paper is in, then a marked report with a weak-area
              summary and an Examiner Mode round-up.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={onOpenExam}>Start a paper</button>
        </div>
      </Card>

      <div className="grid-3">
        <Card tight className="card-flat">
          <div className="eyebrow">Questions attempted</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 620 }}>{attempted}</div>
        </Card>
        <Card tight className="card-flat">
          <div className="eyebrow">Papers sat</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 620 }}>{papers}</div>
        </Card>
        <Card tight className="card-flat">
          <div className="eyebrow">Current streak</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 620 }}>{streak} {streak === 1 ? 'day' : 'days'}</div>
        </Card>
      </div>
    </div>
  );
}
