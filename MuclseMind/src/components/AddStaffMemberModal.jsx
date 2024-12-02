import React, { useState } from 'react';
import { Modal, Input, Button, Form } from 'antd';

const AddStaffMemberModal = ({ visible, onClose, onAdd }) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        onAdd(values);
        onClose();
        form.resetFields();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title="Add Staff Member"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Add
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="add_staff_member">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input the name!' }]}
        >
          <Input placeholder="Name" />
        </Form.Item>
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please input the role!' }]}
        >
          <Input placeholder="Role" />
        </Form.Item>
        <Form.Item
          name="attendance"
          label="Attendance"
          rules={[{ required: true, message: 'Please input the attendance!' }]}
        >
          <Input type="number" placeholder="Attendance" />
        </Form.Item>
        <Form.Item
          name="salary"
          label="Salary"
          rules={[{ required: true, message: 'Please input the salary!' }]}
        >
          <Input type="number" placeholder="Salary" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddStaffMemberModal;
