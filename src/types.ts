export interface StudentInfo {
  name: string;
  major: string;
  university: string;
  timetableContent: string;
}

export interface TimetableEvent {
  summary: string;
  location: string;
  startDate: Date;
  endDate: Date;
  duration: string;
  status: string;
  description: string;
  recurrence?: string;
  instructor?: string;
  classTitle?: string;
}

export interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
}