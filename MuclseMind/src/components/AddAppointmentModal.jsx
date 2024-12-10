import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, DatePicker, TimePicker, Select, message } from 'antd';
import moment from 'moment';
import { getPatients, addAppointment, getTreatments } from '../api.services/services';
import AddPatientModal from './AddPatientModal';
import { addPatient } from '../api.services/services';

const { Option } = Select;

const AddAppointmentModal = ({ visible, onClose, onAdd }) => {
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchPatients();
      fetchTreatments();
    }
  }, [visible]);

  const fetchPatients = async () => {
    try {
      const response = await getPatients();
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      message.error('Failed to fetch patients: ' + error.message);
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

  const handleAdd = async (values) => {
    try {
      const selectedPatient = patients.find(patient => patient.id === values.patient);
      const patientName = selectedPatient ? selectedPatient.name : '';

      const selectedTreatment = treatments.find(treatment => treatment.treatment_id === values.treatment);
      const treatmentName = selectedTreatment ? `${selectedTreatment.category} - ${selectedTreatment.procedure_name}` : '';

      const appointmentData = {
        patient_id: values.patient,
        patient_name: patientName,
        age: selectedPatient.age,
        gender: selectedPatient.gender,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
        treatment_id: values.treatment,
        treatment_name: treatmentName,
      };

      if (!appointmentData.treatment_id) {
        throw new Error('Treatment ID is required');
      }

      const response = await addAppointment(appointmentData);
      if (response.success) {
        message.success('Appointment added successfully');
        onAdd(response.data);
        onClose();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
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

  return (
    <>
      <Modal
        title="Add Appointment"
        visible={visible}
        onCancel={onClose}
        footer={null}
        bodyStyle={{ padding: '20px' }}
      >
        <Form layout="vertical" onFinish={handleAdd}>
          <Form.Item
            label={<span style={{ fontWeight: 'bold' }}>Patient</span>}
            name="patient"
            rules={[{ required: true, message: 'Please select a patient' }]}
          >
            <Select
              placeholder="Select a patient"
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={handlePatientSelect}
              dropdownRender={menu => (
                <>
                  {menu}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      padding: 8,
                    }}
                  >
                    <Button
                      type="link"
                      onClick={() => setShowAddPatientModal(true)}
                    >
                      Add Patient
                    </Button>
                  </div>
                </>
              )}
            >
              {patients.slice(0, 3).map((patient) => (
                <Option key={patient.id} value={patient.id}>
                  {`${patient.patient_id} - ${patient.name}`}
                </Option>
              ))}
              {patients.length > 3 && (
                <Option disabled>--- More available on search ---</Option>
              )}
            </Select>
          </Form.Item>

          {selectedPatientDetails && (
            <>
              <Form.Item label={<span style={{ fontWeight: 'bold' }}>Age</span>}>
                <Input 
                  value={selectedPatientDetails.age}
                  disabled
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item label={<span style={{ fontWeight: 'bold' }}>Gender</span>}>
                <Input 
                  value={selectedPatientDetails.gender}
                  disabled
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            label={<span style={{ fontWeight: 'bold' }}>Treatment</span>}
            name="treatment"
            rules={[{ required: true, message: 'Please select a treatment' }]}
          >
            <Select
              placeholder="Select a treatment"
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {treatments.map((treatment) => (
                <Option key={treatment.treatment_id} value={treatment.treatment_id}>
                  {`${treatment.category} - ${treatment.procedure_name}`}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={<span style={{ fontWeight: 'bold' }}>Date</span>}
            name="date"
            rules={[{ required: true, message: 'Please select the date' }]}
          >
            <DatePicker style={{ width: '100%' }} disabledDate={disabledDate} />
          </Form.Item>
          <Form.Item
            label={<span style={{ fontWeight: 'bold' }}>Time</span>}
            name="time"
            rules={[{ required: true, message: 'Please select the time' }]}
          >
            <TimePicker style={{ width: '100%' }} format="h:mm a" use12Hours />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Add Appointment
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Patient Modal */}
      <AddPatientModal
        visible={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        onAdd={handleAddPatient}
      />
    </>
  );
};

export default AddAppointmentModal;