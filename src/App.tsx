import React, { useState, useEffect } from 'react';
import { Mic, Upload, User, Book, School } from 'lucide-react';
import { StudentInfo, TimetableEvent, ChatMessage } from './types';
import { parseICSFile, validateTimetable } from './utils/timetable';
import { startSpeechRecognition, speak } from './utils/speech';
import { processQuestion } from './utils/ai';

function App() {
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: '',
    major: '',
    university: '',
    timetableContent: ''
  });
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedInfo = sessionStorage.getItem('studentInfo');
    if (savedInfo) {
      const parsedInfo = JSON.parse(savedInfo);
      setStudentInfo(parsedInfo);
      if (parsedInfo.timetableContent) {
        const parsedEvents = parseICSFile(parsedInfo.timetableContent);
        const validationError = validateTimetable(parsedEvents);
        if (validationError) {
          setError(validationError);
          setEvents([]);
        } else {
          setEvents(parsedEvents);
          setError('');
        }
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentInfo(prev => {
      const newInfo = { ...prev, [name]: value };
      sessionStorage.setItem('studentInfo', JSON.stringify(newInfo));
      return newInfo;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const parsedEvents = parseICSFile(content);
          const validationError = validateTimetable(parsedEvents);
          
          if (validationError) {
            setError(validationError);
            setEvents([]);
          } else {
            setStudentInfo(prev => {
              const newInfo = { ...prev, timetableContent: content };
              sessionStorage.setItem('studentInfo', JSON.stringify(newInfo));
              return newInfo;
            });
            setEvents(parsedEvents);
            setError('');
            setChatMessages([]);
          }
        } catch (err) {
          setError('Failed to parse the timetable file. Please make sure it\'s a valid ICS file.');
          setEvents([]);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    startSpeechRecognition(
      async (transcript) => {
        setIsListening(false);
        setChatMessages(prev => [...prev, { type: 'user', text: transcript }]);
        const answer = await processQuestion(transcript, JSON.stringify(events));
        setChatMessages(prev => [...prev, { type: 'bot', text: answer }]);
        speak(answer);
      },
      (error) => {
        setIsListening(false);
        setError(error);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Student Timetable Assistant</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <User size={20} />
                <span>Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={studentInfo.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Book size={20} />
                <span>Major</span>
              </label>
              <input
                type="text"
                name="major"
                value={studentInfo.major}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                placeholder="Enter your major"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <School size={20} />
                <span>University</span>
              </label>
              <input
                type="text"
                name="university"
                value={studentInfo.university}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                placeholder="Enter your university"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Upload size={20} />
                <span>Upload Timetable (ICS file)</span>
              </label>
              <input
                type="file"
                accept=".ics"
                onChange={handleFileUpload}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            {events.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={handleVoiceInput}
                  disabled={isListening}
                  className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isListening ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <Mic className="mr-2" size={20} />
                  {isListening ? 'Listening...' : 'Ask a Question'}
                </button>
              </div>
            )}

            {chatMessages.length > 0 && (
              <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {message.type === 'user' ? studentInfo.name || 'You' : 'Bot'}:
                      </p>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;