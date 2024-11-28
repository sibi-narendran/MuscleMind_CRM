import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AddAppointmentModal from './AddAppointmentModal';
import EditAppointmentModal from './EditAppointmentModal';
import { Modal, Button } from 'antd';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patient_Id: 45646,
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
      patient_Id: 58478,
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const headerText = startDate && endDate
    ? `Appointments from ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`
    : `Today Appointments`;

  const handleAddAppointment = (newAppointment) => {
    setAppointments([
      ...appointments,
      { ...newAppointment, id: appointments.length + 1 },
    ]);
    setShowAddModal(false);
  };

  const handleEditAppointment = (updatedAppointment) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      )
    );
    setShowEditModal(false);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleDeleteAppointment = () => {
    setAppointments((prev) =>
      prev.filter((apt) => apt.id !== selectedAppointment.id)
    );
    setShowDetailsModal(false);
  };

  const handleEditButtonClick = () => {
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 dark:bg-boxdark">
      {/* Left Side - Appointments List */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-gray-100 dark:border-strokedark p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-black dark:text-white">
              {headerText}
            </h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 dark:bg-meta-4 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-meta-3"
            >
              <Plus className="inline-block mr-2" /> Add Appointment
            </button>
          </div>
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center p-4 bg-meta-9 dark:bg-strokedark rounded-lg hover:bg-gray-100 dark:hover:bg-meta-4 cursor-pointer mb-4"
                onClick={() => handleAppointmentClick(apt)}
              >
                <div className="flex-shrink-0 w-20">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 dark:text-meta-2 mr-1" />
                    <span className="text-sm font-medium text-black dark:text-meta-2">
                      {apt.time}
                    </span>
                  </div>
                </div>
                <div className='ml-2 mr-4'>
                  <span className="text-sm font-medium text-black dark:text-meta-2 ml-4">
                    {apt.patient_Id}
                  </span>
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
                        ? 'text-meta-3 bg-green-100 dark:bg-green-900'
                        : apt.status === 'Pending'
                        ? 'text-meta-6 bg-yellow-100 dark:bg-yellow-900'
                        : apt.status === 'Cancelled'
                        ? 'text-meta-1 bg-red-100 dark:bg-red-900'
                        : ''
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <p className="text-black dark:text-meta-2 text-sm">
                No appointments for the selected date range.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Calendar */}
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-s-meta-4 dark:border-strokedark p-6 mb-6">
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
          className="rounded-lg dark:bg-meta-4"
        />
      </div>

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddAppointment}
      />

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <Modal
          title="Appointment Details"
          visible={showDetailsModal}
          onCancel={() => setShowDetailsModal(false)}
          footer={null}
          bodyStyle={{ padding: '20px' }}
        >
          <p><strong>Patient ID:</strong> {selectedAppointment.patient_Id}</p>
          <p><strong>Patient:</strong> {selectedAppointment.patient}</p>
          <p><strong>Treatment:</strong> {selectedAppointment.treatment}</p>
          <p><strong>Date:</strong> {format(selectedAppointment.date, 'MMM dd, yyyy')}</p>
          <p><strong>Time:</strong> {selectedAppointment.time}</p>
          <p><strong>Status:</strong> {selectedAppointment.status}</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="primary" onClick={handleEditButtonClick}>Edit</Button>
            <Button type="danger" onClick={handleDeleteAppointment}>Delete</Button>
          </div>
        </Modal>
      )}

      {/* Edit Appointment Modal */}
      {selectedAppointment && (
        <EditAppointmentModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          onEdit={handleEditAppointment}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
};

export default Appointments;
