import React, { useState } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { fetchTopicExplanation } from '../services/geminiService';
import { SavedNote } from '../types';

interface TopicManagerProps {
  topics: string;
  setTopics: React.Dispatch<React.SetStateAction<string>>;
  savedNotes: SavedNote[];
  onSaveNote: (title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onLoadNote: (note: SavedNote) => void;
}

const TopicManager: React.FC<TopicManagerProps> = ({ topics, setTopics, savedNotes, onSaveNote, onDeleteNote, onLoadNote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a topic to search for.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTopics(''); // Clear previous topics

    try {
      const explanation = await fetchTopicExplanation(searchQuery);
      setTopics(explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = (note: SavedNote) => {
    onLoadNote(note);
    setSearchQuery(note.title);
    setError(null);
  };

  const isCurrentNoteSaved = savedNotes.some(note => note.title.toLowerCase() === searchQuery.toLowerCase() && note.content === topics);

  return (
    <div className="space-y-8">
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Step 2: Learn a Topic</h2>
        <p className="text-slate-600 mb-6">
          Search for any topic you want to learn about. The AI will generate a detailed note for you. You can then save it or proceed to the 'Quiz' tab.
        </p>
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., Photosynthesis, The French Revolution..."
            className="flex-grow block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            aria-label="Search for a topic"
          />
          <Button type="submit" isLoading={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </Card>
      
      {isLoading && (
        <Card>
          <div className="text-center py-8">
            <p className="text-slate-600">Generating comprehensive notes on "{searchQuery}"... Please wait.</p>
          </div>
        </Card>
      )}

      {topics && !isLoading && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-800">
              Notes on: <span className="text-indigo-600">{searchQuery}</span>
            </h3>
            <Button
              onClick={() => onSaveNote(searchQuery, topics)}
              disabled={isCurrentNoteSaved}
              variant="secondary"
            >
              {isCurrentNoteSaved ? '✓ Saved' : 'Save Notes'}
            </Button>
          </div>
          <div
            className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-lg border border-slate-200"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {topics}
          </div>
          <div className="mt-6 text-center bg-green-100 text-green-800 p-4 rounded-md">
            <p className="font-semibold">✅ Notes are ready!</p>
            <p className="text-sm">You can now go to the <span className="font-bold">'Quiz'</span> tab to create a test based on this content.</p>
          </div>
        </Card>
      )}

      {savedNotes.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold mb-4 text-slate-800">My Saved Notes</h2>
          <div className="space-y-4">
            {savedNotes.map(note => {
              const isActive = topics === note.content;
              return (
                <div key={note.id} className={`p-4 rounded-lg border flex justify-between items-center transition-colors ${isActive ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200'}`}>
                  <p className="font-medium text-slate-700">{note.title}</p>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleLoad(note)} variant="secondary" disabled={isActive}>
                      {isActive ? 'Loaded' : 'Load'}
                    </Button>
                    <Button onClick={() => onDeleteNote(note.id)} variant="secondary" className="!bg-red-100 !text-red-700 hover:!bg-red-200 focus:ring-red-500">
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TopicManager;