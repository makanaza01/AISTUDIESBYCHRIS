import React from 'react';
import { QuizResult } from '../types';
import Card from './common/Card';

interface ResultsDashboardProps {
  result: QuizResult | null;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result }) => {
  if (!result) {
    return (
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Step 4: View Your Results</h2>
        <p className="text-slate-600">
          Once you complete a quiz, your results and personalized feedback will appear here.
        </p>
      </Card>
    );
  }

  const { student, quizTitle, score, totalQuestions, answers, feedback } = result;
  const scorePercentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const scoreColorClass = scorePercentage >= 80 ? 'text-green-600' : scorePercentage >= 50 ? 'text-yellow-600' : 'text-red-600';

  const renderAnswerDetails = (ans: typeof answers[0]) => {
    if (ans.questionType === 'multiple-choice') {
      return (
        <>
          <p className="text-sm">Your answer: <span className={`font-medium ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>{ans.selectedAnswer || 'Not answered'}</span></p>
          {!ans.isCorrect && (
            <p className="text-sm">Correct answer: <span className="font-medium text-green-700">{ans.correctAnswer}</span></p>
          )}
        </>
      );
    } else { // Theory question
      return (
        <div className="text-sm space-y-2">
          <p>Your answer: <span className={`font-medium ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>{ans.selectedAnswer || 'Not answered'}</span></p>
          <p>Ideal answer: <span className="font-medium text-slate-700">{ans.correctAnswer}</span></p>
          {ans.feedback && (
             <div className="mt-2 p-3 bg-slate-100 rounded-md">
              <p className="font-semibold text-xs text-slate-600">AI Feedback:</p>
              <p className="text-slate-800">{ans.feedback}</p>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800">Quiz Results for {student.name}</h2>
          <p className="text-lg text-slate-600 mt-2">Topic: <span className="font-semibold">{quizTitle}</span></p>
          <div className="mt-6">
            <p className="text-5xl font-extrabold tracking-tight">
              <span className={scoreColorClass}>{score} / {totalQuestions}</span>
            </p>
            <p className={`text-2xl font-semibold mt-1 ${scoreColorClass}`}>({scorePercentage}%)</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-2xl font-bold mb-4 text-slate-800">AI Overall Feedback</h3>
        <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-lg border border-slate-200">
          {feedback === 'Generating feedback...' ? <p><i>Loading...</i></p> : <p style={{ whiteSpace: 'pre-wrap' }}>{feedback}</p>}
        </div>
      </Card>

      <Card>
        <h3 className="text-2xl font-bold mb-6 text-slate-800">Detailed Breakdown</h3>
        <div className="space-y-6">
          {answers.map((ans, index) => (
            <div key={index} className={`p-4 rounded-lg border ${ans.isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
              <p className="font-semibold text-slate-800 mb-2">{index + 1}. {ans.questionText}</p>
              {renderAnswerDetails(ans)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ResultsDashboard;