import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
// FIX: Corrected the import path for the types file to align with the project structure.
import { Quiz, Student, QuizResult, Question, Answer } from "../types";

// FIX: Initialize the GoogleGenAI client with the API key from environment variables, following the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchTopicExplanation = async (topic: string): Promise<string> => {
  try {
    const prompt = `Provide a detailed explanation of the following topic, suitable for a student. Be clear, concise, and well-structured. Topic: "${topic}"`;
    // FIX: Use ai.models.generateContent to generate text content from the model.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    // FIX: Access the generated text directly from the response.text property.
    return response.text;
  } catch (error) {
    console.error("Error fetching topic explanation:", error);
    throw new Error("Failed to fetch explanation from AI service. Please try again.");
  }
};

export const generateQuiz = async (topicContent: string, student: Student): Promise<Quiz> => {
  try {
    const prompt = `Based on the following content, generate a comprehensive quiz for a student named ${student.name}.
The quiz must contain exactly two types of questions:
1.  30 multiple-choice questions.
2.  4 theory-based (open-ended) questions.

Mix the questions together throughout the quiz.

Content:
---
${topicContent}
---

Return the quiz in JSON format. The JSON object should have a "title" (string) and a "questions" (array of objects).
Each question object must have:
- "questionText" (string)
- "questionType" (string: either "multiple-choice" or "theory")
- "correctAnswer" (string: for theory, this is the ideal answer; for multiple-choice, it must be one of the options)
- "options" (an array of 4 strings, ONLY for "multiple-choice" questions)
`;

    // FIX: Use ai.models.generateContent with a JSON response schema to get structured quiz data.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionText: { type: Type.STRING },
                  questionType: {
                    type: Type.STRING,
                    enum: ['multiple-choice', 'theory'],
                  },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                },
                required: ["questionText", "questionType", "correctAnswer"],
              },
            },
          },
          required: ["title", "questions"],
        },
      },
    });

    // FIX: Parse the JSON string from response.text to create the quiz object.
    const quizJson = JSON.parse(response.text);
    return quizJson as Quiz;

  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz from AI service. Please try again.");
  }
};

export const gradeTheoryAnswers = async (
  answers: { questionText: string; idealAnswer: string; userAnswer: string }[]
): Promise<{ isCorrect: boolean; feedback: string }[]> => {
  if (answers.length === 0) return [];
  try {
    const prompt = `An AI assistant needs to grade a student's theory-based answers. For each question, compare the user's answer to the ideal answer and provide a boolean 'isCorrect' and brief 'feedback'. 'isCorrect' should be true if the user's answer captures the main points of the ideal answer, even if worded differently. The feedback should explain why the answer was right or wrong.

Here are the answers to grade:
${JSON.stringify(answers, null, 2)}

Return a single JSON object with a key "results" which is an array of objects. Each object in the array should correspond to an answer and contain:
- "isCorrect" (boolean)
- "feedback" (string)
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  isCorrect: { type: Type.BOOLEAN },
                  feedback: { type: Type.STRING },
                },
                required: ['isCorrect', 'feedback'],
              },
            },
          },
          required: ['results'],
        },
      },
    });

    const parsedResponse = JSON.parse(response.text);
    return parsedResponse.results;
  } catch (error) {
    console.error("Error grading theory answers:", error);
    throw new Error("Failed to grade theory answers from AI service.");
  }
};


export const generateFeedback = async (result: QuizResult): Promise<string> => {
    try {
        const prompt = `A student named ${result.student.name} has just completed a quiz on "${result.quizTitle}".
Here are their results:
- Score: ${result.score} out of ${result.totalQuestions}
- Their answers:
${result.answers.map(a => `  - Question: "${a.questionText}"\n    - Their answer: "${a.selectedAnswer}" (${a.isCorrect ? 'Correct' : 'Incorrect, correct answer was "' + a.correctAnswer + '"'})`).join('\n')}

Please provide some brief, encouraging, and constructive feedback for ${result.student.name}. Highlight what they did well and suggest areas for improvement based on their incorrect answers. Keep it friendly and positive.`;

        // FIX: Use ai.models.generateContent to generate personalized feedback for the student.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // FIX: Access the generated text directly from the response.text property.
        return response.text;
    // FIX: Added curly braces to the catch block to fix a syntax error.
    } catch (error) {
        console.error("Error generating feedback:", error);
        throw new Error("Failed to generate feedback from AI service.");
    }
};
