import React from 'react';
import { Modal, Form, Input, DatePicker, TimePicker, Button, Select, message } from 'antd';
import moment from 'moment';
import { updateAppointment } from '../api.services/services'; // Import updateAppointment service

const { Option } = Select;

const EditAppointmentModal = ({ visible, onClose, onEdit, appointment }) => {
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    try {
      const updatedData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
      };
      const response = await updateAppointment(appointment.id, updatedData);
      if (response.success) {
        message.success('Appointment updated successfully');
        onEdit(response.data);
        onClose();
      } else {
        message.error('Failed to update appointment');
      }
    } catch (error) {
      message.error('Failed to update appointment: ' + error.message);
    }
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
          patient: appointment.patient,
          treatment: appointment.treatment,
          date: moment(appointment.date),
          time: moment(appointment.time, 'HH:mm'),
          status: appointment.status,
        }}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Patient"
          name="patient"
          rules={[{ required: true, message: 'Please enter the patient name' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Treatment"
          name="treatment"
          rules={[{ required: true, message: 'Please enter the treatment' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: 'Please select the date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="Time"
          name="time"
          rules={[{ required: true, message: 'Please select the time' }]}
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: 'Please select the status' }]}
        >
          <Select>
            <Option value="Confirmed">Confirmed</Option>
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