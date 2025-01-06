import React, { useEffect, useState } from 'react';
import { Modal, Form, DatePicker, TimePicker, Button, Select, message } from 'antd';
import moment from 'moment';
import { updateAppointment, getPatients, getTreatments, getTeamMembers } from '../api.services/services'; // Import necessary services

const { Option } = Select;

const EditAppointmentModal = ({ visible, onClose, onEdit, appointment }) => {
  const [form] = Form.useForm();
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [carePersons, setCarePersons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchPatients();
      fetchTreatments();
      fetchCarePersons();
      form.setFieldsValue({
        ...appointment,
        date: moment(appointment.date),
        time: moment(appointment.time, 'HH:mm'),
        care_person: appointment.care_person
      });
    }
  }, [visible, appointment]);

  const fetchPatients = async () => {
    try {
      const response = await getPatients();
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      message.error('Failed to fetch patients: ' + error.message);
    }
  };

  const fetchTreatments = async () => {
    try {
      const response = await getTreatments();
      if (response.success) {
        setTreatments(response.data);
      }
    } catch (error) {
      message.error('Failed to fetch treatments: ' + error.message);
    }
  };

  const fetchCarePersons = async () => {
    try {
      const response = await getTeamMembers();
      if (response.success) {
        setCarePersons(response.data);
      }
    } catch (error) {
      message.error('Failed to fetch care persons: ' + error.message);
    }
  };

  const handleFinish = async (values) => {
    if (loading) return; // Prevent double submission
    try {
      setLoading(true);
      
      const selectedPatient = patients.find(p => p.id === values.patient) || 
        { id: appointment.patient_id, name: appointment.patient_name };
        
      const selectedTreatment = treatments.find(t => t.treatment_id === values.treatment) || 
        { treatment_id: appointment.treatment_id, procedure_name: appointment.treatment_name };

      const updatedData = {
        patient_id: selectedPatient.id.toString(), // Ensure UUID is string
        patient_name: selectedPatient.name,
        treatment_id: Number(selectedTreatment.treatment_id), // Ensure number
        treatment_name: selectedTreatment.procedure_name,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
        status: values.status,
        user_id: appointment.user_id?.toString(), // Ensure UUID is string
        duration: Number(appointment.duration), // Ensure number
        care_person: values.care_person
      };

      console.log('Updating appointment with:', updatedData);

      const response = await updateAppointment(appointment.id, updatedData);
      if (response.success) {
        message.success(response.message);
        onEdit(response.data);
        onClose();
      } else {
        throw new Error(response.error || response.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      message.error(error.message || 'Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  // Disable past dates
  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };

  return (
    <Modal
      title="Edit Appointment"
      visible={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      maskClosable={false}  // Prevent closing by clicking outside
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onFinishFailed={(errorInfo) => {
          console.log('Failed:', errorInfo);
        }}
        initialValues={{
          patient: appointment.patient_id,
          treatment: appointment.treatment_id,
          date: moment(appointment.date),
          time: moment(appointment.time, 'HH:mm'),
          status: appointment.status,
          care_person: appointment.care_person
        }}
      >
        <Form.Item
          label="Patient"
          name="patient"
          rules={[{ required: true, message: 'Please select a patient' }]}
        >
          <Select
            placeholder="Select a patient"
            style={{ width: '100%' }}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {patients.map((patient) => (
              <Option key={patient.id} value={patient.id}>
                {`${patient.patient_id} - ${patient.name}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Treatment"
          name="treatment"
          rules={[{ required: true, message: 'Please select a treatment' }]}
        >
          <Select
            placeholder="Select a treatment"
            style={{ width: '100%' }}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {treatments.map((treatment) => (
              <Option 
                key={treatment.treatment_id} 
                value={treatment.treatment_id}
              >
                {`${treatment.procedure_name}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: 'Please select the date' }]}
        >
          <DatePicker style={{ width: '100%' }} disabledDate={disabledDate} />
        </Form.Item>
        <Form.Item
          label="Time"
          name="time"
          rules={[{ required: true, message: 'Please select the time' }]}
        >
          <TimePicker style={{ width: '100%' }} format="h:mm a" use12Hours />
        </Form.Item>
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: 'Please select the status' }]}
        >
          <Select>
            <Option value="Scheduled">Scheduled</Option>
            <Option value="Completed">Completed</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label={<span style={{ fontWeight: 'bold' }}>Care of</span>}
          name="care_person"
          rules={[{ required: true, message: 'Please select a care person' }]}
        >
          <Select
            showSearch
            placeholder="Search and select care person"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: '100%' }}
          >
            {carePersons.map((doctor) => (
              <Option key={doctor.name} value={doctor.name}>
                {doctor.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            disabled={loading}  // Disable button while loading
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditAppointmentModal;