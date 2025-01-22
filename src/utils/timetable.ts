import ICAL from 'ical.js';
import { TimetableEvent } from '../types';

export const parseICSFile = (icsContent: string): TimetableEvent[] => {
  try {
    const jcalData = ICAL.parse(icsContent);
    const comp = new ICAL.Component(jcalData);
    const events = comp.getAllSubcomponents('vevent').map(vevent => {
      const event = new ICAL.Event(vevent);
      const description = event.description || '';
      
      // Parse class title and instructor from description
      const classTitle = description.match(/Class Title: (.+?)(?:\n|$)/)?.[1]?.trim();
      const instructor = description.match(/Instructor: (.+?)(?:\n|$)/)?.[1]?.trim();
      
      // Get duration from the event
      const duration = event.duration ? 
        `PT${Math.floor(event.duration.hours)}H${event.duration.minutes}M` : 
        'PT1H'; // default 1 hour if not specified

      return {
        summary: event.summary,
        location: event.location,
        startDate: event.startDate.toJSDate(),
        endDate: event.endDate.toJSDate(),
        duration,
        status: event.status || 'CONFIRMED',
        description: event.description || '',
        recurrence: event.component.getFirstPropertyValue('rrule'),
        instructor,
        classTitle
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
    .filter(event => new Date(event.endDate) > new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  
  return futureEvents[0] || null;
};

export const getNextClassOnDay = (events: TimetableEvent[], dayName: string): TimetableEvent | null => {
  const now = new Date();
  const targetDay = dayName.toLowerCase();
  
  // Get all future events
  const futureEvents = events.filter(event => new Date(event.endDate) > new Date());
  
  // Find the next occurrence of the specified day
  const sortedEvents = futureEvents
    .filter(event => {
      const eventDay = event.startDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      return eventDay === targetDay;
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return sortedEvents[0] || null;
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

export const formatEventDetails = (event: TimetableEvent): string => {
  let details = `${event.summary} at ${event.location} on ${formatEventDate(event.startDate)}`;
  
  if (event.classTitle) {
    details += `\nClass: ${event.classTitle}`;
  }
  if (event.instructor) {
    details += `\nInstructor: ${event.instructor}`;
  }
  
  return details;
};

export const validateTimetable = (events: TimetableEvent[]): string | null => {
  if (events.length === 0) {
    return "No events found in the timetable. Please check if the file is valid.";
  }

  console.log("All Events: ", JSON.stringify(events));

  const now = new Date();
  // const futureEvents = events.filter(event => event.endDate > now);
  const futureEvents = events.filter(event => new Date(event.endDate) > new Date());  
  console.log("futureEvents: ", JSON.stringify(futureEvents));

  if (futureEvents.length === 0) {
    return "This timetable contains only past events. Please upload your current timetable.";
  }

  return null;
};