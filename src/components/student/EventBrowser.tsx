import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Star, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/database';
import { Event } from '../../types';

export const EventBrowser: React.FC = () => {
  const { user, college } = useAuth();
  const [events] = useState(college ? db.getEvents(college.id) : []);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<'all' | Event['category']>('all');
  const [showRegistrationModal, setShowRegistrationModal] = useState<Event | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<Event | null>(null);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

  const userRegistrations = user ? db.getRegistrationsByStudent(user.id) : [];
  const isRegistered = (eventId: string) => userRegistrations.some(reg => reg.eventId === eventId);
  const hasAttended = (eventId: string) => userRegistrations.find(reg => reg.eventId === eventId && reg.attended);

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.category === filter;
  });

  const handleRegister = (event: Event) => {
    if (!user || isRegistered(event.id)) return;

    try {
      db.registerForEvent(event.id, user.id, user.collegeId);
      // Refresh events to show updated registration count
      window.location.reload();
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. You may already be registered for this event.');
    }
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !showFeedbackModal) return;

    try {
      db.submitFeedback(
        showFeedbackModal.id,
        user.id,
        user.collegeId,
        feedback.rating as 1|2|3|4|5,
        feedback.comment
      );
      
      setShowFeedbackModal(null);
      setFeedback({ rating: 5, comment: '' });
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'ongoing':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: Event['category']) => {
    switch (category) {
      case 'academic':
        return 'bg-purple-100 text-purple-700';
      case 'cultural':
        return 'bg-pink-100 text-pink-700';
      case 'sports':
        return 'bg-green-100 text-green-700';
      case 'technical':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Browse Events</h2>
        
        {/* Filter */}
        <div className="flex space-x-2">
          {['all', 'academic', 'cultural', 'sports', 'technical', 'other'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6">
        {filteredEvents.map(event => {
          const registered = isRegistered(event.id);
          const attended = hasAttended(event.id);
          const canRegister = event.status === 'upcoming' && event.registeredCount < event.capacity && !registered;
          const canProvideFeedback = attended && event.status === 'completed';

          return (
            <div key={event.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                    {registered && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        Registered
                      </span>
                    )}
                    {attended && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        Attended
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{event.description}</p>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{event.registeredCount}/{event.capacity}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2 ml-4">
                  {canRegister && (
                    <button
                      onClick={() => setShowRegistrationModal(event)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Register
                    </button>
                  )}
                  
                  {canProvideFeedback && (
                    <button
                      onClick={() => setShowFeedbackModal(event)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1 transition-colors"
                    >
                      <Star className="h-4 w-4" />
                      <span>Feedback</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Capacity</span>
                  <span>{Math.round((event.registeredCount / event.capacity) * 100)}% filled</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      event.registeredCount >= event.capacity ? 'bg-red-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No events found</p>
            <p className="text-gray-400">Check back later for upcoming events</p>
          </div>
        )}
      </div>

      {/* Registration Confirmation Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Registration</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to register for "{showRegistrationModal.title}"?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  handleRegister(showRegistrationModal);
                  setShowRegistrationModal(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Yes, Register
              </button>
              <button
                onClick={() => setShowRegistrationModal(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Event Feedback</h3>
              <button
                onClick={() => setShowFeedbackModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate this event (1-5 stars)
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFeedback(prev => ({ ...prev, rating }))}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`h-8 w-8 ${
                          rating <= feedback.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (optional)
                </label>
                <textarea
                  rows={3}
                  value={feedback.comment}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your thoughts about this event..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Event Details</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 text-lg">{selectedEvent.title}</h4>
                <p className="text-gray-600 mt-1">{selectedEvent.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Event ID:</span>
                  <p className="text-gray-600">{selectedEvent.id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <p className="text-gray-600 capitalize">{selectedEvent.category}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date & Time:</span>
                  <p className="text-gray-600">{selectedEvent.date} at {selectedEvent.time}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Venue:</span>
                  <p className="text-gray-600">{selectedEvent.venue}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Capacity:</span>
                  <p className="text-gray-600">{selectedEvent.capacity} students</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Registered:</span>
                  <p className="text-gray-600">{selectedEvent.registeredCount} students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};