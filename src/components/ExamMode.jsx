import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Back, Badge, Seg } from './ui.jsx';
import QuestionView from './QuestionView.jsx';
import Feedback from './Feedback.jsx';
import { markAnswer } from '../lib/marking.js';
import { EXAM_PAPERS, EXAM_INSTRUCTIONS, questionById, topicById, EXAMINER_TRAPS } from '../content/data.js';
import { touchStreak } from '../lib/storage.js';

const mmss = (secs) => {
  const s = Math.max(0, secs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

export default function ExamMode({ state, setState, onBack, examinerMode, setExaminerMode }) {
  const [paperId, setPaperId] = useState(EXAM_PAPERS[0].id);
  const [minutes, setMinutes] = useState(75);
  const [phase, setPhase] = useState('cover'); // cover | sitting | report
  const [answers, setAnswers] = useState({});
  const [left, setLeft] = useState(75 * 60);
  const [report, setReport] = useState(null);
  const [openFeedback, setOpenFeedback] = useState(null);
  const [showModel, setShowModel] = useState(false);
  const submitted = useRef(false);

  const paper = EXAM_PAPERS.find((p) => p.id === paperId);
  const questions = useMemo(() => paper.questionIds.map(questionById).filter(Boolean), [paper]);
  const totalMarks = questions.reduce((a, q) => a + q.marks, 0);

  const finish = React.useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    const perQuestion = questions.map((q) => {
      const r = markAnswer(answers[q.id] || '', q);
      return { id: q.id, prompt: q.prompt, topic: q.topic, type: q.type, result: r };
    });
    const awarded = perQuestion.reduce((a, p) => a + p.result.awarded, 0);
    const rep = { paperId, awarded, max: totalMarks, perQuestion, at: Date.now(), minutes };
    setReport(rep);
    setPhase('report');
    setState((prev) => touchStreak({
      ...prev,
      exams: [...(prev.exams || []), {
        paperId, awarded, max: totalMarks, at: rep.at, minutes,
        perQuestion: perQuestion.map((p) => ({ id: p.id, awarded: p.result.awarded, max: p.result.max })),
      }].slice(-25),
      tests: perQuestion.reduce((acc, p) => ({
        ...acc,
        [p.id]: { awarded: p.result.awarded, max: p.result.max, level: p.result.level || null, at: rep.at },
      }), { ...prev.tests }),
    }));
  }, [answers, questions, paperId, totalMarks, minutes, setState]);

  useEffect(() => {
    if (phase !== 'sitting') return undefined;
    const t = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { clearInterval(t); finish(); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, finish]);

  // --- cover ---------------------------------------------------------------
  if (phase === 'cover') {
    return (
      <div className="stack page-narrow">
        <Back onClick={onBack}>Dashboard</Back>

        <div className="exam-cover">
          <div className="center" style={{ marginBottom: 24 }}>
            <div className="eyebrow">Secondary 2 Geography</div>
            <h1 style={{ margin: '6px 0 2px' }}>Examination Paper</h1>
            <div className="muted small">Population Studies &middot; Housing in Cities &middot; Transport Systems in Cities</div>
          </div>

          <hr className="rule" />

          <div className="eyebrow" style={{ marginBottom: 8 }}>Instructions to candidates</div>
          <ul className="exam-instructions">
            {EXAM_INSTRUCTIONS.map((line, i) => <li key={i}>{line}</li>)}
            <li>The total mark for this paper is {totalMarks}.</li>
          </ul>

          <hr className="rule" />

          <div className="stack" style={{ gap: 14 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Paper</div>
              <div className="row">
                {EXAM_PAPERS.map((p) => (
                  <button key={p.id} type="button"
                          className={`btn btn-sm${p.id === paperId ? ' btn-soft' : ''}`}
                          onClick={() => setPaperId(p.id)}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Duration</div>
              <Seg
                ariaLabel="Exam duration"
                value={minutes}
                onChange={(m) => { setMinutes(m); setLeft(m * 60); }}
                options={[
                  { value: 75, label: '1 h 15 min (standard)' },
                  { value: 90, label: '1 h 30 min (extended)' },
                ]}
              />
            </div>
          </div>

          <div className="callout small" style={{ marginTop: 20 }}>
            The timer runs down and the paper submits itself when it reaches zero.
            You will get no feedback at all until the whole paper is submitted.
          </div>

          <button type="button" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 18 }}
                  onClick={() => { submitted.current = false; setLeft(minutes * 60); setAnswers({}); setPhase('sitting'); }}>
            Begin the paper
          </button>
        </div>
      </div>
    );
  }

  // --- sitting -------------------------------------------------------------
  if (phase === 'sitting') {
    const answeredCount = questions.filter((q) => (answers[q.id] || '').trim()).length;
    return (
      <div className="stack page-narrow">
        <div className="row-between" style={{ position: 'sticky', top: 60, zIndex: 10, background: 'var(--bg)', padding: '8px 0' }}>
          <Badge tone="neutral">{answeredCount} of {questions.length} answered</Badge>
          <span className={`timer${left < 300 ? ' low' : ''}`} role="timer" aria-live="off">
            {mmss(left)}
          </span>
        </div>

        {questions.map((q, i) => (
          <Card key={q.id}>
            <QuestionView question={q} index={i + 1} />
            <textarea
              style={{ marginTop: 14 }}
              rows={q.type === 'essay' ? 14 : q.marks >= 5 ? 8 : 5}
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              placeholder="Your answer"
            />
          </Card>
        ))}

        <Card tight>
          <div className="row-between">
            <span className="small muted">Submitting ends the paper and marks every question.</span>
            <button type="button" className="btn btn-primary" onClick={finish}>Submit paper</button>
          </div>
        </Card>
      </div>
    );
  }

  // --- report --------------------------------------------------------------
  const byTopic = {};
  report.perQuestion.forEach((p) => {
    byTopic[p.topic] = byTopic[p.topic] || { awarded: 0, max: 0 };
    byTopic[p.topic].awarded += p.result.awarded;
    byTopic[p.topic].max += p.result.max;
  });

  const trapCounts = {};
  const missedCounts = {};
  report.perQuestion.forEach((p) => {
    (p.result.examiner?.traps || []).forEach((t) => { trapCounts[t.id] = (trapCounts[t.id] || 0) + 1; });
    (p.result.examiner?.missed || []).forEach((m) => { missedCounts[m] = (missedCounts[m] || 0) + 1; });
  });
  const recurringTraps = Object.entries(trapCounts).sort((a, b) => b[1] - a[1]);
  const recurringMissed = Object.entries(missedCounts).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]);

  const weakest = Object.entries(byTopic)
    .map(([id, v]) => ({ id, ...v, ratio: v.max ? v.awarded / v.max : 0 }))
    .sort((a, b) => a.ratio - b.ratio);

  const openQ = openFeedback ? questionById(openFeedback) : null;
  const openR = openFeedback ? report.perQuestion.find((p) => p.id === openFeedback)?.result : null;

  return (
    <div className="stack page-narrow">
      <div className="row-between">
        <Back onClick={onBack}>Dashboard</Back>
        <button type="button" className="btn btn-sm" onClick={() => { setPhase('cover'); setReport(null); setOpenFeedback(null); }}>
          Sit another paper
        </button>
      </div>

      <Card>
        <div className="center">
          <div className="eyebrow">Marked paper</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 640, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            {report.awarded}<span className="dim" style={{ fontSize: '1.4rem' }}> / {report.max}</span>
          </div>
          <div className="muted small">{paper.name} &middot; {report.minutes} minutes</div>
        </div>

        <hr className="rule" />

        <div className="eyebrow" style={{ marginBottom: 10 }}>Per question</div>
        <table className="data">
          <thead>
            <tr><th>Q</th><th>Question</th><th>Mark</th><th></th></tr>
          </thead>
          <tbody>
            {report.perQuestion.map((p, i) => (
              <tr key={p.id}>
                <td className="mono dim">{i + 1}</td>
                <td>
                  <div className="small">{p.prompt.length > 84 ? `${p.prompt.slice(0, 84)}…` : p.prompt}</div>
                  {p.result.level && <span className="tiny dim">Level {p.result.level}</span>}
                </td>
                <td className="mono" style={{ whiteSpace: 'nowrap' }}>
                  <Badge tone={p.result.awarded === p.result.max ? 'good' : p.result.awarded === 0 ? 'bad' : 'warn'}>
                    {p.result.awarded}/{p.result.max}
                  </Badge>
                </td>
                <td>
                  <button type="button" className="link-btn tiny"
                          onClick={() => { setShowModel(false); setOpenFeedback(openFeedback === p.id ? null : p.id); }}>
                    {openFeedback === p.id ? 'Hide' : 'Feedback'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Weak areas across topics</div>
        <div className="stack" style={{ gap: 10 }}>
          {weakest.map((t) => {
            const topic = topicById(t.id);
            return (
              <div key={t.id} className="row-between">
                <span className="small">{topic?.name || t.id}</span>
                <Badge tone={t.ratio >= 0.75 ? 'good' : t.ratio >= 0.5 ? 'warn' : 'bad'}>
                  {t.awarded}/{t.max} marks
                </Badge>
              </div>
            );
          })}
        </div>
        <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
          Weakest topic this paper: <strong>{topicById(weakest[0]?.id)?.name || '-'}</strong>.
          Work its flashcards and drag-and-drop sets before re-sitting.
        </p>
      </Card>

      <Card>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <div className="eyebrow">Examiner Mode summary</div>
          <button type="button" className={`btn btn-sm${examinerMode ? ' btn-soft' : ''}`}
                  aria-pressed={examinerMode} onClick={() => setExaminerMode((v) => !v)}>
            {examinerMode ? 'On' : 'Off'}
          </button>
        </div>

        {examinerMode ? (
          <div className="stack" style={{ gap: 12 }}>
            <div className={`callout ${recurringTraps.length ? 'callout-warn' : 'callout-good'}`}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Traps fallen into across the paper</div>
              {recurringTraps.length ? (
                <ul className="checklist">
                  {recurringTraps.map(([id, n]) => {
                    const t = EXAMINER_TRAPS.find((x) => x.id === id);
                    return (
                      <li key={id}>
                        <span className="tick half" aria-hidden="true">{n}</span>
                        <span><strong style={{ fontWeight: 580 }}>{t.name}</strong> ({n} {n === 1 ? 'question' : 'questions'}). {t.feedback}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : <span className="small">No recurring traps. Good discipline across the paper.</span>}
            </div>

            <div className={`callout ${recurringMissed.length ? 'callout-accent' : 'callout-good'}`}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Discriminators missed more than once</div>
              {recurringMissed.length ? (
                <ul className="checklist">
                  {recurringMissed.map(([m, n]) => (
                    <li key={m}><span className="tick no" aria-hidden="true">{n}</span><span>{m}</span></li>
                  ))}
                </ul>
              ) : <span className="small">Nothing recurred across questions.</span>}
            </div>
          </div>
        ) : (
          <p className="small dim" style={{ margin: 0 }}>
            Turn Examiner Mode on to see which top-band discriminators you missed and which traps you fell into across the whole paper.
          </p>
        )}
      </Card>

      {openQ && openR && (
        <Feedback
          result={openR}
          question={openQ}
          examinerMode={examinerMode}
          onToggleExaminer={() => setExaminerMode((v) => !v)}
          showModel={showModel}
          onToggleModel={() => setShowModel((v) => !v)}
        />
      )}
    </div>
  );
}
