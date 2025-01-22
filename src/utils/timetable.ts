import ICAL from 'ical.js';
import { TimetableEvent } from '../types';

export const parseICSFile = (icsContent: string): TimetableEvent[] => {
  try {
    const jcalData = ICAL.parse(icsContent);
    const comp = new ICAL.Component(jcalData);
    const events = comp.getAllSubcomponents('vevent').map(vevent => {
      const event = new ICAL.Event(vevent);
      return {
        summary: event.summary,
        location: event.location,
        startDate: event.startDate.toJSDate(),
        endDate: event.endDate.toJSDate()
      };
    });

    // Filter out past events
    const now = new Date();
    return events.filter(event => event.endDate > now);
  } catch (error) {
    console.error('Error parsing ICS file:', error);
    return [];
  }
};

export const getNextClass = (events: TimetableEvent[]): TimetableEvent | null => {
  const now = new Date();
  const futureEvents = events
    .filter(event => event.startDate > now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  
  return futureEvents[0] || null;
};

export const formatEventDate = (date: Date): string => {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

export const validateTimetable = (events: TimetableEvent[]): string | null => {
  if (events.length === 0) {
    return "No events found in the timetable. Please check if the file is valid.";
  }

  const now = new Date();
  const futureEvents = events.filter(event => event.endDate > now);
  
  if (futureEvents.length === 0) {
    return "This timetable contains only past events. Please upload your current timetable.";
  }

  return null;
};