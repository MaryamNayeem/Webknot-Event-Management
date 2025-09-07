// Database utility functions - Mock implementation for prototype
// In production, this would connect to PostgreSQL/MySQL

import { College, User, Event, Registration, Feedback, EventReport, CollegeReport } from '../types';

// Sample data for prototype demonstration
const SAMPLE_COLLEGES: College[] = [
  {
    id: 'college-1',
    name: 'Indian Institute of Technology Delhi',
    location: 'New Delhi, India',
    contactEmail: 'admin@iitd.ac.in',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'college-2', 
    name: 'National Institute of Technology Trichy',
    location: 'Tiruchirappalli, Tamil Nadu',
    contactEmail: 'admin@nitt.edu',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'college-3',
    name: 'Delhi Technological University',
    location: 'Delhi, India', 
    contactEmail: 'admin@dtu.ac.in',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const SAMPLE_USERS: User[] = [
  {
    id: 'admin-1',
    collegeId: 'college-1',
    email: 'admin@iitd.ac.in',
    name: 'Dr. Rajesh Kumar',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-1',
    collegeId: 'college-1',
    email: 'priya.sharma@iitd.ac.in',
    name: 'Priya Sharma',
    role: 'student',
    studentId: 'IIT2021001',
    department: 'Computer Science',
    year: 3,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-2',
    collegeId: 'college-1',
    email: 'amit.patel@iitd.ac.in',
    name: 'Amit Patel',
    role: 'student',
    studentId: 'IIT2021002',
    department: 'Mechanical Engineering',
    year: 3,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const SAMPLE_EVENTS: Event[] = [
  {
    id: 'IIT-2024-TECH-001',
    collegeId: 'college-1',
    title: 'AI & Machine Learning Workshop',
    description: 'Comprehensive workshop on AI/ML fundamentals and practical applications',
    category: 'technical',
    date: '2024-12-15',
    time: '10:00',
    venue: 'Computer Science Auditorium',
    capacity: 200,
    registeredCount: 156,
    attendanceCount: 142,
    status: 'completed',
    createdBy: 'admin-1',
    createdAt: '2024-11-01T00:00:00Z'
  },
  {
    id: 'IIT-2024-CULT-002',
    collegeId: 'college-1', 
    title: 'Annual Cultural Festival - Rendezvous',
    description: 'Three-day cultural extravaganza with competitions, performances, and exhibitions',
    category: 'cultural',
    date: '2024-12-20',
    time: '16:00',
    venue: 'Main Campus Ground',
    capacity: 500,
    registeredCount: 487,
    attendanceCount: 0,
    status: 'upcoming',
    createdBy: 'admin-1',
    createdAt: '2024-11-15T00:00:00Z'
  }
];

const SAMPLE_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-1',
    eventId: 'IIT-2024-TECH-001',
    studentId: 'student-1',
    collegeId: 'college-1',
    registeredAt: '2024-11-20T10:30:00Z',
    attended: true,
    attendedAt: '2024-12-15T09:45:00Z'
  },
  {
    id: 'reg-2',
    eventId: 'IIT-2024-TECH-001',
    studentId: 'student-2', 
    collegeId: 'college-1',
    registeredAt: '2024-11-21T14:20:00Z',
    attended: true,
    attendedAt: '2024-12-15T09:50:00Z'
  }
];

const SAMPLE_FEEDBACK: Feedback[] = [
  {
    id: 'feedback-1',
    eventId: 'IIT-2024-TECH-001',
    studentId: 'student-1',
    collegeId: 'college-1',
    rating: 5,
    comment: 'Excellent workshop! Very informative and well-structured.',
    submittedAt: '2024-12-15T16:00:00Z'
  },
  {
    id: 'feedback-2',
    eventId: 'IIT-2024-TECH-001',
    studentId: 'student-2',
    collegeId: 'college-1',
    rating: 4,
    comment: 'Good content, but could use more hands-on exercises.',
    submittedAt: '2024-12-15T16:15:00Z'
  }
];

// Database operations
class Database {
  private static instance: Database;
  private colleges: College[] = [...SAMPLE_COLLEGES];
  private users: User[] = [...SAMPLE_USERS];
  private events: Event[] = [...SAMPLE_EVENTS];
  private registrations: Registration[] = [...SAMPLE_REGISTRATIONS];
  private feedback: Feedback[] = [...SAMPLE_FEEDBACK];

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // College operations
  getColleges(): College[] {
    return this.colleges;
  }

  getCollegeById(id: string): College | null {
    return this.colleges.find(college => college.id === id) || null;
  }

  // User operations
  getUserByEmail(email: string): User | null {
    return this.users.find(user => user.email === email) || null;
  }

  getUsersByCollege(collegeId: string): User[] {
    return this.users.filter(user => user.collegeId === collegeId);
  }

  // Event operations
  getEvents(collegeId?: string): Event[] {
    if (collegeId) {
      return this.events.filter(event => event.collegeId === collegeId);
    }
    return this.events;
  }

  getEventById(id: string): Event | null {
    return this.events.find(event => event.id === id) || null;
  }

  createEvent(event: Omit<Event, 'id' | 'registeredCount' | 'attendanceCount' | 'createdAt'>): Event {
    const newEvent: Event = {
      ...event,
      id: this.generateEventId(event.collegeId),
      registeredCount: 0,
      attendanceCount: 0,
      createdAt: new Date().toISOString()
    };
    this.events.push(newEvent);
    return newEvent;
  }

  // Registration operations  
  getRegistrationsByEvent(eventId: string): Registration[] {
    return this.registrations.filter(reg => reg.eventId === eventId);
  }

  getRegistrationsByStudent(studentId: string): Registration[] {
    return this.registrations.filter(reg => reg.studentId === studentId);
  }

  registerForEvent(eventId: string, studentId: string, collegeId: string): Registration {
    // Check for duplicate registration
    const existing = this.registrations.find(
      reg => reg.eventId === eventId && reg.studentId === studentId
    );
    if (existing) {
      throw new Error('Student already registered for this event');
    }

    const registration: Registration = {
      id: `reg-${Date.now()}`,
      eventId,
      studentId,
      collegeId,
      registeredAt: new Date().toISOString(),
      attended: false
    };

    this.registrations.push(registration);
    
    // Update event registration count
    const event = this.getEventById(eventId);
    if (event) {
      event.registeredCount++;
    }

    return registration;
  }

  markAttendance(eventId: string, studentId: string): boolean {
    const registration = this.registrations.find(
      reg => reg.eventId === eventId && reg.studentId === studentId
    );
    
    if (registration && !registration.attended) {
      registration.attended = true;
      registration.attendedAt = new Date().toISOString();
      
      // Update event attendance count
      const event = this.getEventById(eventId);
      if (event) {
        event.attendanceCount++;
      }
      return true;
    }
    return false;
  }

  // Feedback operations
  submitFeedback(eventId: string, studentId: string, collegeId: string, rating: 1|2|3|4|5, comment?: string): Feedback {
    const feedback: Feedback = {
      id: `feedback-${Date.now()}`,
      eventId,
      studentId,
      collegeId,
      rating,
      comment,
      submittedAt: new Date().toISOString()
    };
    
    this.feedback.push(feedback);
    return feedback;
  }

  getFeedbackByEvent(eventId: string): Feedback[] {
    return this.feedback.filter(f => f.eventId === eventId);
  }

  // Reporting operations
  getEventReport(eventId: string): EventReport | null {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const registrations = this.getRegistrationsByEvent(eventId);
    const feedbacks = this.getFeedbackByEvent(eventId);
    
    const attendanceCount = registrations.filter(r => r.attended).length;
    const attendancePercentage = registrations.length > 0 
      ? Math.round((attendanceCount / registrations.length) * 100) 
      : 0;
    
    const averageFeedback = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0;

    return {
      eventId: event.id,
      eventTitle: event.title,
      totalRegistrations: registrations.length,
      attendanceCount,
      attendancePercentage,
      averageFeedback: Math.round(averageFeedback * 10) / 10,
      feedbackCount: feedbacks.length
    };
  }

  getCollegeReport(collegeId: string): CollegeReport | null {
    const college = this.getCollegeById(collegeId);
    if (!college) return null;

    const events = this.getEvents(collegeId);
    const totalRegistrations = events.reduce((sum, event) => sum + event.registeredCount, 0);
    const totalAttendance = events.reduce((sum, event) => sum + event.attendanceCount, 0);
    
    const allFeedbacks = events.flatMap(event => this.getFeedbackByEvent(event.id));
    const averageFeedback = allFeedbacks.length > 0
      ? allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length
      : 0;

    const averageAttendance = totalRegistrations > 0
      ? Math.round((totalAttendance / totalRegistrations) * 100)
      : 0;

    return {
      collegeId: college.id,
      collegeName: college.name,
      totalEvents: events.length,
      totalRegistrations,
      averageAttendance,
      averageFeedback: Math.round(averageFeedback * 10) / 10
    };
  }

  // Utility functions
  private generateEventId(collegeId: string): string {
    const college = this.getCollegeById(collegeId);
    const collegeCode = college?.name.split(' ').map(word => word[0]).join('').toUpperCase() || 'UNK';
    const year = new Date().getFullYear();
    const eventCount = this.events.filter(e => e.collegeId === collegeId).length + 1;
    return `${collegeCode}-${year}-${String(eventCount).padStart(3, '0')}`;
  }
}

export const db = Database.getInstance();