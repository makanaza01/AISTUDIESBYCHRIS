import React, { useState } from 'react';
import { Quiz, QuizResult, Student, Answer } from '../types';
import { generateQuiz, generateFeedback, gradeTheoryAnswers } from '../services/geminiService';
import Card from './common/Card';
import Button from './common/Button';

interface QuizGeneratorProps {
  topicContent: string;
  student: Student | null;
  onQuizComplete: (result: QuizResult) => void;
  quiz: Quiz | null;
  setQuiz: React.Dispatch<React.SetStateAction<Quiz | null>>;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ topicContent, student, onQuizComplete, quiz, setQuiz }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');

  const handleGenerateQuiz = async () => {
    if (!student) {
      setError("Student information is missing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const generatedQuiz = await generateQuiz(topicContent, student);
      setQuiz(generatedQuiz);
      setAnswers({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while generating the quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };
  
  const handleSubmit = async () => {
    if (!quiz || !student) return;

    setIsSubmitting(true);
    setError(null);
    setSubmissionStatus('Grading multiple-choice questions...');

    let score = 0;
    const theoryAnswersToGrade: { index: number; questionText: string; idealAnswer: string; userAnswer: string }[] = [];

    // First pass: grade MCQs and collect theory questions
    const gradedAnswers: Answer[] = quiz.questions.map((q, index) => {
      const selectedAnswer = answers[index] || '';
      let isCorrect = false;

      if (q.questionType === 'multiple-choice') {
        isCorrect = selectedAnswer === q.correctAnswer;
        if (isCorrect) score++;
      } else {
        theoryAnswersToGrade.push({
          index,
          questionText: q.questionText,
          idealAnswer: q.correctAnswer,
          userAnswer: selectedAnswer
        });
      }

      return {
        questionText: q.questionText,
        questionType: q.questionType,
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect, // Will be updated for theory questions
      };
    });

    // Second pass: AI grades theory questions
    if (theoryAnswersToGrade.length > 0) {
      setSubmissionStatus(`Grading ${theoryAnswersToGrade.length} theory questions with AI...`);
      try {
        const theoryResults = await gradeTheoryAnswers(
          theoryAnswersToGrade.map(({ questionText, idealAnswer, userAnswer }) => ({
            questionText, idealAnswer, userAnswer
          }))
        );

        theoryResults.forEach((result, i) => {
          const originalIndex = theoryAnswersToGrade[i].index;
          gradedAnswers[originalIndex].isCorrect = result.isCorrect;
          gradedAnswers[originalIndex].feedback = result.feedback;
          if (result.isCorrect) score++;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to grade theory questions.");
        setIsSubmitting(false);
        return;
      }
    }

    setSubmissionStatus('Generating final feedback...');

    const preliminaryResult: QuizResult = {
      student,
      quizTitle: quiz.title,
      score,
      totalQuestions: quiz.questions.length,
      answers: gradedAnswers,
      feedback: 'Generating feedback...',
    };

    onQuizComplete(preliminaryResult); // Show results immediately

    try {
      const feedback = await generateFeedback(preliminaryResult);
      onQuizComplete({ ...preliminaryResult, feedback });
    } catch (err) {
      console.error("Failed to get feedback", err);
      onQuizComplete({ ...preliminaryResult, feedback: "Could not load AI feedback." });
    } finally {
      setIsSubmitting(false);
      setSubmissionStatus('');
    }
  };

  const areAllQuestionsAnswered = quiz ? Object.keys(answers).length === quiz.questions.length : false;

  if (isLoading) {
    return <Card><p className="text-center text-slate-600">Generating your quiz... This might take a moment.</p></Card>;
  }

  if (error) {
    return <Card><p className="text-center text-red-500">{error}</p></Card>;
  }

  if (!quiz) {
    return (
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Step 3: Test Your Knowledge</h2>
        <p className="text-slate-600 mb-6">
          Ready to see what you've learned? A mixed quiz with 30 multiple-choice and 4 theory questions will be generated.
        </p>
        <div className="text-center">
          <Button onClick={handleGenerateQuiz} isLoading={isLoading}>
            Generate Quiz
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">{quiz.title}</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div className="space-y-8">
          {quiz.questions.map((q, index) => (
            <div key={index}>
              <p className="font-semibold mb-3 text-slate-800">{index + 1}. {q.questionText}</p>
              {q.questionType === 'multiple-choice' ? (
                <fieldset className="space-y-2">
                  <legend className="sr-only">Options for question {index + 1}</legend>
                  {q.options?.map(option => (
                    <label key={option} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${answers[index] === option ? 'bg-indigo-100 border-indigo-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={() => handleAnswerChange(index, option)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        required
                      />
                      <span className="ml-3 text-slate-700">{option}</span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <textarea
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Type your answer here..."
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  rows={4}
                  required
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button type="submit" disabled={!areAllQuestionsAnswered || isSubmitting} isLoading={isSubmitting}>
            {isSubmitting ? submissionStatus : 'Submit Answers'}
          </Button>
          {!areAllQuestionsAnswered && <p className="text-sm text-slate-500 mt-2">Please answer all questions before submitting.</p>}
        </div>
      </form>
    </Card>
  );
};

export default QuizGenerator;