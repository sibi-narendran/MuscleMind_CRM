import React from 'react';
import { Modal, Form, Input, DatePicker, TimePicker, Button, Select } from 'antd';
import moment from 'moment';

const { Option } = Select;

const EditAppointmentModal = ({ visible, onClose, onEdit, appointment }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onEdit({
      ...appointment,
      ...values,
      date: values.date.toDate(),
      time: values.time.format('hh:mm A'),
    });
    onClose();
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
          time: moment(appointment.time, 'hh:mm A'),
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
          <TimePicker style={{ width: '100%' }} format="hh:mm A" use12Hours />
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