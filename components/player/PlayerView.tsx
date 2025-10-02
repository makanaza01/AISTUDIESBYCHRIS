import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const PlayerView: React.FC = () => {
  // Mock data
  const question = "What is the capital of France?";
  const options = ["Berlin", "Madrid", "Paris", "Rome"];

  return (
    <Card>
      <div className="text-center mb-6">
        <p className="text-lg font-semibold">{question}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {options.map(option => (
          <Button key={option} variant="secondary" className="text-lg py-4">
            {option}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default PlayerView;
