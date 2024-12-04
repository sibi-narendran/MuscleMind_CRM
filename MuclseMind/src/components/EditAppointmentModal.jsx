import React, { useEffect, useState } from 'react';
import { Modal, Form, DatePicker, TimePicker, Button, Select, message } from 'antd';
import moment from 'moment';
import { updateAppointment, getPatients, getTreatments } from '../api.services/services'; // Import necessary services

const { Option } = Select;

const EditAppointmentModal = ({ visible, onClose, onEdit, appointment }) => {
  const [form] = Form.useForm();
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);

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

  const handleFinish = async (values) => {
    try {
      // Find the selected treatment and format the treatment name
      const selectedTreatment = treatments.find(treatment => treatment.id === values.treatment);
      const treatmentName = selectedTreatment ? `${selectedTreatment.category} - ${selectedTreatment.procedure_name}` : '';

      const updatedData = {
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'), // Convert to 24-hour format
        patient_id: values.patient,
        patient_name: patients.find(p => p.id === values.patient).name, // Assuming you have patient name in the patients state
        treatment_id: values.treatment,
        treatment_name: treatmentName, // Use the formatted treatment name
        status: values.status // Include status in the payload
      };
      const response = await updateAppointment(appointment.id, updatedData);
      if (response.success) {
        message.success('Appointment updated successfully');
        onEdit(response.data);
        onClose();
      } else {
        message.error(response.message || 'Failed to update appointment');
      }
    } catch (error) {
      message.error('Failed to update appointment: ' + error.message);
    }
  };

  // Disable past dates
  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };

  return (
    <Modal
      title="Edit Appointment"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          patient: appointment.patient_id,
          treatment: appointment.treatment_id,
          date: moment(appointment.date),
          time: moment(appointment.time, 'HH:mm'),
          status: appointment.status,
        }}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Patient"
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
          >
            {patients.map((patient) => (
              <Option key={patient.id} value={patient.id}>
                {`${patient.patient_id} - ${patient.name}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Treatment"
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
              <Option key={treatment.id} value={treatment.id}>
                {`${treatment.category} - ${treatment.procedure_name}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: 'Please select the date' }]}
        >
          <DatePicker style={{ width: '100%' }} disabledDate={disabledDate} />
        </Form.Item>
        <Form.Item
          label="Time"
          name="time"
          rules={[{ required: true, message: 'Please select the time' }]}
        >
          <TimePicker style={{ width: '100%' }} format="h:mm a" use12Hours />
        </Form.Item>
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: 'Please select the status' }]}
        >
          <Select>
            <Option value="Scheduled">Scheduled</Option>
            <Option value="Completed">Completed</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditAppointmentModal;