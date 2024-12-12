import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, Button, Select, Upload, Row, Col, Collapse } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {getTeamMembers} from "../api.services/services";

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Other"
];

const EditPatientModal = ({ visible, onClose, patient, onSave, onDelete }) => {
  const [formData, setFormData] = useState(patient);
  const [carePresons, setCarePresons] = useState([]);

  useEffect(() => {
    setFormData(patient);
  }, [patient]);

  useEffect(() => {
    fetchCarePresons();
  }, []); 

  const fetchCarePresons = async () => {
    const carePresonsResponse = await getTeamMembers();
    setCarePresons(Array.isArray(carePresonsResponse.data) ? carePresonsResponse.data : []);
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Modal
      title="Edit Patient"
      open={visible}
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
        <Collapse defaultActiveKey={['1']} className="mb-4" accordion={true}>
          <Panel header="Personal Information" key="1">
            <Form.Item label="Name">
              <Input
                placeholder="Name"
                value={formData?.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Age">
              <Input
                type="number"
                placeholder="Age"
                value={formData?.age || ''}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Gender">
              <Select
                value={formData?.gender || ''}
                onChange={(value) => setFormData({ ...formData, gender: value })}
              >
                {GENDER_OPTIONS.map(gender => (
                  <Option key={gender} value={gender}>{gender}</Option>
                ))}
              </Select>
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
                {carePresons.map(doctor => (
                  <Option key={doctor.name} value={doctor.name}>{"Dr. " + doctor.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Panel>

          <Panel header="Case Sheet Information" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Medical History">
                  <TextArea
                    value={formData?.case_sheet_info?.medical_history || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      case_sheet_info: {
                        ...formData.case_sheet_info,
                        medical_history: e.target.value
                      }
                    })}
                    className="dark:bg-gray-800 dark:text-black"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Dental History">
                  <TextArea
                    value={formData?.case_sheet_info?.dental_history || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      case_sheet_info: {
                        ...formData.case_sheet_info,
                        dental_history: e.target.value
                      }
                    })}
                    rows={2}
                    className="dark:bg-gray-800 dark:text-black"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Decayed">
                  <Input
                    value={formData?.case_sheet_info?.decayed || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      case_sheet_info: {
                        ...formData.case_sheet_info,
                        decayed: e.target.value
                      }
                    })}
                    className="dark:bg-gray-800 dark:text-black"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Grossly Decayed">
                  <Input
                    value={formData?.case_sheet_info?.grossly_decayed || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      case_sheet_info: {
                        ...formData.case_sheet_info,
                        grossly_decayed: e.target.value
                      }
                    })}
                    className="dark:bg-gray-800 dark:text-black"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Roots Stumps">
              <Input
                value={formData?.case_sheet_info?.roots_stumps || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  case_sheet_info: {
                    ...formData.case_sheet_info,
                    roots_stumps: e.target.value
                  }
                })}
                className="dark:bg-gray-800 dark:text-black"
              />
            </Form.Item>

            <Form.Item label="Other Diagnosis">
              <TextArea
                value={formData?.case_sheet_info?.other_diagnosis || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  case_sheet_info: {
                    ...formData.case_sheet_info,
                    other_diagnosis: e.target.value
                  }
                })}
                rows={2}
                className="dark:bg-gray-800 dark:text-black"
              />
            </Form.Item>

            <Form.Item label="Treatment Plan">
              <TextArea
                value={formData?.case_sheet_info?.treatment_plan || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  case_sheet_info: {
                    ...formData.case_sheet_info,
                    treatment_plan: e.target.value
                  }
                })}
                rows={2}
                className="dark:bg-gray-800 dark:text-black"
              />
            </Form.Item>
          </Panel>

          <Panel header="Additional Information" key="3">
            <Form.Item label="Documents">
              <Upload
                fileList={formData?.documents || []}
                onChange={({ fileList }) => setFormData({ ...formData, documents: fileList })}
              >
                <Button icon={<UploadOutlined />}>Upload Documents</Button>
              </Upload>
            </Form.Item>
          </Panel>
        </Collapse>
      </Form>
    </Modal>
  );
};

export default EditPatientModal;
