import React from 'react';
import { Modal, Form, Input, Button, DatePicker, TimePicker } from 'antd';
import { format } from 'date-fns';

const AddAppointmentModal = ({ visible, onClose, onAdd }) => {
  const handleAdd = (values) => {
    // Logic to add appointment
    console.log('New Appointment:', values);
    onAdd(values);
    onClose();
  };

  return (
    <Modal
      title="Add Appointment"
      visible={visible}
      onCancel={onClose}
      footer={null}
      bodyStyle={{ padding: '20px' }}
    >
      <Form layout="vertical" onFinish={handleAdd}>
        <Form.Item
          label={<span style={{ fontWeight: 'bold' }}>Appointment ID</span>}
          name="appointmentId"
          rules={[{ required: true, message: 'Please enter the appointment ID' }]}
        >
          <Input style={{ textAlign: 'center' }} />
        </Form.Item>
        <Form.Item
          label={<span style={{ fontWeight: 'bold' }}>Patient Name</span>}
          name="patient"
          rules={[{ required: true, message: 'Please enter the patient name' }]}
        >
          <Input style={{ textAlign: 'center' }} />
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
          <TimePicker style={{ width: '100%' }} format="h:mm a" use12Hours />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Add Appointment
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAppointmentModal;