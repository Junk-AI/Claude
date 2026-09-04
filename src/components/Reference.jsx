import React from 'react';
import { Card, Back } from './ui.jsx';
import {
  GSE_METHOD, TREND_VERBS, TREND_ADJECTIVES, ESSAY_STRUCTURE,
  LEVEL_DESCRIPTORS, EXAMINER_FRAMEWORK, EXAMINER_TRAPS, contentFor,
} from '../content/data.js';

export default function Reference({ topic, onBack }) {
  const { glossary } = contentFor(topic.id);

  return (
    <div className="stack">
      <Back onClick={onBack}>{topic.short}</Back>

      <Card>
        <span className="eyebrow" style={{ color: 'var(--accent-deep)' }}>Glossary</span>
        <h3 style={{ marginTop: 6 }}>{topic.name}</h3>
        <table className="data" style={{ marginTop: 10 }}>
          <tbody>
            {glossary.map((g) => (
              <tr key={g.term}>
                <th style={{ width: '32%', textTransform: 'none', fontSize: '0.87rem', color: 'var(--ink)' }}>{g.term}</th>
                <td className="muted">{g.def}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <span className="eyebrow" style={{ color: 'var(--accent-deep)' }}>Method</span>
        <h3 style={{ marginTop: 6 }}>{GSE_METHOD.name}: describing a trend</h3>
        <p className="small muted">{GSE_METHOD.intro}</p>
        <ul className="checklist" style={{ marginTop: 10 }}>
          {GSE_METHOD.parts.map((p) => (
            <li key={p.letter}>
              <span className="tick yes" aria-hidden="true">{p.letter}</span>
              <span><strong style={{ fontWeight: 580 }}>{p.name}.</strong> {p.detail}</span>
            </li>
          ))}
        </ul>

        <hr className="rule" />

        <div className="grid-2">
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Trend verbs</div>
            <table className="data">
              <tbody>
                {TREND_VERBS.map((v) => (
                  <tr key={v.word}><td style={{ fontWeight: 560 }}>{v.word}</td><td className="muted tiny">{v.meaning}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Trend adjectives</div>
            <table className="data">
              <tbody>
                {TREND_ADJECTIVES.map((v) => (
                  <tr key={v.word}><td style={{ fontWeight: 560 }}>{v.word}</td><td className="muted tiny">{v.meaning}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card>
        <span className="eyebrow" style={{ color: 'var(--accent-deep)' }}>Method</span>
        <h3 style={{ marginTop: 6 }}>The 9-mark essay</h3>
        <ul className="checklist">
          {ESSAY_STRUCTURE.map((s, i) => (
            <li key={s.part}>
              <span className="tick yes" aria-hidden="true">{i + 1}</span>
              <span><strong style={{ fontWeight: 580 }}>{s.part}.</strong> {s.detail}</span>
            </li>
          ))}
        </ul>

        <hr className="rule" />

        <div className="eyebrow" style={{ marginBottom: 8 }}>Level descriptors</div>
        <table className="data">
          <tbody>
            {LEVEL_DESCRIPTORS.map((l) => (
              <tr key={l.level}>
                <th style={{ width: 96, textTransform: 'none', color: 'var(--ink)' }}>{l.level} ({l.range})</th>
                <td className="muted">{l.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <span className="eyebrow" style={{ color: 'var(--accent-deep)' }}>Think like the examiner</span>
        <h3 style={{ marginTop: 6 }}>Six checks on every answer</h3>
        <ul className="checklist">
          {EXAMINER_FRAMEWORK.map((f) => (
            <li key={f.id}>
              <span className="tick yes" aria-hidden="true">{f.n}</span>
              <span><strong style={{ fontWeight: 580 }}>{f.name}.</strong> {f.ask}</span>
            </li>
          ))}
        </ul>

        <hr className="rule" />

        <div className="eyebrow" style={{ marginBottom: 8 }}>Traps that cost marks</div>
        <ul className="checklist">
          {EXAMINER_TRAPS.map((t) => (
            <li key={t.id}>
              <span className="tick no" aria-hidden="true">×</span>
              <span><strong style={{ fontWeight: 580 }}>{t.name}.</strong> {t.detail}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
