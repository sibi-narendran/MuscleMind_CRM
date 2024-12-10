import React from "react";
import { Modal, Input, Select, Form, Button, Upload, Row, Col, Radio } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const CARE_PERSONS = [
  "Dr. John Smith",
  "Dr. Sarah Wilson",
  "Dr. Michael Brown",
  "Dr. Emily Davis",
];

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
      case_sheet_file: values.case_sheet_file,
      jotform_link: values.jotform_link,
      documents: values.documents || [],
    };
    onAdd(newPatient);
  };

  return (
    <Modal
      title="Add Patient"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={520}
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
          label="Email"
          name="email"
          rules={[{ type: "email", message: "Please enter a valid email" }]}
        >
          <Input
            placeholder="Email"
            className="dark:bg-gray-800 dark:text-black"
          />
        </Form.Item>
        <Form.Item label="Notes" name="notes">
          <TextArea
            placeholder="Notes"
            rows={4}
            className="dark:bg-gray-800 dark:text-black"
          />
        </Form.Item>
        <Form.Item
          label="Care of"
          name="care_person"
          rules={[{ required: true, message: "Please select a care person" }]}
        >
          <Select
            placeholder="Care of"
            className="dark:bg-gray-800 dark:text-black"
          >
            {CARE_PERSONS.map((doctor) => (
              <Option key={doctor} value={doctor}>
                {doctor}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Case Sheet">
          <Row gutter={16}>
            <Col span={12}>
              <Upload name="case_sheet_file">
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
        <Form.Item label="Documents" name="documents">
          <Upload>
            <Button icon={<UploadOutlined />}>Upload Documents</Button>
          </Upload>
        </Form.Item>
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
