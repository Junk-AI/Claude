import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import TopicPage from './components/TopicPage.jsx';
import ExamMode from './components/ExamMode.jsx';
import { TopicTheme } from './components/ui.jsx';
import { topicById } from './content/data.js';
import { load, save, reset } from './lib/storage.js';

// The house accent, used wherever no single topic is in view. A muted
// slate-teal that sits between the three topic accents without impersonating
// any of them.
const NEUTRAL = {
  id: 'neutral', accent: '#7E9695', accentDeep: '#5D7877',
  accentSoft: '#EAF0EF', accentTint: '#F4F8F7',
};

export default function App() {
  const [state, setState] = useState(load);
  const [view, setView] = useState({ name: 'dashboard' });
  const [examinerMode, setExaminerMode] = useState(true);

  useEffect(() => { save(state); }, [state]);
  useEffect(() => { window.scrollTo(0, 0); }, [view.name, view.topicId]);

  const topic = view.topicId ? topicById(view.topicId) : null;
  const theme = topic || NEUTRAL;

  const clearProgress = () => {
    if (window.confirm('Clear all saved progress on this device? This cannot be undone.')) {
      setState(reset());
      setView({ name: 'dashboard' });
    }
  };

  return (
    <TopicTheme topic={theme} className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button type="button" className="brand" onClick={() => setView({ name: 'dashboard' })}>
            <span className="brand-dot" aria-hidden="true" />
            Geo Revise
          </button>
          <span className="topbar-spacer" />
          {view.name !== 'exam' && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setView({ name: 'exam' })}>
              Exam mode
            </button>
          )}
          <button type="button" className="btn btn-sm btn-ghost" onClick={clearProgress}>
            Reset
          </button>
        </div>
      </header>

      <main className={`page${view.name === 'exam' ? ' page-narrow' : ''}`}>
        {view.name === 'dashboard' && (
          <Dashboard
            state={state}
            onOpenTopic={(id, mode) => setView({ name: 'topic', topicId: id, mode })}
            onOpenExam={() => setView({ name: 'exam' })}
          />
        )}

        {view.name === 'topic' && topic && (
          <TopicPage
            key={`${topic.id}-${view.mode || 'learn'}`}
            topic={topic}
            initialMode={view.mode || 'learn'}
            state={state}
            setState={setState}
            onBack={() => setView({ name: 'dashboard' })}
            examinerMode={examinerMode}
            setExaminerMode={setExaminerMode}
          />
        )}

        {view.name === 'exam' && (
          <ExamMode
            state={state}
            setState={setState}
            onBack={() => setView({ name: 'dashboard' })}
            examinerMode={examinerMode}
            setExaminerMode={setExaminerMode}
          />
        )}
      </main>
    </TopicTheme>
  );
}
