# Student Timetable Assistant

A modern web application that helps students manage their class schedules using AI-powered interactions. Upload your timetable and ask questions about your schedule using voice or text.

![Student Timetable Assistant](https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1000)

## Features

- 📅 ICS Calendar file support
- 🎙️ Voice input for questions
- 🤖 AI-powered responses using Google's Gemini API
- 🗣️ Text-to-speech responses
- 📱 Responsive design
- 🔒 Secure environment variable handling
- ⚡ Built with Vite + React + TypeScript

## Prerequisites

Before you begin, ensure you have:
- Node.js (v14 or higher)
- A Google Gemini API key (get it from [Google MakerSuite](https://makersuite.google.com/app/apikey))

## Setup

1. Clone the repository:
```bash
git clone https://github.com/ShishirPathak/ClassMate-Bot.git
cd student-timetable-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Add your Gemini API key to the `.env` file:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

## Usage

1. Enter your student information (name, major, university)
2. Upload your timetable in ICS format
3. Ask questions about your schedule using:
   - Voice input (click the microphone button)
   - Type your questions in the chat interface

Example questions:
- "What's my next class?"
- "Do I have any classes on Monday?"
- "What's my schedule for this week?"

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI
- Web Speech API
- ICAL.js
- Lucide React Icons

## Deployment

The application can be deployed to any static hosting service. For Netlify:

1. Connect your GitHub repository
2. Add the environment variable `VITE_GEMINI_API_KEY` in Netlify's settings
3. Deploy!



## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini AI for natural language processing
- ICAL.js for calendar parsing
- The React community for excellent tools and libraries