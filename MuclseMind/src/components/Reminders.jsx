import React from 'react';
import { Plus, Calendar, Clock, AlertCircle } from 'lucide-react';

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
        <h1 className="text-2xl font-bold text-gray-900">Actions</h1>
      </div>
      <div className="flex justify-center mb-6">
        <div className="flex justify-center">
          <button className="flex items-center px-4 py-2 border border-gray-800  text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Generate Letter 
          </button>
        </div>
      </div>
    </div>
  );
};

export default  Reminders;