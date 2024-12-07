import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AddAppointmentModal from './AddAppointmentModal';
import EditAppointmentModal from './EditAppointmentModal';
import { Modal, Button, message } from 'antd';
import { getAppointments, deleteAppointment, addAppointment, updateAppointment } from '../api.services/services'; // Import services

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, dateRange]);

  const fetchAppointments = async () => {
    try {
      const response = await getAppointments();
      if (response.success) {
        setAppointments(response.data);
      } else {
        message.error(response.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      message.error('Failed to fetch appointments: ' + error.message);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;
    if (startDate && endDate) {
      filtered = appointments.filter((apt) => {
        const appointmentDate = new Date(apt.date);
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });
    }
  
    // Enhanced sorting: First by status ('Scheduled' first, 'Completed' last), then by date
    filtered.sort((a, b) => {
      // Prioritize 'Scheduled' status
      if (a.status === 'Scheduled' && b.status !== 'Scheduled') return -1;
      if (a.status !== 'Scheduled' && b.status === 'Scheduled') return 1;
  
      // Deprioritize 'Completed' status
      if (a.status === 'Completed' && b.status !== 'Completed') return 1;
      if (a.status !== 'Completed' && b.status === 'Completed') return -1;
  
      // If statuses are the same, sort by date
      const dateA = new Date(a.date), dateB = new Date(b.date);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
  
      return 0; // Keep original order if both have the same status and date
    });
  
    setFilteredAppointments(filtered);
  };

  const handleAddAppointment = async (newAppointment) => {
    try {
      const response = await addAppointment(newAppointment);
      if (response.success) {
        message.success('Appointment added successfully');
      } else {
        message.error(response.message || 'Failed to add appointment');
      }
    } catch (error) {
      message.error('Failed to add appointment: ' + error.message);
    }
    fetchAppointments(); // Refetch appointments regardless of success or failure
  };

  const handleEditAppointment = async (updatedAppointment) => {
    try {
      const response = await updateAppointment(updatedAppointment.id, updatedAppointment);
      if (response.success) {
        message.success('Appointment updated successfully');
        fetchAppointments(); // Refetch appointments to update the list
      } else {
        message.error(response.message || 'Failed to update appointment');
      }
    } catch (error) {
      message.error('Failed to update appointment: ' + error.message);
    }
    fetchAppointments();
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleDeleteAppointment = async () => {
    try {
      const response = await deleteAppointment(selectedAppointment.id);
      if (response.success) {
        message.success('Appointment deleted successfully');
      } else {
        message.error(response.message || 'Failed to delete appointment');
      }
    } catch (error) {
      message.error('Failed to delete appointment: ' + error.message);
    }
    fetchAppointments(); // Refetch appointments regardless of success or failure
  };

  const handleEditButtonClick = () => {
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const getHeaderText = () => {
    if (startDate && endDate) {
      return `Appointments from ${format(startDate, 'MMM dd')} to ${format(endDate, 'MMM dd')}`;
    }
    return "Appointments";
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 dark:bg-boxdark" style={{ height: '100vh' }}>
      {/* Left Side - Appointments List */}
      <div className="lg:col-span-2 overflow-y-auto hide-scrollbar" style={{ maxHeight: '100vh' }}>
        <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-gray-100 dark:border-strokedark p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-black dark:text-white">
              {getHeaderText()}
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
                className="flex items-center p-4 bg-meta-9 dark:bg-strokedark rounded-lg hover:bg-gray-100 dark:hover:bg-meta-4 cursor-pointer mb-4"
                onClick={() => handleAppointmentClick(apt)}
              >
                <div className="flex-shrink-0 w-20">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 dark:text-meta-2 mr-1" />
                    <span className="text-sm font-medium text-black dark:text-meta-2">
                      {format(new Date(apt.date), 'MMM dd')} {format(new Date(`1970-01-01T${apt.time}`), 'hh:mm a')}
                    </span>
                  </div>
                </div>
                <div className='ml-2 mr-4'>
                  <span className="text-sm font-medium text-black dark:text-meta-2 ml-4">
                    {apt.appointment_id}
                  </span>
                </div>
                <div className="ml-4 flex-grow">
                  <p className="text-sm font-medium text-black dark:text-white">
                    {apt.patient_name}
                  </p>
                  <p className="text-sm text-black dark:text-meta-2">
                    {apt.treatment_name}
                  </p>
                </div>
                <div className="ml-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      apt.status === 'Scheduled'
                        ? 'text-meta-6 bg-meta-4 dark:bg-green-900'
                        : apt.status === 'Completed'
                        ? 'text-meta-3 bg-meta-4 dark:bg-yellow-900'
                        : apt.status === 'Cancelled'
                        ? 'text-meta-1 bg-meta-4 dark:bg-red-900'
                        : ''
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
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-s-meta-4 dark:border-strokedark p-6 mb-6" style={{ position: 'sticky', top: 0, height: 'fit-content' }}>
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
          <p><strong>Appointment ID:</strong> {selectedAppointment.appointment_id}</p>
          <p><strong>Patient Name:</strong> {selectedAppointment.patient_name}</p>
          <p><strong>Treatment Name:</strong> {selectedAppointment.treatment_name}</p>
          <p><strong>Date:</strong> {format(new Date(selectedAppointment.date), 'MMM dd, yyyy')}</p>
          <p><strong>Time:</strong> {format(new Date(`1970-01-01T${selectedAppointment.time}`), 'hh:mm a')}</p>
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
