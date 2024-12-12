import React, { useState, useEffect } from "react";
import { Modal, Input, Select, Form, Button, Upload, Row, Col, Radio, Drawer, Collapse } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {getTeamMembers} from "../api.services/services";

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const PHONE_PREFIXES = ["+1", "+91"];

const AddPatientModal = ({ visible, onClose, onAdd }) => {
  const handleAdd = (values) => {
    const newPatient = {
      name: values.name,
      age: values.age,
      gender: values.gender,
      phone: `${values.phonePrefix}${values.phone}`,
      email: values.email,
      notes: values.notes,
      care_person: values.care_person,
      case_sheet_info: {
        medical_history: values.medical_history,
        dental_history: values.dental_history,
        decayed: values.decayed,
        grossly_decayed: values.grossly_decayed,
        roots_stumps: values.roots_stumps,
        other_diagnosis: values.other_diagnosis,
        treatment_plan: values.treatment_plan,
      },
      documents: values.documents || [],
      case_sheet_file: values.case_sheet_file,
    };
    onAdd(newPatient);
  };

  const [carePresons, setCarePresons] = useState([]);

  const fetchCarePresons = async () => {
    const carePresonsResponse = await getTeamMembers();
    setCarePresons(Array.isArray(carePresonsResponse.data) ? carePresonsResponse.data : []);
  };

  useEffect(() => {
    fetchCarePresons();
  }, []);

  return (
    <Modal
      title="Add Patient"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Form
        layout="vertical"
        onFinish={handleAdd}
        initialValues={{
          name: "",
          phone: "",
          email: "",
          notes: "",
          care_person: undefined,
          phonePrefix: localStorage.getItem("phonePrefix") || PHONE_PREFIXES[0],
        }}
      >
        <Collapse defaultActiveKey={['1']} className="mb-4" accordion={true} >
          <Panel header="Personal Information" key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: "Please enter the patient's name" }]}
                >
                  <Input placeholder="Name" className="dark:text-black" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Age"
                  name="age"
                  rules={[{ required: true, message: "Please enter the patient's age" }]}
                >
                  <Input type="number" placeholder="Age" className="dark:text-black" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: "Please select gender" }]}
            >
              <Radio.Group>
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
                <Radio value="other">Other</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="Phone" required>
              <Input.Group compact>
                <Form.Item name="phonePrefix" noStyle>
                  <Select
                    style={{ width: "20%" }}
                    className="dark:bg-gray-800 dark:text-black"
                  >
                    {PHONE_PREFIXES.map((prefix) => (
                      <Option key={prefix} value={prefix}>
                        {prefix}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: "Please enter the phone number" },
                    {
                      pattern: /^\d{10}$/,
                      message: "Please enter a valid 10-digit phone number",
                    },
                  ]}
                  noStyle
                >
                  <Input
                    style={{ width: "80%" }}
                    placeholder="Phone"
                    className="dark:bg-gray-800 dark:text-black"
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>

            <Form.Item
              label="Care of"
              name="care_person"
              rules={[{ required: true, message: "Please select a care person" }]}
            >
              <Select placeholder="Care of" className="dark:bg-gray-800 dark:text-black">
                {carePresons.map((doctor) => (
                  <Option key={doctor.name} value={doctor.name}>
                    {"Dr. " + doctor.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: "email", message: "Please enter a valid email" }]}
            >
              <Input placeholder="Email" className="dark:bg-gray-800 dark:text-black" />
            </Form.Item>
          </Panel>

          <Panel header="Case Sheet Information" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <div className="space-y-4">
                  <Form.Item label="Medical History" name="medical_history">
                    <TextArea className="dark:bg-gray-800 dark:text-black" />
                  </Form.Item>
                  
                  <Form.Item label="Dental History" name="dental_history">
                    <TextArea rows={2} className="dark:bg-gray-800 dark:text-black" />
                  </Form.Item>

                  <Form.Item label="Treatment Plan" name="treatment_plan">
                    <TextArea rows={2} className="dark:bg-gray-800 dark:text-black" />
                  </Form.Item>
                </div>
              </Col>
              
              <Col span={12}>
                <div className="space-y-4">
                  <Form.Item label="Decayed" name="decayed">
                    <Input className="dark:bg-gray-800 dark:text-black" />
                  </Form.Item>

                  <Form.Item label="Grossly Decayed" name="grossly_decayed">
                    <Input className="dark:bg-gray-800 dark:text-black" />
                  </Form.Item>

                  <Form.Item label="Roots Stumps" name="roots_stumps">
                    <Input className="dark:bg-gray-800 dark:text-black" />
                  </Form.Item>

                  <Form.Item label="Other Diagnosis" name="other_diagnosis">
                    <TextArea rows={2} className="dark:bg-gray-800 dark:text-black" />
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </Panel>

          <Panel header="Additional Information" key="3">
            <Form.Item label="Documents" name="documents">
              <Upload>
                <Button icon={<UploadOutlined />}>Upload Documents</Button>
              </Upload>
            </Form.Item>
          </Panel>
        </Collapse>

        <Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddPatientModal;
