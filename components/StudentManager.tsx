import React, { useState } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { Student } from '../types';

interface StudentManagerProps {
  setStudent: (student: Student) => void;
  onStudentSet: () => void;
}

const StudentManager: React.FC<StudentManagerProps> = ({ setStudent, onStudentSet }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const newStudent: Student = {
        id: new Date().toISOString(),
        name: name.trim(),
      };
      setStudent(newStudent);
      onStudentSet();
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4 text-slate-800">Step 1: Enter Your Name</h2>
      <p className="text-slate-600 mb-6">
        Please enter your name to begin your personalized learning session.
      </p>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Jane Doe"
          className="flex-grow block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          aria-label="Student name"
        />
        <Button type="submit" disabled={!name.trim()}>
          Start Learning
        </Button>
      </form>
    </Card>
  );
};

export default StudentManager;
