import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      date: new Date(),
      time: '09:00 AM',
      patient: 'Sarah Johnson',
      treatment: 'Dental Cleaning',
      duration: '1 hour',
      status: 'Confirmed',
      documents: {
        procedure: 'Dental_Cleaning.pdf',
        caseSheet: 'Case_Sheet_1.pdf',
        notes: 'Notes_1.pdf',
      },
    },
    {
      id: 2,
      date: new Date(),
      time: '10:30 AM',
      patient: 'Michael Chen',
      treatment: 'Root Canal',
      duration: '2 hours',
      status: 'Pending',
      documents: {
        procedure: 'Root_Canal_Procedure.pdf',
        caseSheet: 'Case_Sheet_2.pdf',
        notes: 'Notes_2.pdf',
      },
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    date: selectedDate,
    time: '',
    patient: '',
    treatment: '',
    status: 'Pending',
    documents: {
      procedure: '',
      caseSheet: '',
      notes: '',
    },
  });
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const handleAddAppointment = () => {
    setAppointments([
      ...appointments,
      { ...newAppointment, id: appointments.length + 1 },
    ]);
    setShowAddModal(false);
  };

  const filteredAppointments = appointments.filter(
    (apt) =>
      format(apt.date, 'yyyy-MM-dd') >= format(startDate || new Date(), 'yyyy-MM-dd') &&
      format(apt.date, 'yyyy-MM-dd') <= format(endDate || new Date(), 'yyyy-MM-dd')
  );

  return (
<div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 dark:bg-boxdark">
  {/* Left Side - Appointments List */}
  <div className="lg:col-span-2">
    <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-gray-100 dark:border-strokedark p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Appointments
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 dark:bg-meta-4 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-meta-3"
        >
          <Plus className="inline-block mr-2" /> Add Appointment
        </button>
      </div>
      <div className="space-y-4">
        {filteredAppointments.map((apt) => (
          <div
            key={apt.id}
            className="flex items-center p-4 bg-gray-50 dark:bg-strokedark rounded-lg hover:bg-gray-100 dark:hover:bg-meta-4 cursor-pointer"
            onClick={() => setSelectedAppointment(apt)}
          >
            <div className="flex-shrink-0 w-20">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 dark:text-meta-2 mr-1" />
                <span className="text-sm font-medium text-black dark:text-meta-2">
                  {apt.time}
                </span>
              </div>
            </div>
            <div className="ml-4 flex-grow">
              <p className="text-sm font-medium text-black dark:text-white">
                {apt.patient}
              </p>
              <p className="text-sm text-black dark:text-meta-2">
                {apt.treatment}
              </p>
            </div>
            <div className="ml-4">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  apt.status === 'Confirmed'
                    ? 'text-green-700 bg-green-100 dark:bg-meta-2'
                    : 'text-yellow-700 bg-yellow-100 dark:bg-meta-4'
                }`}
              >
                {apt.status}
              </span>
            </div>
          </div>
        ))}
        {filteredAppointments.length === 0 && (
          <p className="text-black dark:text-meta-2 text-sm">
            No appointments for the selected date range.
          </p>
        )}
      </div>
    </div>
  </div>

  {/* Right Side - Calendar */}
  <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-gray-100 dark:border-strokedark p-6">
    <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
      Select Date Range
    </h2>
    <DatePicker
      selected={startDate}
      onChange={(update) => setDateRange(update)}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      inline
      className="rounded-lg"
    />
  </div>
</div>

  );
};

export default Appointments;
