import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, Button, Select, Upload, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const CARE_PERSONS = [
  "Dr. John Smith",
  "Dr. Sarah Wilson",
  "Dr. Michael Brown",
  "Dr. Emily Davis"
];

const EditPatientModal = ({ visible, onClose, patient, onSave, onDelete }) => {
  const [formData, setFormData] = useState(patient);

  useEffect(() => {
    setFormData(patient);
  }, [patient]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Modal
      title="Edit Patient"
      visible={visible}
      onOk={handleSave}
      onCancel={onClose}
      okText="Save"
      cancelText="Cancel"
      footer={[
        <Button key="delete" type="danger" onClick={() => onDelete(patient)}>
          Delete
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item label="Name">
          <Input
            placeholder="Name"
            value={formData?.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Email">
          <Input
            placeholder="Email"
            value={formData?.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Phone">
          <Input
            placeholder="Phone"
            value={formData?.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Care of">
          <Select
            value={formData?.care_person || ''}
            onChange={(value) => setFormData({ ...formData, care_person: value })}
          >
            {CARE_PERSONS.map(doctor => (
              <Option key={doctor} value={doctor}>{doctor}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Notes">
          <TextArea
            placeholder="Notes"
            value={formData?.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Case Sheet">
          <Row gutter={16} align="middle">
            <Col span={12}>
              <Upload
                fileList={formData?.case_sheet_file || []}
                onChange={({ fileList }) => setFormData({ ...formData, case_sheet_file: fileList })}
              >
                <Button icon={<UploadOutlined />}>Upload Case Sheet</Button>
              </Upload>
            </Col>
            <Col span={12}>
              <Button
                type="default"
                onClick={() => window.open('https://forms.gle/your-google-form-link', '_blank')}
              >
                Open Google Form
              </Button>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item label="JotForm Link">
          <Input
            placeholder="JotForm Link"
            value={formData?.jotform_link || ''}
            onChange={(e) => setFormData({ ...formData, jotform_link: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Documents">
          <Upload
            fileList={formData?.documents || []}
            onChange={({ fileList }) => setFormData({ ...formData, documents: fileList })}
          >
            <Button icon={<UploadOutlined />}>Upload Documents</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPatientModal; 