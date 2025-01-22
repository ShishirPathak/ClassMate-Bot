import { GoogleGenerativeAI } from '@google/generative-ai';
import { TimetableEvent } from '../types';
import { getNextClass, formatEventDate, validateTimetable } from './timetable';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'dummy_key');

export const processQuestion = async (question: string, eventsJson: string) => {
  try {
    const events = JSON.parse(eventsJson) as TimetableEvent[];
    
    // Validate timetable first
    const validationError = validateTimetable(events);
    if (validationError) {
      return validationError;
    }

    // Handle specific questions about next class
    const nextClassKeywords = ['next class', 'next lecture', 'upcoming class', 'upcoming lecture'];
    if (nextClassKeywords.some(keyword => question.toLowerCase().includes(keyword))) {
      const nextClass = getNextClass(events);
      if (!nextClass) {
        return "I couldn't find any upcoming classes in your timetable.";
      }
      return `Your next class is "${nextClass.summary}" at ${nextClass.location} on ${formatEventDate(nextClass.startDate)}.`;
    }

    // For other questions, use Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Create a context-aware prompt
    const prompt = `
      You are a helpful student timetable assistant. Please answer the following question about the student's schedule.
      The schedule data is provided in JSON format below:
      
      ${eventsJson}
      
      Question: ${question}
      
      Please provide a clear and concise answer based on the schedule data. If the information is not available in the schedule, please say so.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();
    
    return answer || "I'm sorry, I couldn't find an answer to your question.";
  } catch (error) {
    console.error('Error processing question:', error);
    return "I'm sorry, I couldn't process your question. Please make sure you've uploaded a valid timetable and check your API key.";
  }
};