import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AddAppointmentModal from '../components/AddAppointmentModal';
import EditAppointmentModal from '../components/EditAppointmentModal';
import { Modal, Button, message, Popconfirm } from 'antd';
import { getTodayAppointments, getAppointmentsByDateRange, deleteAppointment, addAppointment, updateAppointment } from '../interceptor/services';
import noAppointmentsImage from '../assets/noappoint.png';

const styles = `
  <style>
    .calendar-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .calendar-wrapper .react-datepicker {
      width: 100%;
      border: none;
    }

    .calendar-wrapper .react-datepicker__month-container {
      width: 100%;
    }

    @media (min-width: 1024px) {
      .lg\\:col-span-2 .flex-col img {
        max-width: 200px;
      }
    }

    @media (min-width: 1024px) and (max-width: 1366px) {
      .calendar-wrapper .react-datepicker {
        max-width: 280px;
      }
    }

    /* Dark mode styles */
    .dark .react-datepicker {
      background-color: #24303F;
      border-color: #333A48;
    }

    .dark .react-datepicker__header {
      background-color: #333A48;
      border-color: #333A48;
    }

    .dark .react-datepicker__current-month,
    .dark .react-datepicker__day-name,
    .dark .react-datepicker__day {
      color: #ffffff;
    }

    .dark .react-datepicker__day:hover {
      background-color: #3C4B5F;
    }

    .dark .react-datepicker__day--selected,
    .dark .react-datepicker__day--in-range {
      background-color: #3C4B5F;
      color: #ffffff;
    }
  </style>
`;

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
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAppointmentsByDateRange();
    }
  }, [dateRange]);

  const fetchTodayAppointments = async () => {
    try {
      const response = await getTodayAppointments();
      if (response.success) {
        setAppointments(response.data);
        setFilteredAppointments(response.data);
      } else {
        message.error(response.message || 'Failed to fetch today\'s appointments');
      }
    } catch (error) {
      message.error('Failed to fetch today\'s appointments: ' + error.message);
    }
  };

  const fetchAppointmentsByDateRange = async () => {
    try {
      if (!startDate || !endDate) return;

      const response = await getAppointmentsByDateRange(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );

      if (response.success) {
        setAppointments(response.data);
        setFilteredAppointments(response.data);
        setShowCalendarModal(false);
      } else {
        message.error(response.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      message.error('Failed to fetch appointments: ' + error.message);
    }
  };

  const handleAddAppointment = async (newAppointment) => {
    try {
      // The appointment has already been created by the modal
      // Just update the UI with the new appointment
      await fetchTodayAppointments();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error refreshing appointments:', error);
      message.error('Error refreshing appointments: ' + error.message);
    }
  };

  const handleEditAppointment = async (updatedAppointment) => {
    try {
      const response = await updateAppointment(updatedAppointment.id, updatedAppointment);
      if (response.success) {
        message.success('Appointment updated successfully');
        setShowEditModal(false);
        if (startDate && endDate) {
          await fetchAppointmentsByDateRange();
        } else {
          await fetchTodayAppointments();
        }
      } else {
        message.error(response.message || 'Failed to update appointment');
      }
    } catch (error) {
      message.error('Failed to update appointment: ' + error.message);
    }
  };

  const handleDeleteAppointment = async () => {
    try {
      const response = await deleteAppointment(selectedAppointment.id);
      if (response.success) {
        message.success('Appointment deleted successfully');
        setShowDetailsModal(false);
        if (startDate && endDate) {
          await fetchAppointmentsByDateRange();
        } else {
          await fetchTodayAppointments();
        }
      } else {
        message.error(response.message || 'Failed to delete appointment');
      }
    } catch (error) {
      message.error('Failed to delete appointment: ' + error.message);
    }
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleEditButtonClick = () => {
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const getHeaderText = () => {
    if (startDate && endDate) {
      return `Appointments from ${format(startDate, 'MMM dd')} to ${format(endDate, 'MMM dd')}`;
    }
    return "Today's Appointments";
  };

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: styles }} />
      
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 dark:bg-boxdark min-h-screen">
        <div className="lg:col-span-2 overflow-y-auto hide-scrollbar">
          <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-gray-100 dark:border-strokedark p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xs font-bold text-black dark:text-white sm:text-xl">
                {getHeaderText()}
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 dark:bg-meta-4 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-meta-3"
                >
                  <Plus className="inline-block mr-2" /> <span className="hidden sm:inline">Add Appointment</span>
                </button>
                <button
                  onClick={() => setShowCalendarModal(true)}
                  className="lg:hidden bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-meta-3"
                >
                  <CalendarIcon className="inline-block" />
                </button>
              </div>
            </div>

            {filteredAppointments.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8">
                <img 
                  src={noAppointmentsImage}
                  alt="No appointments"
                  className="w-40 h-40 object-contain mb-4"
                />
                <p className="text-black dark:text-meta-2 text-sm text-center">
                  No appointments for the selected date range.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col  sm:flex-row items-start sm:items-center p-4 bg-meta-9 dark:bg-strokedark rounded-lg hover:bg-gray-100 dark:hover:bg-meta-4 cursor-pointer mb-4"
                  onClick={() => handleAppointmentClick(apt)}
                >
                  <div className="flex-shrink-0 w-full sm:w-20 mb-2 sm:mb-0">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 dark:text-meta-2 mr-1" />
                      <span className="text-xs sm:text-sm font-medium text-black dark:text-meta-2">
                        {format(new Date(apt.date), 'MMM dd')} {format(new Date(`1970-01-01T${apt.time}`), 'hh:mm a')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-0 sm:ml-2 mr-4">
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-meta-2 ml-0 sm:ml-4">
                      {apt.appointment_id}
                    </span>
                  </div>
                  
                  <div className="ml-0 flex-grow">
                    <p className="text-xs sm:text-sm font-medium text-black dark:text-white">
                      {apt.patient_name}
                    </p>
                    <p className="text-xs sm:text-sm text-black dark:text-meta-2">
                      {apt.treatment_name}
                    </p>
                  </div>

                  {/* Care of section */}
                  <div className="ml-0 sm:ml-4 flex items-center">
                    <span className="text-xs sm:text-sm text-black dark:text-meta-2">
                    {apt.care_person}
                    </span>
                  </div>
                  
                  <div className="ml-0 sm:ml-4 mt-2 sm:mt-0">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        apt.status === 'Scheduled'
                          ? 'text-meta-6 bg-meta-4'
                          : apt.status === 'Completed'
                          ? 'text-meta-3 bg-meta-4'
                          : apt.status === 'Cancelled'
                          ? 'text-meta-1 bg-meta-4'
                          : ''
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-s-meta-4 dark:border-strokedark p-4">
            <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
              Select Date Range
            </h2>
            <div className="calendar-wrapper">
              <DatePicker
                selected={startDate}
                onChange={(update) => setDateRange(update)}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
                className="rounded-lg dark:bg-meta-4 w-full"
              />
            </div>
          </div>
        </div>

        <AddAppointmentModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAppointment}
        />

        <Modal
          title="Select Date Range"
          visible={showCalendarModal}
          onCancel={() => setShowCalendarModal(false)} // Close modal
          footer={null}
          bodyStyle={{ padding: '20px' }}
        >
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
        </Modal>

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
            <p><strong>Age:</strong> {selectedAppointment.age}</p>
            <p><strong>Gender:</strong> {selectedAppointment.gender}</p>
            <p><strong>Care of:</strong> {selectedAppointment.care_person}</p>
            <p><strong>Treatment Name:</strong> {selectedAppointment.treatment_name}</p>
            <p><strong>Date:</strong> {format(new Date(selectedAppointment.date), 'MMM dd, yyyy')}</p>
            <p><strong>Time:</strong> {format(new Date(`1970-01-01T${selectedAppointment.time}`), 'hh:mm a')}</p>
            <p><strong>Status:</strong> {selectedAppointment.status}</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="primary" onClick={handleEditButtonClick}>Edit</Button>
              <Popconfirm
                title="Delete Appointment"
                description="Are you sure you want to delete this appointment?"
                onConfirm={handleDeleteAppointment}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}  
              >
                <Button danger>Delete</Button>
              </Popconfirm>
            </div>
          </Modal>
        )}

        {selectedAppointment && (
          <EditAppointmentModal
            visible={showEditModal}
            onClose={() => setShowEditModal(false)}
            onEdit={handleEditAppointment}
            appointment={selectedAppointment}
          />
        )}
      </div>
    </>
  );
};

export default Appointments;




