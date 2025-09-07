import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Users, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/database';

export const ReportsAnalytics: React.FC = () => {
  const { college } = useAuth();
  const [selectedReport, setSelectedReport] = useState<'overview' | 'events' | 'students'>('overview');

  if (!college) return null;

  const events = db.getEvents(college.id);
  const students = db.getUsersByCollege(college.id).filter(u => u.role === 'student');
  const collegeReport = db.getCollegeReport(college.id);

  const generateEventReports = () => {
    return events.map(event => db.getEventReport(event.id)).filter(Boolean);
  };

  const eventReports = generateEventReports();

  const handleDownloadReport = (type: string) => {
    // In a real app, this would generate and download actual reports
    const reportData = {
      college: college.name,
      timestamp: new Date().toISOString(),
      type,
      data: type === 'events' ? eventReports : collegeReport
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFeedbackColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleDownloadReport('overview')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        {[
          { id: 'overview', label: 'College Overview', icon: BarChart3 },
          { id: 'events', label: 'Event Details', icon: Calendar },
          { id: 'students', label: 'Student Analytics', icon: Users }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedReport(id as typeof selectedReport)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedReport === id
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* College Overview */}
      {selectedReport === 'overview' && collegeReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{collegeReport.totalEvents}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{collegeReport.totalRegistrations}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Attendance</p>
                  <p className={`text-3xl font-bold mt-2 ${getAttendanceColor(collegeReport.averageAttendance)}`}>
                    {collegeReport.averageAttendance}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Feedback</p>
                  <p className={`text-3xl font-bold mt-2 ${getFeedbackColor(collegeReport.averageFeedback)}`}>
                    {collegeReport.averageFeedback}/5
                  </p>
                </div>
                <Award className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">College Summary</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>College:</strong> {collegeReport.collegeName}</p>
                    <p><strong>Total Students:</strong> {students.length}</p>
                    <p><strong>Active Events:</strong> {events.filter(e => e.status === 'upcoming' || e.status === 'ongoing').length}</p>
                    <p><strong>Completed Events:</strong> {events.filter(e => e.status === 'completed').length}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Registration Rate:</strong> {Math.round((collegeReport.totalRegistrations / (events.length * 100)) * 100)}%</p>
                    <p><strong>Event Utilization:</strong> {Math.round((collegeReport.totalRegistrations / events.reduce((sum, e) => sum + e.capacity, 0)) * 100)}%</p>
                    <p><strong>Feedback Coverage:</strong> {Math.round((eventReports.reduce((sum, r) => sum + r.feedbackCount, 0) / collegeReport.totalRegistrations) * 100)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Report */}
      {selectedReport === 'events' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Event Performance Report</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feedback
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventReports.map((report) => (
                    <tr key={report.eventId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{report.eventTitle}</p>
                          <p className="text-sm text-gray-500">{report.eventId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.totalRegistrations}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm text-gray-900">{report.attendanceCount} attended</p>
                          <p className={`text-sm font-medium ${getAttendanceColor(report.attendancePercentage)}`}>
                            {report.attendancePercentage}%
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm text-gray-900">{report.feedbackCount} responses</p>
                          <p className={`text-sm font-medium ${getFeedbackColor(report.averageFeedback)}`}>
                            {report.averageFeedback > 0 ? `${report.averageFeedback}/5` : 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Overall</span>
                              <span>
                                {Math.round((report.attendancePercentage + (report.averageFeedback * 20)) / 2)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.round((report.attendancePercentage + (report.averageFeedback * 20)) / 2)}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Student Analytics */}
      {selectedReport === 'students' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Engagement</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Students</span>
                  <span className="text-lg font-bold text-gray-900">{students.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Registrations</span>
                  <span className="text-lg font-bold text-green-600">
                    {events.reduce((sum, event) => sum + event.registeredCount, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Events per Student</span>
                  <span className="text-lg font-bold text-blue-600">
                    {students.length > 0 ? 
                      Math.round((events.reduce((sum, event) => sum + event.registeredCount, 0) / students.length) * 10) / 10 : 0
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Categories</h3>
              <div className="space-y-3">
                {['academic', 'cultural', 'sports', 'technical', 'other'].map(category => {
                  const categoryEvents = events.filter(e => e.category === category);
                  const categoryRegistrations = categoryEvents.reduce((sum, e) => sum + e.registeredCount, 0);
                  const totalRegistrations = events.reduce((sum, e) => sum + e.registeredCount, 0);
                  const percentage = totalRegistrations > 0 ? Math.round((categoryRegistrations / totalRegistrations) * 100) : 0;
                  
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="capitalize text-gray-700">{category}</span>
                        <span className="text-gray-600">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Student List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Student Registration Details</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.slice(0, 10).map((student) => {
                    const studentRegs = db.getRegistrationsByStudent(student.id);
                    const attendedCount = studentRegs.filter(r => r.attended).length;
                    
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.studentId}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {studentRegs.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            studentRegs.length > 0 
                              ? getAttendanceColor(Math.round((attendedCount / studentRegs.length) * 100))
                              : 'text-gray-500'
                          }`}>
                            {studentRegs.length > 0 ? `${attendedCount}/${studentRegs.length}` : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};