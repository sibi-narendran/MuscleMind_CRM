import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, DatePicker, Select, message, TimePicker } from 'antd';
import moment from 'moment';
import { getPatients, addAppointment, getTreatments, getTeamMembers } from '../interceptor/services';
import AddPatientModal from './AddPatientModal';
import { LoadingOutlined } from '@ant-design/icons';

const { Option } = Select;

const AddAppointmentModal = ({ visible, onClose, onAdd }) => {
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [carePersons, setCarePersons] = useState([]);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      fetchPatients();
      fetchTreatments();
      fetchCarePersons();
    }
  }, [visible]);

  const fetchPatients = async () => {
    try {
      const response = await getPatients();
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      message.error('Failed to fetch patients: ' + error.error);
    }
  };

  const fetchTreatments = async () => {
    try {
      const response = await getTreatments();
      if (response.success) {
        setTreatments(response.data);
      }
    } catch (error) {
      message.error('Failed to fetch treatments: ' + error.message);
    }
  };

  const fetchCarePersons = async () => {
    try {
      const response = await getTeamMembers();
      if (response.success) {
        setCarePersons(response.data);
      }
    } catch (error) {
      message.error('Failed to fetch care persons: ' + error.message);
    }
  };

  const handleAdd = async (values) => {
    if (isLoading) return; // Prevent double submission
    try {
      setIsLoading(true);
      const selectedPatient = patients.find(patient => patient.id === values.patient);
      const selectedDoctor = carePersons.find(doctor => doctor.name === values.care_person);
      const selectedTreatment = treatments.find(treatment => treatment.treatment_id === values.treatment);
      
      const treatmentName = selectedTreatment ? `${selectedTreatment.procedure_name}` : '';

      const timeValue = typeof values.time === 'string' 
        ? moment(values.time, 'HH:mm').format('HH:mm')
        : values.time.format('HH:mm');

      const appointmentData = {
        patient_id: values.patient,
        patient_name: selectedPatient ? selectedPatient.name : '',
        patient_email: selectedPatient ? selectedPatient.email : '',
        patient_phone: selectedPatient ? selectedPatient.phone : '',
        age: selectedPatient ? selectedPatient.age : '',
        gender: selectedPatient ? selectedPatient.gender : '',
        date: values.date.format('YYYY-MM-DD'),
        time: timeValue,
        treatment_id: values.treatment,
        treatment_name: treatmentName,
        care_person: values.care_person,
        doctor_email: selectedDoctor ? selectedDoctor.email : '',
        doctor_phone: selectedDoctor ? selectedDoctor.phone : '',
        clinic_name: selectedDoctor ? selectedDoctor.clinic_name : '',
        clinic_phone: selectedDoctor ? selectedDoctor.clinic_phone : '',
        status: 'Scheduled',
      };

      const response = await addAppointment(appointmentData);
      if (response.success) {
        message.success('Appointment added successfully');
        form.resetFields();
        onClose(); // Close the modal first
        // Use setTimeout to ensure the modal is closed before updating the parent
        setTimeout(() => {
          if (onAdd && response.data) {
            onAdd(response.data);
          }
        }, 100);
      } else {
        throw new Error(response.message || response.error || 'Failed to add appointment');
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
      message.error(error.message || 'Failed to add appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = async (newPatient) => {
    try {
      const result = await addPatient(newPatient);
      console.log('Patient added successfully:', result);
      setShowAddPatientModal(false);
      fetchPatients();
    } catch (error) {
      console.error('Error adding patient:', error.message);
    }
  };

  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatientDetails(patient);
  };

  // Disable past dates
  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };

  const handleDropdownVisibleChange = (open) => {
    if (open && !showAll) {
      setShowAll(true); // When dropdown is opened, show all patients
    }
  };

  return (
    <>
      <Modal
        title="Add Appointment"
        visible={visible}
        onCancel={onClose}
        footer={null}
        bodyStyle={{ padding: '20px' }}
        maskClosable={false}  // Prevent accidental closing
        destroyOnClose={true} // Clean up form when modal closes
      >
        <Form 
          form={form}
          layout="vertical" 
          onFinish={handleAdd}
          className="space-y-4"
          preserve={false} // Don't preserve form values
        >
          <Form.Item
            label={<span className="font-semibold">Patient</span>}
            name="patient"
            rules={[{ required: true, message: 'Please select a patient' }]}
          >
            <Select
              placeholder="Select a patient"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              onDropdownVisibleChange={handleDropdownVisibleChange}
              onChange={handlePatientSelect}
              dropdownRender={menu => (
                <div>
                  {menu}
                  <div className="p-2 text-center border-t">
                    <Button type="link" onClick={() => setShowAddPatientModal(true)}>
                      Add New Patient
                    </Button>
                  </div>
                </div>
              )}
            >
              {(showAll ? patients : patients.slice(0, 3)).map((patient) => (
                <Option key={patient.id} value={patient.id}>
                  {`${patient.patient_id}-${patient.name}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedPatientDetails && (
            <div className="bg-gray-50 dark:bg-navy-800 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Age</label>
                  <Input value={selectedPatientDetails.age} disabled />
                </div>
                <div>
                  <label className="font-semibold">Gender</label>
                  <Input value={selectedPatientDetails.gender} disabled />
                </div>
              </div>
            </div>
          )}

          <Form.Item
            label={<span className="font-semibold">Treatment</span>}
            name="treatment"
            rules={[{ required: true, message: 'Please select a treatment' }]}
          >
            <Select
              placeholder="Select a treatment"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {treatments.map((treatment) => (
                <Option key={treatment.treatment_id} value={treatment.treatment_id}>
                  {`${treatment.procedure_name}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="font-semibold">Date</span>}
              name="date"
              rules={[{ required: true, message: 'Please select the date' }]}
            >
              <DatePicker 
                className="w-full" 
                disabledDate={disabledDate}
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold">Time</span>}
              name="time"
              rules={[{ required: true, message: 'Please enter the time' }]}
            >
              <TimePicker 
                className="w-full"
                format="HH:mm"
                minuteStep={15}
                showNow={false}
                use12Hours
                inputReadOnly={false}
              />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-semibold">Care Person</span>}
            name="care_person"
            rules={[{ required: true, message: 'Please select a care person' }]}
          >
            <Select
              showSearch
              placeholder="Search and select care person"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {carePersons.map((doctor) => (
                <Option key={doctor.name} value={doctor.name}>
                  {doctor.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end space-x-4 mt-6">
            <Button onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Appointment'}
            </Button>
          </div>
        </Form>
      </Modal>

      <AddPatientModal
        visible={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        onAdd={handleAddPatient}
      />
    </>
  );
};

export default AddAppointmentModal;