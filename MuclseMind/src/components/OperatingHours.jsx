import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Table, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { getOperatingHours, updateOperatingHours } from '../api.services/services';

const { Option } = Select;

// Define the capitalize function here
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const OperatingHours = ({ clinicData, setClinicData }) => {
  const [isEditOperatingHoursModal, setIsEditOperatingHoursModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchOperatingHours = async () => {
      try {
        const response = await getOperatingHours();
        const formattedData = response.data.reduce((acc, { day, status, open_time, close_time }) => {
          acc[day] = { status, open: open_time.slice(0, 5), close: close_time.slice(0, 5) };
          return acc;
        }, {});
        setClinicData(prev => ({ ...prev, operatingHours: formattedData }));
      } catch (error) {
        message.error('Failed to fetch operating hours');
      }
    };

    fetchOperatingHours();
  }, [setClinicData]);

  const openEditModal = () => {
    // Set form fields with current operating hours
    form.setFieldsValue(clinicData.operatingHours);
    setIsEditOperatingHoursModal(true);
  };

  const handleSave = async (values) => {
    try {
      const updatedData = Object.entries(values).map(([day, { status, open, close }]) => ({
        day,
        status,
        open_time: open,
        close_time: close,
      }));

      await updateOperatingHours(updatedData);
      message.success('Operating hours updated successfully');
      setClinicData(prev => ({ ...prev, operatingHours: values }));
    } catch (error) {
      message.error('Failed to update operating hours');
    } finally {
      setIsEditOperatingHoursModal(false);
    }
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Operating Hours</h2>
        <Button type="primary" icon={<EditOutlined />} onClick={openEditModal}>
          Edit
        </Button>
      </div>
      <Table
        dataSource={Object.entries(clinicData.operatingHours).map(([day, hours]) => ({
          key: day,
          day: capitalize(day),
          status: hours.status,
          open: hours.open,
          close: hours.close,
        }))}
        columns={[
          { title: 'Day', dataIndex: 'day', key: 'day' },
          { title: 'Status', dataIndex: 'status', key: 'status' },
          { title: 'Open', dataIndex: 'open', key: 'open' },
          { title: 'Close', dataIndex: 'close', key: 'close' },
        ]}
        pagination={false}
      />
      <Modal
        title="Edit Operating Hours"
        open={isEditOperatingHoursModal}
        onCancel={() => setIsEditOperatingHoursModal(false)}
        footer={null}
      >
        <Form
          form={form}
          initialValues={clinicData.operatingHours}
          onFinish={handleSave}
          layout="vertical"
        >
          {Object.keys(clinicData.operatingHours).map(day => (
            <div key={day} className="flex items-center space-x-4 mb-4">
              <Form.Item
                name={[day, 'status']}
                label={`${capitalize(day)} Status`}
                className="flex-1"
                rules={[{ required: true, message: 'Please select a status!' }]}
              >
                <Select>
                  <Option value="open">Open</Option>
                  <Option value="closed">Closed</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name={[day, 'open']}
                label={`${capitalize(day)} Open`}
                className="flex-1"
                rules={[{ required: true, message: 'Please enter opening time!' }]}
              >
                <Input type="time" />
              </Form.Item>
              <Form.Item
                name={[day, 'close']}
                label={`${capitalize(day)} Close`}
                className="flex-1"
                rules={[{ required: true, message: 'Please enter closing time!' }]}
              >
                <Input type="time" />
              </Form.Item>
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsEditOperatingHoursModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>
    </section>
  );
};

export default OperatingHours; 