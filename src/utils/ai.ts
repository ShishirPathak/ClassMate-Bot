import { GoogleGenerativeAI } from '@google/generative-ai';
import { TimetableEvent } from '../types';
import { getNextClass, formatEventDate, validateTimetable, getNextClassOnDay, formatEventDetails } from './timetable';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'dummy_key');

export const processQuestion = async (question: string, eventsJson: string) => {
  try {
    const events = JSON.parse(eventsJson) as TimetableEvent[];
    
    // Validate timetable first
    const validationError = validateTimetable(events);
    if (validationError) {
      return validationError;
    }

    const questionLower = question.toLowerCase();

    // Handle specific questions about next class on a specific day
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of daysOfWeek) {
      if (questionLower.includes(day) && questionLower.includes('next class')) {
        const nextClassOnDay = getNextClassOnDay(events, day);
        if (!nextClassOnDay) {
          return `You don't have any upcoming classes scheduled for ${day}.`;
        }
        return `Your next class on ${day} is:\n${formatEventDetails(nextClassOnDay)}`;
      }
    }

    // Handle general next class questions
    const nextClassKeywords = ['next class', 'next lecture', 'upcoming class', 'upcoming lecture'];
    if (nextClassKeywords.some(keyword => questionLower.includes(keyword))) {
      const nextClass = getNextClass(events);
      if (!nextClass) {
        return "I couldn't find any upcoming classes in your timetable.";
      }
      return `Your next class is:\n${formatEventDetails(nextClass)}`;
    }

    // For other questions, use Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Create a context-aware prompt
    const prompt = `
      You are a helpful student timetable assistant. Please answer the following question about the student's schedule.
      The schedule data is provided in JSON format below. Each event includes:
      - summary (class name/code)
      - location (classroom)
      - startDate and endDate
      - duration
      - status
      - description
      - instructor
      - classTitle
      
      Schedule data:
      ${eventsJson}
      
      Question: ${question}
      
      Please provide a clear and concise answer based on the schedule data. Include relevant details like instructor names, class titles, and locations when appropriate.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();
    
    console.log("answer",answer)

    return answer || "I'm sorry, I couldn't find an answer to your question.";
  } catch (error) {
    console.error('Error processing question:', error);
    return "I'm sorry, I couldn't process your question. Please make sure you've uploaded a valid timetable and check your API key.";
  }
};