import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const JoinScreen: React.FC = () => {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to join game
    console.log(`Joining game ${pin} as ${name}`);
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4 text-center">Join a Game</h2>
      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-slate-700">Game PIN</label>
          <input
            type="text"
            id="pin"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">Your Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <Button type="submit" className="w-full">Join</Button>
      </form>
    </Card>
  );
};

export default JoinScreen;
