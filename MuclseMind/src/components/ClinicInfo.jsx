import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Table, Upload, DatePicker, List, Typography, message, TimePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getOperatingHours, updateOperatingHours,getTreatments, addTreatment, editTreatment, deleteTreatment  } from '../api.services/services';
import { getMedications, addMedication, editMedication, deleteMedication } from '../api.services/services';
import { getTeamMembers, addTeamMember, editTeamMember, deleteTeamMember } from '../api.services/services';

const { Option } = Select;



// Helper function to capitalize day names
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Helper function to generate Google Maps link
const generateGoogleMapsLink = (address) => {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
};

const ClinicInfo = () => {
  const [clinicData, setClinicData] = useState({
    name: 'Smile Dental Clinic',
    tagline: 'Your Smile, Our Priority',
    address: '123 Smile St, Dental City, DC 12345',
    phone: '(123) 456-7890',
    email: 'contact@smiledental.com',
    socialMedia: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
    },
    operatingHours: [],
  });

  const [teamMembers, setTeamMembers] = useState();

  const [treatments, setTreatments] = useState([]);

  const [medications, setMedications] = useState([]);
  const [isMedicationModal, setIsMedicationModal] = useState(false);
  const [editMedicationData, setEditMedicationData] = useState(null);

  const [specialHolidays, setSpecialHolidays] = useState([]);
  const [otherClinicInfo, setOtherClinicInfo] = useState({
    licenseNumber: '',
    insuranceProviders: '',
    emergencyContact: '',
    languagesSpoken: '',
    paymentMethods: '',
    parkingInfo: '',
    accessibilityFeatures: '',
    patientReviews: '',
    appointmentBooking: '',
    specialServices: '',
  });

  // Modal visibility states
  const [isEditClinicModal, setIsEditClinicModal] = useState(false);
  const [isEditOperatingHoursModal, setIsEditOperatingHoursModal] = useState(false);
  const [isHolidayModalVisible, setIsHolidayModalVisible] = useState(false);
  const [isEditOtherInfoModal, setIsEditOtherInfoModal] = useState(false);
  const [isTreatmentModalVisible, setIsTreatmentModalVisible] = useState(false);
  const [isTeamMemberModalVisible, setIsTeamMemberModalVisible] = useState(false);
  const [editHoliday, setEditHoliday] = useState(null);
  const [editTreatmentData, setEditTreatmentData] = useState(null);
  const [editTeamMemberData, setEditTeamMemberData] = useState(null);

  useEffect(() => {
    const fetchOperatingHours = async () => {
      try {
        const response = await getOperatingHours();
        if (response.success) {
          setClinicData(prev => ({ ...prev, operatingHours: response.data }));
        } else {
          message.error('Failed to fetch operating hours');
        }
      } catch (error) {
        message.error('Error fetching operating hours');
      }
    };

    fetchOperatingHours();
  }, []);

  const fetchTreatments = async () => {
    try {
      const response = await getTreatments();
      if (response.success) {
        setTreatments(response.data);
      } else {
        message.error('Failed to fetch treatments');
      }
    } catch (error) {
      message.error('Error fetching treatments');
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  const handleSaveOperatingHours = async (values) => {
    try {
      const updatedData = Object.entries(values).map(([day, { status, open, close }]) => ({
        day: day.toLowerCase(),
        status: status || 'closed',
        open_time: open || null,
        close_time: close || null,
      }));

      const response = await updateOperatingHours(updatedData);
      if (response.success) {
        message.success('Operating hours updated successfully');
        setClinicData(prev => ({ ...prev, operatingHours: updatedData }));
      } else {
        message.error('Failed to update operating hours');
      }
    } catch (error) {
      message.error('Error updating operating hours');
    } finally {
      setIsEditOperatingHoursModal(false);
    }
  };

  const handleEditTreatment = (record) => {
    setEditTreatmentData(record);
    setIsTreatmentModalVisible(true);
  };

  const handleAddOrEditTreatment = async (values) => {
    try {
      const payload = {
        ...values,
        procedure_name: values.procedure_name,
        duration: String(values.duration),
      };
      delete payload.name; // Remove 'name' if it exists

      let response;
      if (editTreatmentData) {
        response = await editTreatment(editTreatmentData.id, payload);
        if (response.success) {
          message.success('Treatment updated successfully');
        } else {
          message.error('Failed to update treatment');
        }
      } else {
        response = await addTreatment(payload);
        if (response.success) {
          message.success('Treatment added successfully');
        } else {
          message.error('Failed to add treatment');
        }
      }
      fetchTreatments();
    } catch (error) {
      message.error('Error saving treatment');
    } finally {
      setEditTreatmentData(null);
      setIsTreatmentModalVisible(false);
    }
  };

  const handleDeleteTreatment = async (id) => {
    try {
      const response = await deleteTreatment(id);
      if (response.success) {
        message.success('Treatment deleted successfully');
        setTreatments(treatments.filter(t => t.id !== id));
      } else {
        message.error('Failed to delete treatment');
      }
    } catch (error) {
      message.error('Error deleting treatment');
    }
  };

  const fetchMedications = async () => {
    try {
      const response = await getMedications();
      if (response.success) {
        // Parse the dosage JSON string into an object
        const medicationsWithParsedDosage = response.data.map(medication => ({
          ...medication,
          dosage: JSON.parse(medication.dosage)
        }));
        setMedications(medicationsWithParsedDosage);
      } else {
        message.error('Failed to fetch medications');
      }
    } catch (error) {
      message.error('Error fetching medications');
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleAddOrEditMedication = async (values) => {
    try {
      let response;
      if (editMedicationData) {
        response = await editMedication(editMedicationData.id, values);
        if (response.success) {
          message.success('Medication updated successfully');
        } else {
          message.error('Failed to update medication');
        }
      } else {
        response = await addMedication(values);
        if (response.success) {
          message.success('Medication added successfully');
        } else {
          message.error('Failed to add medication');
        }
      }
      fetchMedications();
    } catch (error) {
      message.error('Error saving medication');
    } finally {
      setEditMedicationData(null);
      setIsMedicationModal(false);
    }
  };

  const handleDeleteMedication = async (id) => {
    try {
      const response = await deleteMedication(id);
      if (response.success) {
        message.success('Medication deleted successfully');
        fetchMedications();
      } else {
        message.error('Failed to delete medication');
      }
    } catch (error) {
      message.error('Error deleting medication');
    }
  };

  const handleEditMedication = (record) => {
    setEditMedicationData(record);
    setIsMedicationModal(true);
  };

  const handleAddTeamMember = () => {
    setEditTeamMemberData(null);
    setIsTeamMemberModalVisible(true);
  };

  const handleEditTeamMember = (member) => {
    setEditTeamMemberData(member);
    setIsTeamMemberModalVisible(true);
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await getTeamMembers();
      if (response.success) {
        setTeamMembers(response.data);
      } else {
        message.error('Failed to fetch team members');
      }
    } catch (error) {
      message.error('Error fetching team members');
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleAddOrEditTeamMember = async (values) => {
    try {
      let response;
      if (editTeamMemberData) {
        response = await editTeamMember(editTeamMemberData.id, values);
        if (response.success) {
          message.success('Team member updated successfully');
        } else {
          message.error('Failed to update team member');
        }
      } else {
        response = await addTeamMember(values);
        if (response.success) {
          message.success('Team member added successfully');
        } else {
          message.error('Failed to add team member');
        }
      }
      fetchTeamMembers(); // Refetch team members after add/edit
    } catch (error) {
      message.error('Error saving team member');
    } finally {
      setEditTeamMemberData(null);
      setIsTeamMemberModalVisible(false);
    }
  };

  const handleDeleteTeamMember = async (id) => {
    try {
      const response = await deleteTeamMember(id);
      if (response.success) {
        message.success('Team member deleted successfully');
        fetchTeamMembers(); // Refetch team members after delete
      } else {
        message.error('Failed to delete team member');
      }
    } catch (error) {
      message.error('Error deleting team member');
    }
  };

  // Render functions for each section
  const renderClinicOverviewAndContact = () => (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Clinic Overview & Contact Information</h2>
        <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditClinicModal(true)}>
          Edit
        </Button>
      </div>
      <p><strong>Name:</strong> {clinicData.name}</p>
      <p><strong>Tagline:</strong> {clinicData.tagline}</p>
      <p><strong>Address:</strong> {clinicData.address}</p>
      <p>
        <a 
          href={clinicData.gmapLink || generateGoogleMapsLink(clinicData.address)} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-500"
        >
          View on Google Maps
        </a>
      </p>
      <p><strong>Phone:</strong> {clinicData.phone}</p>
      <p><strong>Email:</strong> {clinicData.email}</p>
      <p>
        <strong>Social Media:</strong> 
        <a href={clinicData.socialMedia.facebook} className="text-blue-500">Facebook</a>, 
        <a href={clinicData.socialMedia.instagram} className="text-blue-500">Instagram</a>
      </p>
    </section>
  );

  const renderOperatingHours = () => (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Operating Hours</h2>
        <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditOperatingHoursModal(true)}>
          Edit
        </Button>
      </div>
      <Table
        dataSource={clinicData.operatingHours.map((entry, index) => ({
          key: index,
          day: capitalize(entry.day),
          status: entry.status,
          open: entry.open_time ? entry.open_time.slice(0, 5) : 'N/A',
          close: entry.close_time ? entry.close_time.slice(0, 5) : 'N/A',
        }))}
        columns={[
          { title: 'Day', dataIndex: 'day', key: 'day' },
          { title: 'Status', dataIndex: 'status', key: 'status' },
          { title: 'Open', dataIndex: 'open', key: 'open' },
          { title: 'Close', dataIndex: 'close', key: 'close' },
        ]}
        pagination={false}
      />
    </section>
  );

  const renderHolidays = () => (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Holidays</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsHolidayModalVisible(true)}>
          Add Holiday
        </Button>
      </div>
      <Table
        dataSource={specialHolidays.map((holiday, index) => ({
          key: index,
          reason: holiday.reason,
          date: moment(holiday.date).format('MMMM Do, YYYY'),
        }))}
        columns={[
          { title: 'Reason', dataIndex: 'reason', key: 'reason' },
          { title: 'Date', dataIndex: 'date', key: 'date' },
          {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
              <Button type="link" icon={<EditOutlined />} onClick={() => handleEditHoliday(record)}>
                Edit
              </Button>
            ),
          },
        ]}
        pagination={false}
      />
    </section>
  );

  const renderDentalTeam = () => (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Dental Team</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTeamMember}>
          Add Team Member
        </Button>
      </div>
      <Table
        dataSource={teamMembers}
        columns={[
          { title: 'Name', dataIndex: 'name', key: 'name' },
          { title: 'Qualifications', dataIndex: 'qualifications', key: 'qualifications' },
          { title: 'Experience', dataIndex: 'experience', key: 'experience' },
          {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
              <Button type="link" onClick={() => handleEditTeamMember(record)}>
                Edit
              </Button>
            ),
          },
        ]}
        pagination={false}
      />
    </section>
  );

  const renderTreatments = () => (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Treatment Procedures & Fees</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsTreatmentModalVisible(true)}>
          Add Treatment
        </Button>
      </div>
      <Table
        dataSource={treatments}
        columns={[
          { title: 'Category', dataIndex: 'category', key: 'category' },
          { title: 'Procedure Name', dataIndex: 'procedure_name', key: 'name' },
          { title: 'Cost', dataIndex: 'cost', key: 'cost' },
          { title: 'Duration', dataIndex: 'duration', key: 'duration' },
          {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
              <Button type="link" icon={<EditOutlined />} onClick={() => handleEditTreatment(record)}>
                Edit
              </Button>
            ),
          },
        ]}
        pagination={false}
      />
    </section>
  );
  const renderMedications = () => (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Medication Preferences</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsMedicationModal(true)}>
          Add Medication
        </Button>
      </div>
      <Table
        dataSource={medications}
        columns={[
          { title: 'Condition', dataIndex: 'condition', key: 'condition' },
          { title: 'Medication Name', dataIndex: 'name', key: 'name' },
          { title: 'Brand Preference', dataIndex: 'brand', key: 'brand' },
          { title: 'Dosage', dataIndex: 'dosage', key: 'dosage', render: (dosage) => (
            <>
              <strong>Adult:</strong> {dosage.adult}<br />
              <strong>Child:</strong> {dosage.child}<br />
              <strong>Infant:</strong> {dosage.infant}
            </>
          ) },
          {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
              <Button type="link" icon={<EditOutlined />} onClick={() => handleEditMedication(record)}>
                Edit
              </Button>
            ),
          },
        ]}
        pagination={false}
      />
    </section>
  );

  const renderOtherClinicInfo = () => (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Other Clinic Information</h2>
        <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditOtherInfoModal(true)}>
          Edit
        </Button>
      </div>
      <p><strong>License Number:</strong> {otherClinicInfo.licenseNumber}</p>
      <p><strong>Insurance Providers:</strong> {otherClinicInfo.insuranceProviders}</p>
      <p><strong>Emergency Contact:</strong> {otherClinicInfo.emergencyContact}</p>
      <p><strong>Languages Spoken:</strong> {otherClinicInfo.languagesSpoken}</p>
      <p><strong>Payment Methods:</strong> {otherClinicInfo.paymentMethods}</p>
      <p><strong>Parking Information:</strong> {otherClinicInfo.parkingInfo}</p>
      <p><strong>Accessibility Features:</strong> {otherClinicInfo.accessibilityFeatures}</p>
      <p><strong>Patient Reviews:</strong> {otherClinicInfo.patientReviews}</p>
      <p><strong>Appointment Booking:</strong> {otherClinicInfo.appointmentBooking}</p>
      <p><strong>Special Services:</strong> {otherClinicInfo.specialServices}</p>
    </section>
  );

  // Modal components for editing and adding
  const EditClinicModal = () => (
    <Modal
      title="Edit Clinic Information"
      open={isEditClinicModal}
      onCancel={() => setIsEditClinicModal(false)}
      footer={null}
    >
      <Form
        initialValues={clinicData}
        onFinish={(values) => {
          setClinicData(values);
          setIsEditClinicModal(false);
        }}
      >
        <Form.Item name="name" label="Clinic Name">
          <Input />
        </Form.Item>
        <Form.Item name="tagline" label="Tagline">
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input />
        </Form.Item>
        <Form.Item name="gmapLink" label="Google Maps Link">
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input />
        </Form.Item>
        <Form.Item name={['socialMedia', 'facebook']} label="Facebook">
          <Input />
        </Form.Item>
        <Form.Item name={['socialMedia', 'instagram']} label="Instagram">
          <Input />
        </Form.Item>
        <div className="flex justify-end space-x-2">
          <Button onClick={() => setIsEditClinicModal(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit">Save</Button>
        </div>
      </Form>
    </Modal>
  );

  const EditOperatingHoursModal = () => (
    <Modal
      title="Edit Operating Hours"
      open={isEditOperatingHoursModal}
      onCancel={() => setIsEditOperatingHoursModal(false)}
      footer={null}
    >
      <Form
        initialValues={clinicData.operatingHours.reduce((acc, { day, status, open_time, close_time }) => {
          acc[day] = { status, open: open_time, close: close_time };
          return acc;
        }, {})}
        onFinish={handleSaveOperatingHours}
        layout="vertical"
      >
        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
          <div key={day} className="flex items-center space-x-4 mb-4">
            <Form.Item
              name={[day, 'status']}
              label={`${capitalize(day)} Status`}
              className="flex-1"
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
            >
              <Input type="time" />
            </Form.Item>
            <Form.Item
              name={[day, 'close']}
              label={`${capitalize(day)} Close`}
              className="flex-1"
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
  );

  // Render the Add/Edit Holiday Modal
  const renderAddHolidayModal = () => (
    <Modal
      title={editHoliday ? "Edit Holiday" : "Add Holiday"}
      visible={isHolidayModalVisible}
      onCancel={() => {
        setEditHoliday(null);
        setIsHolidayModalVisible(false);
      }}
      footer={null}
    >
      <Form
        initialValues={editHoliday || { reason: '', date: null }}
        onFinish={(values) => {
          if (editHoliday) {
            // Update existing holiday
            setSpecialHolidays((prev) =>
              prev.map((holiday) =>
                holiday.key === editHoliday.key ? { ...holiday, ...values } : holiday
              )
            );
          } else {
            // Add new holiday
            setSpecialHolidays([...specialHolidays, { ...values, key: Date.now() }]);
          }
          setEditHoliday(null);
          setIsHolidayModalVisible(false);
        }}
        layout="vertical"
      >
        <Form.Item
          name="reason"
          label="Reason for Holiday"
          rules={[{ required: true, message: 'Please enter a reason!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: 'Please select a date!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <div className="flex justify-end space-x-2">
          <Button onClick={() => setIsHolidayModalVisible(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit">{editHoliday ? "Save" : "Add"}</Button>
        </div>
      </Form>
    </Modal>
  );

  const EditOtherInfoModal = () => (
    <Modal
      title="Edit Other Clinic Information"
      open={isEditOtherInfoModal}
      onCancel={() => setIsEditOtherInfoModal(false)}
      footer={null}
    >
      <Form
        initialValues={otherClinicInfo}
        onFinish={(values) => {
          setOtherClinicInfo(values);
          setIsEditOtherInfoModal(false);
        }}
        layout="vertical"
      >
        <Form.Item name="licenseNumber" label="License Number">
          <Input />
        </Form.Item>
        <Form.Item name="insuranceProviders" label="Insurance Providers">
          <Input />
        </Form.Item>
        <Form.Item name="emergencyContact" label="Emergency Contact">
          <Input />
        </Form.Item>
        <Form.Item name="languagesSpoken" label="Languages Spoken">
          <Input />
        </Form.Item>
        <Form.Item name="paymentMethods" label="Payment Methods">
          <Input />
        </Form.Item>
        <Form.Item name="parkingInfo" label="Parking Information">
          <Input />
        </Form.Item>
        <Form.Item name="accessibilityFeatures" label="Accessibility Features">
          <Input />
        </Form.Item>
        <Form.Item name="patientReviews" label="Patient Reviews">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="appointmentBooking" label="Appointment Booking">
          <Input />
        </Form.Item>
        <Form.Item name="specialServices" label="Special Services">
          <Input />
        </Form.Item>
        <div className="flex justify-end space-x-2">
          <Button onClick={() => setIsEditOtherInfoModal(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit">Save</Button>
        </div>
      </Form>
    </Modal>
  );

  const TreatmentForm = () => (
    <Modal
      title={editTreatmentData ? "Edit Treatment Procedure" : "Add Treatment Procedure"}
      open={isTreatmentModalVisible}
      onCancel={() => {
        setEditTreatmentData(null);
        setIsTreatmentModalVisible(false);
      }}
      footer={null}
    >
      <Form
        initialValues={editTreatmentData || { category: '', procedure_name: '', cost: '', duration: '' }}
        onFinish={handleAddOrEditTreatment}
        layout="vertical"
      >
        <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select a category!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="procedure_name" label="Procedure Name" rules={[{ required: true, message: 'Please enter a procedure name!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="cost" label="Cost" rules={[{ required: true, message: 'Please enter a cost!' }]}>
          <InputNumber prefix="$" />
        </Form.Item>
        <Form.Item name="duration" label="Duration" rules={[{ required: true, message: 'Please select a duration!' }]}>
          <Select placeholder="Select duration">
            <Option value="30 mins">30 mins</Option>
            <Option value="45 mins">45 mins</Option>
            <Option value="1 hr">1 hr</Option>
            <Option value="1.30 hr">1.30 hr</Option>
            <Option value="2 hr">2 hr</Option>
            <Option value="2.5 hr">2.5 hr</Option>
            <Option value="3 hr">3 hr</Option>
            {/* Add more options as needed */}
          </Select>
        </Form.Item>
        <div className="flex justify-end space-x-2">
          <Button onClick={() => setIsTreatmentModalVisible(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit">Save</Button>
          {editTreatmentData && (
            <Button type="danger" onClick={() => handleDeleteTreatment(editTreatmentData.id)}>Delete</Button>
          )}
        </div>
      </Form>
    </Modal>
  );

  const MedicationForm = () => (
    <Modal
      title={editMedicationData ? "Edit Medication Preference" : "Add Medication Preference"}
      open={isMedicationModal}
      onCancel={() => {
        setEditMedicationData(null);
        setIsMedicationModal(false);
      }}
      footer={null}
    >
      <Form
        initialValues={editMedicationData || { condition: '', name: '', brand: '', dosage: { adult: '', child: '', infant: '' } }}
        onFinish={handleAddOrEditMedication}
        layout="vertical"
      >
        <Form.Item name="condition" label="Medical Condition" rules={[{ required: true, message: 'Please enter a medical condition!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="name" label="Medication Name" rules={[{ required: true, message: 'Please enter a medication name!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="brand" label="Preferred Brand" rules={[{ required: true, message: 'Please enter a preferred brand!' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Dosage by Age Group">
          <Form.Item name={['dosage', 'adult']} label="Adult" rules={[{ required: true, message: 'Please enter dosage for adults!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name={['dosage', 'child']} label="Child" rules={[{ required: true, message: 'Please enter dosage for children!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name={['dosage', 'infant']} label="Infant" rules={[{ required: true, message: 'Please enter dosage for infants!' }]}>
            <Input />
          </Form.Item>
        </Form.Item>
        <div className="flex justify-end space-x-2">
          <Button onClick={() => setIsMedicationModal(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit">Save</Button>
          {editMedicationData && (
            <Button type="danger" onClick={() => handleDeleteMedication(editMedicationData.id)}>Delete</Button>
          )}
        </div>
      </Form>
    </Modal>
  );

  const TeamMemberForm = () => (
    <Modal
      title={editTeamMemberData ? "Edit Team Member" : "Add Team Member"}
      visible={isTeamMemberModalVisible}
      onCancel={() => setIsTeamMemberModalVisible(false)}
      footer={null}
    >
      <Form
        initialValues={editTeamMemberData || { name: '', qualifications: '', experience: '', image: '' }}
        onFinish={handleAddOrEditTeamMember}
        layout="vertical"
      >
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="qualifications" label="Qualifications" rules={[{ required: true, message: 'Please enter qualifications!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="experience" label="Experience" rules={[{ required: true, message: 'Please enter experience!' }]}>
          <Input />
        </Form.Item>
        <div className="flex justify-end space-x-2">
          <Button onClick={() => setIsTeamMemberModalVisible(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit">Save</Button>
          {editTeamMemberData && (
            <Button type="danger" onClick={() => confirmDeleteTeamMember(editTeamMemberData.id)}>Delete</Button>
          )}
        </div>
      </Form>
    </Modal>
  );

  // Function to confirm and handle deletion
  const confirmDeleteTeamMember = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this team member?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'No, cancel',
      onOk: async () => {
        try {
          const response = await deleteTeamMember(id);
          if (response.success) {
            message.success('Team member deleted successfully');
            fetchTeamMembers(); // Refresh the list after deletion
            setIsTeamMemberModalVisible(false);
          } else {
            message.error('Failed to delete team member');
          }
        } catch (error) {
          message.error('Error deleting team member');
        }
      },
      onCancel() {
        console.log('Cancel deletion');
      },
    });
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white dark:bg-boxdark shadow-md rounded-lg">
      {renderClinicOverviewAndContact()}
      {renderOperatingHours()}
      {renderHolidays()}
      {renderDentalTeam()}
      {renderTreatments()}
      {renderMedications()}
      {renderOtherClinicInfo()}

      {/* Modals */}
      <EditClinicModal />
      <EditOperatingHoursModal />
      {renderAddHolidayModal()}
      <EditOtherInfoModal />
      <TreatmentForm />
      <MedicationForm />
      <TeamMemberForm />
    </div>
  );
};

export default ClinicInfo;