import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const HostDashboard: React.FC = () => {
  // Mock data and functions
  const gameId = 'XYZ123';
  const players = ['Alice', 'Bob', 'Charlie'];

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4">Host Dashboard</h2>
      <div className="mb-4">
        <p>Game PIN: <span className="font-bold text-2xl text-indigo-600 tracking-widest">{gameId}</span></p>
        <p className="text-sm text-slate-500">Share this PIN with players to join.</p>
      </div>
      <div className="mb-6">
        <h3 className="font-bold mb-2">{players.length} Players Joined:</h3>
        <ul className="list-disc list-inside bg-slate-50 p-3 rounded">
          {players.map(p => <li key={p}>{p}</li>)}
        </ul>
      </div>
      <Button>Start Game</Button>
    </Card>
  );
};

export default HostDashboard;
