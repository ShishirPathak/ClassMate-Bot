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
}

export interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
}