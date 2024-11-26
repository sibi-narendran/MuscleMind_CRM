import React from 'react';
import { Bell, Calendar, Clock, AlertCircle } from 'lucide-react';

const Reminders = () => {
  const reminders = [
    {
      id: 1,
      type: 'Follow-up',
      patient: 'Sarah Johnson',
      date: '2024-03-01',
      description: 'Post-treatment follow-up call',
      priority: 'High',
    },
    {
      id: 2,
      type: 'Checkup',
      patient: 'Michael Chen',
      date: '2024-03-02',
      description: 'Regular checkup appointment',
      priority: 'Medium',
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reminders & Tasks</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Bell className="h-5 w-5 mr-2" />
          New Reminder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Today's Reminders</h2>
            </div>
            <div className="p-6 space-y-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex-shrink-0">
                    {reminder.type === 'Follow-up' ? (
                      <Calendar className="h-5 w-5 text-blue-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{reminder.patient}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        reminder.priority === 'High'
                          ? 'text-red-700 bg-red-100'
                          : 'text-yellow-700 bg-yellow-100'
                      }`}>
                        {reminder.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{reminder.description}</p>
                    <div className="flex items-center mt-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500 ml-1">{reminder.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Inventory Check</p>
                  <p className="text-xs text-yellow-600 mt-1">Due in 2 days</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Staff Meeting</p>
                  <p className="text-xs text-blue-600 mt-1">Tomorrow at 9:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                Set New Reminder
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                View All Tasks
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                Send Notifications
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Reminders</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-red-600">5</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminders;