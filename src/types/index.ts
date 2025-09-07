// Core type definitions for the Event Management Platform

export interface College {
  id: string;
  name: string;
  location: string;
  contactEmail: string;
  createdAt: string;
}

export interface User {
  id: string;
  collegeId: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
  studentId?: string;
  department?: string;
  year?: number;
  createdAt: string;
}

export interface Event {
  id: string;
  collegeId: string;
  title: string;
  description: string;
  category: 'academic' | 'cultural' | 'sports' | 'technical' | 'other';
  date: string;
  time: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  attendanceCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  collegeId: string;
  registeredAt: string;
  attended: boolean;
  attendedAt?: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  studentId: string;
  collegeId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  submittedAt: string;
}

export interface EventReport {
  eventId: string;
  eventTitle: string;
  totalRegistrations: number;
  attendanceCount: number;
  attendancePercentage: number;
  averageFeedback: number;
  feedbackCount: number;
}

export interface CollegeReport {
  collegeId: string;
  collegeName: string;
  totalEvents: number;
  totalRegistrations: number;
  averageAttendance: number;
  averageFeedback: number;
}

export type AuthState = {
  user: User | null;
  college: College | null;
  isAuthenticated: boolean;
};