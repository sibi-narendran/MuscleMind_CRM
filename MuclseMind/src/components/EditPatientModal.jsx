import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, Button, Select, Upload, Row, Col, Radio, Collapse } from 'antd';
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
      width={800}
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
            <div className="space-y-6">
              {/* DENTAL HISTORY Section */}
              <div className="border p-4 rounded">
                <h3 className="font-bold mb-4">DENTAL HISTORY</h3>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="space-y-4">
                      <Form.Item label="Chief Complaint">
                        <TextArea
                          value={formData?.case_sheet_info?.chief_complaint || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            case_sheet_info: {
                              ...formData.case_sheet_info,
                              chief_complaint: e.target.value
                            }
                          })}
                          rows={3}
                          className="dark:bg-gray-800 dark:text-black"
                        />
                      </Form.Item>

                      <Form.Item label="History of Present Illness">
                        <TextArea
                          value={formData?.case_sheet_info?.present_illness || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            case_sheet_info: {
                              ...formData.case_sheet_info,
                              present_illness: e.target.value
                            }
                          })}
                          rows={3}
                          className="dark:bg-gray-800 dark:text-black"
                        />
                      </Form.Item>

                      <Form.Item label="Past Dental History">
                        <TextArea
                          value={formData?.case_sheet_info?.dental_history || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            case_sheet_info: {
                              ...formData.case_sheet_info,
                              dental_history: e.target.value
                            }
                          })}
                          rows={3}
                          className="dark:bg-gray-800 dark:text-black"
                        />
                      </Form.Item>

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
                          rows={3}
                          className="dark:bg-gray-800 dark:text-black"
                        />
                      </Form.Item>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="space-y-4">
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
                    </div>
                  </Col>
                </Row>
              </div>

              {/* PAST MEDICAL HISTORY Section */}
              <div className="border p-4 rounded">
                <h3 className="font-bold mb-4">PAST MEDICAL HISTORY</h3>
                <p className="mb-2">ANY RELATED DISEASES TO:</p>
                
                <Row gutter={16}>
                  <Col span={12}>
                    {['cardiovascular', 'respiratory', 'gastrointestinal', 'neural'].map((condition) => (
                      <Form.Item 
                        key={condition} 
                        label={condition.charAt(0).toUpperCase() + condition.slice(1)}
                      >
                        <Radio.Group
                          value={formData?.case_sheet_info?.medical_conditions?.[condition] || 'No'}
                          onChange={(e) => setFormData({
                            ...formData,
                            case_sheet_info: {
                              ...formData.case_sheet_info,
                              medical_conditions: {
                                ...formData.case_sheet_info?.medical_conditions,
                                [condition]: e.target.value
                              }
                            }
                          })}
                        >
                          <Radio value="Yes">Yes</Radio>
                          <Radio value="No">No</Radio>
                        </Radio.Group>
                      </Form.Item>
                    ))}
                  </Col>
                  
                  <Col span={12}>
                    {['hepatic', 'renal', 'endocrine', 'diabetes'].map((condition) => (
                      <Form.Item 
                        key={condition} 
                        label={condition.charAt(0).toUpperCase() + condition.slice(1)}
                      >
                        <Radio.Group
                          value={formData?.case_sheet_info?.medical_conditions?.[condition] || 'No'}
                          onChange={(e) => setFormData({
                            ...formData,
                            case_sheet_info: {
                              ...formData.case_sheet_info,
                              medical_conditions: {
                                ...formData.case_sheet_info?.medical_conditions,
                                [condition]: e.target.value
                              }
                            }
                          })}
                        >
                          <Radio value="Yes">Yes</Radio>
                          <Radio value="No">No</Radio>
                        </Radio.Group>
                      </Form.Item>
                    ))}
                  </Col>
                </Row>
              </div>

              {/* Allergies and Other Medical Information */}
              <div className="border p-4 rounded">
                <Form.Item label="ALLERGIC TO">
                  <Input
                    value={formData?.case_sheet_info?.allergies || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      case_sheet_info: {
                        ...formData.case_sheet_info,
                        allergies: e.target.value
                      }
                    })}
                    className="dark:bg-gray-800 dark:text-black"
                  />
                </Form.Item>

                <div className="space-y-4">
                  <Form.Item label="Have you been hospitalized / Operated?">
                    <Radio.Group
                      value={formData?.case_sheet_info?.hospitalization_history || 'No'}
                      onChange={(e) => setFormData({
                        ...formData,
                        case_sheet_info: {
                          ...formData.case_sheet_info,
                          hospitalization_history: e.target.value
                        }
                      })}
                    >
                      <Radio value="Yes">Yes</Radio>
                      <Radio value="No">No</Radio>
                    </Radio.Group>
                  </Form.Item>

                  {formData?.case_sheet_info?.hospitalization_history === 'Yes' && (
                    <Form.Item label="If Yes, give details" className="ml-8">
                      <TextArea
                        value={formData?.case_sheet_info?.hospitalization_details || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          case_sheet_info: {
                            ...formData.case_sheet_info,
                            hospitalization_details: e.target.value
                          }
                        })}
                        rows={2}
                        className="dark:bg-gray-800 dark:text-black"
                      />
                    </Form.Item>
                  )}
                </div>

                <div className="space-y-4 mt-4">
                  <Form.Item label="Are you pregnant?">
                    <Radio.Group
                      value={formData?.case_sheet_info?.pregnancy_status || 'No'}
                      onChange={(e) => setFormData({
                        ...formData,
                        case_sheet_info: {
                          ...formData.case_sheet_info,
                          pregnancy_status: e.target.value
                        }
                      })}
                    >
                      <Radio value="Yes">Yes</Radio>
                      <Radio value="No">No</Radio>
                    </Radio.Group>
                  </Form.Item>

                  {formData?.case_sheet_info?.pregnancy_status === 'Yes' && (
                    <Form.Item label="If Yes, select trimester" className="ml-8">
                      <Radio.Group
                        value={formData?.case_sheet_info?.trimester || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          case_sheet_info: {
                            ...formData.case_sheet_info,
                            trimester: e.target.value
                          }
                        })}
                      >
                        <Radio value="I">I TRIMESTER</Radio>
                        <Radio value="II">II TRIMESTER</Radio>
                        <Radio value="III">III TRIMESTER</Radio>
                      </Radio.Group>
                    </Form.Item>
                  )}
                </div>
              </div>
            </div>
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
