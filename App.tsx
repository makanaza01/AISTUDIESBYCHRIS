import React, { useState, useEffect } from 'react';
import StudentManager from './components/StudentManager';
import TopicManager from './components/TopicManager';
import QuizGenerator from './components/QuizGenerator';
import ResultsDashboard from './components/ResultsDashboard';
import { Quiz, QuizResult, Student, SavedNote } from './types';

type Tab = 'student' | 'topic' | 'quiz' | 'results';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('student');
  const [student, setStudent] = useState<Student | null>(null);
  const [topics, setTopics] = useState<string>('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(() => {
    try {
      const storedNotes = localStorage.getItem('savedNotes');
      return storedNotes ? JSON.parse(storedNotes) : [];
    } catch (error) {
      console.error("Error parsing saved notes from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
  }, [savedNotes]);

  const handleSaveNote = (title: string, content: string) => {
    if (savedNotes.some(note => note.title.toLowerCase() === title.toLowerCase())) {
      return; // Avoid duplicates
    }
    const newNote: SavedNote = {
      id: new Date().toISOString(),
      title,
      content,
    };
    setSavedNotes(prevNotes => [...prevNotes, newNote]);
  };

  const handleDeleteNote = (id: string) => {
    setSavedNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  const handleLoadNote = (note: SavedNote) => {
    setTopics(note.content);
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'student':
        return <StudentManager setStudent={setStudent} onStudentSet={() => setActiveTab('topic')} />;
      case 'topic':
        return <TopicManager
          topics={topics}
          setTopics={setTopics}
          savedNotes={savedNotes}
          onSaveNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
          onLoadNote={handleLoadNote}
        />;
      case 'quiz':
        return <QuizGenerator topicContent={topics} student={student} onQuizComplete={(result) => {
          setQuizResult(result);
          setActiveTab('results');
        }} quiz={quiz} setQuiz={setQuiz} />;
      case 'results':
        return <ResultsDashboard result={quizResult} />;
      default:
        return null;
    }
  };

  const isTabDisabled = (tab: Tab): boolean => {
    if (tab === 'topic') return !student;
    if (tab === 'quiz') return !student || !topics;
    if (tab === 'results') return !quizResult;
    return false;
  };

  const TabButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => {
    const isDisabled = isTabDisabled(tab);
    const activeClasses = 'border-indigo-500 text-indigo-600';
    const inactiveClasses = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
    const disabledClasses = 'text-gray-300 cursor-not-allowed';

    return (
      <button
        onClick={() => !isDisabled && setActiveTab(tab)}
        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
          activeTab === tab ? activeClasses : (isDisabled ? disabledClasses : inactiveClasses)
        }`}
        disabled={isDisabled}
      >
        {label}
      </button>
    );
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-center text-slate-900 tracking-tight">
            AI-Powered Learning Assistant
          </h1>
          <p className="mt-2 text-lg text-center text-slate-600">
            Learn any topic, generate a quiz, and test your knowledge instantly.
          </p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <TabButton tab="student" label="Student" />
            <TabButton tab="topic" label="Topic" />
            <TabButton tab="quiz" label="Quiz" />
            <TabButton tab="results" label="Results" />
          </nav>
        </div>
        <div>
          {renderContent()}
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-slate-500">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;