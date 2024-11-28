import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, DatePicker, TimePicker, Select, message } from 'antd';
import moment from 'moment';
import { getPatients, addAppointment } from '../api.services/services';
import AddPatientModal from './AddPatientModal';

const { Option } = Select;

const AddAppointmentModal = ({ visible, onClose, onAdd }) => {
  const [patients, setPatients] = useState([]);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await getPatients();
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const handleAdd = async (values) => {
    try {
      const appointmentData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
      };
      const response = await addAppointment(appointmentData);
      if (response.success) {
        message.success('Appointment added successfully');
        onAdd(response.data);
        onClose();
      } else {
        message.error('Failed to add appointment');
      }
    } catch (error) {
      message.error('Failed to add appointment: ' + error.message);
    }
  };

  const handleAddPatient = async (newPatient) => {
    try {
      const response = await addPatient(newPatient);
      if (response.success) {
        message.success('Patient added successfully');
        setShowAddPatientModal(false);
        fetchPatients(); // Refetch patients after adding
      } else {
        message.error('Failed to add patient');
      }
    } catch (error) {
      message.error('Failed to add patient: ' + error.message);
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
              {patients.map((patient) => (
                <Option key={patient.id} value={patient.id}>
                  {`${patient.patient_id} - ${patient.name}`}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={<span style={{ fontWeight: 'bold' }}>Treatment</span>}
            name="treatment"
            rules={[{ required: true, message: 'Please enter the treatment' }]}
          >
            <Input style={{ textAlign: 'center' }} />
          </Form.Item>
          <Form.Item
            label={<span style={{ fontWeight: 'bold' }}>Date</span>}
            name="date"
            rules={[{ required: true, message: 'Please select the date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label={<span style={{ fontWeight: 'bold' }}>Time</span>}
            name="time"
            rules={[{ required: true, message: 'Please select the time' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
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