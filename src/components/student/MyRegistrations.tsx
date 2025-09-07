import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/database';

export const MyRegistrations: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  if (!user) return null;

  const registrations = db.getRegistrationsByStudent(user.id);
  const events = registrations.map(reg => db.getEventById(reg.eventId)).filter(Boolean);

  const upcomingEvents = events.filter(event => 
    event && (event.status === 'upcoming' || event.status === 'ongoing')
  );
  
  const completedEvents = events.filter(event => 
    event && event.status === 'completed'
  );

  const getRegistrationInfo = (eventId: string) => {
    return registrations.find(reg => reg.eventId === eventId);
  };

  const getEventFeedback = (eventId: string) => {
    const feedback = db.getFeedbackByEvent(eventId);
    return feedback.find(f => f.studentId === user.id);
  };

  const currentEvents = activeTab === 'upcoming' ? upcomingEvents : completedEvents;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Registrations</h2>
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'completed'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed ({completedEvents.length})
          </button>
        </div>
      </div>

      {/* Registration Cards */}
      <div className="grid gap-6">
        {currentEvents.map(event => {
          if (!event) return null;
          
          const registration = getRegistrationInfo(event.id);
          const feedback = getEventFeedback(event.id);
          
          return (
            <div key={event.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.status === 'upcoming'
                        ? 'bg-blue-100 text-blue-700'
                        : event.status === 'ongoing'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {event.status}
                    </span>
                    
                    {registration?.attended && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Attended</span>
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{event.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{event.venue}</span>
                    </div>
                  </div>

                  {registration && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        <p><strong>Registered:</strong> {new Date(registration.registeredAt).toLocaleDateString()}</p>
                        {registration.attendedAt && (
                          <p><strong>Attended:</strong> {new Date(registration.attendedAt).toLocaleDateString()}</p>
                        )}
                        <p><strong>Event ID:</strong> {event.id}</p>
                      </div>
                    </div>
                  )}

                  {/* Show feedback if provided */}
                  {feedback && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Your Feedback</span>
                      </div>
                      <div className="flex items-center space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <Star 
                            key={rating}
                            className={`h-4 w-4 ${
                              rating <= feedback.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">({feedback.rating}/5)</span>
                      </div>
                      {feedback.comment && (
                        <p className="text-sm text-gray-700">"{feedback.comment}"</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end space-y-2 ml-4">
                  {activeTab === 'upcoming' && !registration?.attended && (
                    <div className="flex items-center space-x-1 text-orange-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>Pending Attendance</span>
                    </div>
                  )}
                  
                  {activeTab === 'completed' && registration?.attended && !feedback && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2">Haven't provided feedback yet</p>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs transition-colors">
                        Add Feedback
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {currentEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {activeTab === 'upcoming' 
                ? 'No upcoming events registered' 
                : 'No completed events'
              }
            </p>
            <p className="text-gray-400">
              {activeTab === 'upcoming' 
                ? 'Browse events to register for upcoming activities'
                : 'Your completed events will appear here'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};