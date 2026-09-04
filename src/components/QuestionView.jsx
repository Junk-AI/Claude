import React from 'react';
import Chart from './Chart.jsx';
import { DATASETS, DESCRIBED_STIMULI } from '../content/data.js';

// The stimulus plus the prompt. Shared by Test mode and Exam mode so a
// question always looks the same in both.
export default function QuestionView({ question, index }) {
  const dataset = question.dataset ? DATASETS[question.dataset] : null;
  const described = question.describedStimulus ? DESCRIBED_STIMULI[question.describedStimulus] : null;

  return (
    <div>
      {dataset && (
        <div style={{ marginBottom: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Fig. {index ? index : 1} &middot; {dataset.title}</div>
          <Chart dataset={dataset} />
        </div>
      )}

      {described && (
        <div className="callout" style={{ marginBottom: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{described.title}</div>
          <p className="tiny dim" style={{ marginBottom: 10 }}>{described.note}</p>
          <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
            {described.anchors.map((a, i) => <li key={i}>{a}</li>)}
            {described.features.map((f, i) => <li key={`f${i}`}>{f}</li>)}
          </ul>
        </div>
      )}

      <p style={{ fontSize: '1.02rem', fontWeight: 540, marginBottom: 4 }}>
        {index ? `${index}. ` : ''}{question.prompt} <span className="mono muted">[{question.marks}]</span>
      </p>
      {question.source && <div className="tiny dim">{question.source}</div>}
    </div>
  );
}
