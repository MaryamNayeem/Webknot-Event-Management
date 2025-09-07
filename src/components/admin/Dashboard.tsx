import React from 'react';
import { Calendar, Users, TrendingUp, Award, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/database';

export const Dashboard: React.FC = () => {
  const { college } = useAuth();
  
  const events = college ? db.getEvents(college.id) : [];
  const students = college ? db.getUsersByCollege(college.id).filter(u => u.role === 'student') : [];
  
  // Calculate metrics
  const totalRegistrations = events.reduce((sum, event) => sum + event.registeredCount, 0);
  const totalAttendance = events.reduce((sum, event) => sum + event.attendanceCount, 0);
  const attendanceRate = totalRegistrations > 0 ? Math.round((totalAttendance / totalRegistrations) * 100) : 0;
  
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const completedEvents = events.filter(e => e.status === 'completed');

  // Get feedback for completed events
  const avgFeedback = completedEvents.length > 0 
    ? completedEvents.reduce((sum, event) => {
        const eventFeedback = db.getFeedbackByEvent(event.id);
        const eventAvg = eventFeedback.length > 0 
          ? eventFeedback.reduce((s, f) => s + f.rating, 0) / eventFeedback.length 
          : 0;
        return sum + eventAvg;
      }, 0) / completedEvents.length
    : 0;

  const stats = [
    {
      title: 'Total Events',
      value: events.length,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+2 this month'
    },
    {
      title: 'Active Students',
      value: students.length,
      icon: Users,
      color: 'bg-green-500',
      change: '+12 this semester'
    },
    {
      title: 'Attendance Rate',
      value: `${attendanceRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+5% from last month'
    },
    {
      title: 'Avg. Feedback',
      value: avgFeedback.toFixed(1),
      icon: Award,
      color: 'bg-orange-500',
      change: 'out of 5.0'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.slice(0, 5).map(event => (
                <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-500">{event.date} at {event.time}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-500">{event.venue}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{event.registeredCount}</p>
                    <p className="text-xs text-gray-500">registered</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming events</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {completedEvents.slice(0, 5).map(event => {
              const feedback = db.getFeedbackByEvent(event.id);
              const avgRating = feedback.length > 0 
                ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
                : 0;
              
              return (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Award className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {event.attendanceCount}/{event.registeredCount} attended
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}/5
                    </p>
                    <p className="text-xs text-gray-500">rating</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};