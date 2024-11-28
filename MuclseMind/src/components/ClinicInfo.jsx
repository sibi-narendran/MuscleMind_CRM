import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import { Button, Modal, Input, Upload, Form, InputNumber, Select, DatePicker, List, Typography } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

const ClinicInfo = () => {
  // Default operating hours
  const defaultOperatingHours = {
    monday: { status: 'open', open: '10:00', close: '18:30' },
    tuesday: { status: 'open', open: '10:00', close: '18:30' },
    wednesday: { status: 'open', open: '10:00', close: '18:30' },
    thursday: { status: 'open', open: '10:00', close: '18:30' },
    friday: { status: 'open', open: '10:00', close: '18:30' },
    saturday: { status: 'open', open: '10:00', close: '18:30' },
    sunday: { status: 'open', open: '10:00', close: '18:30' },
  };

  // Extended clinic data state
  const [clinicData, setClinicData] = useState({
    name: 'Smile Dental Clinic',
    tagline: 'Your Smile, Our Priority',
    description: 'We are committed to providing the best dental care...',
    operatingHours: defaultOperatingHours,
    address: '123 Smile St, Dental City, DC 12345',
    phone: '(123) 456-7890',
    email: 'contact@smiledental.com',
    socialMedia: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
    },
    location: {
      latitude: 0,
      longitude: 0,
    },
    photos: [],
  });

  // Treatment fees and procedures state
  const [treatments, setTreatments] = useState([
    {
      category: 'General Dentistry',
      procedures: [
        { name: 'Dental Checkup', cost: 50, duration: '30 mins' },
        { name: 'Teeth Cleaning', cost: 80, duration: '45 mins' },
      ],
    },
    // ... other categories
  ]);

  // Preferred medications state
  const [medications, setMedications] = useState([
    {
      condition: 'Post Extraction Pain',
      medications: [
        {
          name: 'Ibuprofen',
          brandPreference: 'Brufen',
          dosageByAge: {
            adult: '400mg 3 times daily',
            child: '200mg 3 times daily',
            infant: 'Not recommended',
          },
        },
      ],
    },
  ]);

  // Modal states
  const [isEditClinicModal, setIsEditClinicModal] = useState(false);
  const [isTreatmentModal, setIsTreatmentModal] = useState(false);
  const [isMedicationModal, setIsMedicationModal] = useState(false);
  const [isEditOperatingHoursModal, setIsEditOperatingHoursModal] = useState(false);

  // State for special holidays
  const [specialHolidays, setSpecialHolidays] = useState([]);
  const [isHolidayModalVisible, setIsHolidayModalVisible] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ reason: '', date: null });
  const [isHolidayListVisible, setIsHolidayListVisible] = useState(false);

  // Function to add a new holiday
  const addSpecialHoliday = () => {
    if (newHoliday.reason && newHoliday.date) {
      setSpecialHolidays([...specialHolidays, newHoliday]);
      setNewHoliday({ reason: '', date: null });
      setIsHolidayModalVisible(false);
    }
  };

  // Function to remove past holidays
  const removePastHolidays = () => {
    const today = moment();
    setSpecialHolidays(specialHolidays.filter(holiday => moment(holiday.date).isSameOrAfter(today, 'day')));
  };

  // Effect to remove past holidays on component mount
  useEffect(() => {
    removePastHolidays();
  }, []);

  // Render special holidays section
  const renderSpecialHolidays = () => (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Special Holidays</h2>
      <List
        bordered
        dataSource={specialHolidays}
        renderItem={holiday => (
          <List.Item className="bg-white dark:bg-boxdark text-black dark:text-white">
            <strong>{holiday.reason}</strong> - {moment(holiday.date).format('MMMM Do, YYYY')}
          </List.Item>
        )}
      />
    </section>
  );

  // Render the Add Holiday Modal
  const renderAddHolidayModal = () => (
    <Modal
      title="Add Holiday"
      visible={isHolidayModalVisible}
      onCancel={() => setIsHolidayModalVisible(false)}
      footer={null}
    >
      <div className="flex flex-col space-y-4">
        <Input
          placeholder="Reason for Holiday"
          value={newHoliday.reason}
          onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
        />
        <DatePicker
          style={{ width: '100%' }}
          value={newHoliday.date}
          onChange={(date) => setNewHoliday({ ...newHoliday, date })}
          placeholder="Select Date"
        />
        <Button type="primary" onClick={addSpecialHoliday} block>
          Add Holiday
        </Button>
        <Button
          type="default"
          onClick={() => setIsHolidayListVisible(!isHolidayListVisible)}
          block
        >
          {isHolidayListVisible ? 'Hide Holidays' : 'Show All Holidays'}
        </Button>
        {isHolidayListVisible && (
          <List
            bordered
            dataSource={specialHolidays}
            renderItem={holiday => (
              <List.Item>
                <Typography.Text strong>{holiday.reason}</Typography.Text> - {moment(holiday.date).format('MMMM Do, YYYY')}
              </List.Item>
            )}
            style={{ marginTop: '10px' }}
          />
        )}
      </div>
    </Modal>
  );

  // Add new treatment procedure
  const addTreatment = (values) => {
    const { category, procedureName, cost, duration } = values;
    setTreatments(prev => {
      const categoryIndex = prev.findIndex(c => c.category === category);
      if (categoryIndex === -1) {
        return [...prev, {
          category,
          procedures: [{ name: procedureName, cost, duration }]
        }];
      }
      
      const updated = [...prev];
      updated[categoryIndex].procedures.push({ name: procedureName, cost, duration });
      return updated;
    });
    setIsTreatmentModal(false);
  };

  // Treatment Form
  const TreatmentForm = () => (
    <Form onFinish={addTreatment}>
      <Form.Item name="category" label="Category">
        <Select
          placeholder="Select or enter category"
          allowClear
          showSearch
          allowCreate
        >
          {treatments.map(t => (
            <Option key={t.category} value={t.category}>{t.category}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="procedureName" label="Procedure Name">
        <Input />
      </Form.Item>
      <Form.Item name="cost" label="Cost">
        <InputNumber prefix="$" />
      </Form.Item>
      <Form.Item name="duration" label="Duration">
        <Input placeholder="e.g., 30 mins" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );

  // Add new medication preference
  const addMedication = (values) => {
    setMedications(prev => [...prev, values]);
    setIsMedicationModal(false);
  };

  // Medication Form
  const MedicationForm = () => (
    <Form onFinish={addMedication}>
      <Form.Item name="condition" label="Medical Condition">
        <Input />
      </Form.Item>
      <Form.Item name="medicationName" label="Medication Name">
        <Input />
      </Form.Item>
      <Form.Item name="brandPreference" label="Preferred Brand">
        <Input />
      </Form.Item>
      <Form.Item label="Dosage by Age Group">
        <Form.Item name={['dosage', 'adult']} label="Adult">
          <Input />
        </Form.Item>
        <Form.Item name={['dosage', 'child']} label="Child">
          <Input />
        </Form.Item>
        <Form.Item name={['dosage', 'infant']} label="Infant">
          <Input />
        </Form.Item>
      </Form.Item>
    </Form>
  );

  // Render treatment procedures section
  const renderTreatments = () => (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Treatment Procedures & Fees</h2>
        <Button type="primary" onClick={() => setIsTreatmentModal(true)}>
          Add Procedure
        </Button>
      </div>
      {treatments.map((category, idx) => (
        <div key={idx} className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{category.category}</h3>
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Procedure</th>
                <th className="px-4 py-2 border-b">Cost</th>
                <th className="px-4 py-2 border-b">Duration</th>
                <th className="px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {category.procedures.map((proc, pIdx) => (
                <tr key={pIdx} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border-b">{proc.name}</td>
                  <td className="px-4 py-2 border-b">${proc.cost}</td>
                  <td className="px-4 py-2 border-b">{proc.duration}</td>
                  <td className="px-4 py-2 border-b">
                    <Button icon={<EditOutlined />} size="small" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );

  // Sample data for the table
  const data = React.useMemo(
    () => [
      { service: 'General Dentistry', patients: 120 },
      { service: 'Teeth Whitening', patients: 80 },
      { service: 'Dental Implants', patients: 50 },
      { service: 'Braces', patients: 30 },
      { service: 'Pediatric Dentistry', patients: 60 },
    ],
    []
  );

  // Define columns for the table
  const columns = React.useMemo(
    () => [
      { Header: 'Service', accessor: 'service' },
      { Header: 'Patients', accessor: 'patients' },
    ],
    []
  );

  // Use the useTable hook
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  // State for team members
  const [teamMembers, setTeamMembers] = useState([
    {
      name: 'Dr. John Doe',
      qualifications: 'DDS, Specialist in Orthodontics',
      experience: '10 years',
      image: 'https://via.placeholder.com/100',
    },
    {
      name: 'Dr. Jane Smith',
      qualifications: 'DDS, Specialist in Pediatric Dentistry',
      experience: '8 years',
      image: 'https://via.placeholder.com/100',
    },
    {
      name: 'Dr. Emily White',
      qualifications: 'DDS, Specialist in Cosmetic Dentistry',
      experience: '5 years',
      image: 'https://via.placeholder.com/100',
    },
  ]);

  // State for modal visibility
  const [isModalVisible, setIsModalVisible] = useState(false);

  // State for new member form
  const [newMember, setNewMember] = useState({
    name: '',
    qualifications: '',
    experience: '',
    image: '',
  });

  // Function to handle adding a new team member
  const addTeamMember = () => {
    setTeamMembers([...teamMembers, newMember]);
    setNewMember({ name: '', qualifications: '', experience: '', image: '' });
    setIsModalVisible(false);
  };

  // Function to handle image upload
  const handleImageUpload = ({ file }) => {
    const reader = new FileReader();
    reader.onload = () => {
      setNewMember({ ...newMember, image: reader.result });
    };
    reader.readAsDataURL(file.originFileObj);
  };

  // Function to handle editing clinic data
  const handleEditClinicData = (field, value) => {
    setClinicData(prev => ({ ...prev, [field]: value }));
  };

  // Function to generate Google Maps link
  const generateGoogleMapsLink = (address) => {
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  // Render combined clinic overview and contact information section
  const renderClinicOverviewAndContact = () => (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Clinic Overview & Contact Information</h2>
        <Button type="primary" onClick={() => setIsEditClinicModal(true)}>
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
      <div className="flex flex-col items-start mt-4 space-y-2">
        <Button type="primary" onClick={() => setIsEditOperatingHoursModal(true)} style={{ width: 'auto' }}>
          Edit Operating Hours
        </Button>
        <Button type="primary" onClick={() => setIsHolidayModalVisible(true)} style={{ width: 'auto' }}>
          Add Holiday
        </Button>
      </div>
    </section>
  );

  // State for other clinic information
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

  // State for modal visibility
  const [isEditOtherInfoModal, setIsEditOtherInfoModal] = useState(false);

  // Render other clinic information section
  const renderOtherClinicInfo = () => (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Other Clinic Information</h2>
        <Button type="primary" onClick={() => setIsEditOtherInfoModal(true)}>
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

  // Edit Other Clinic Information Modal
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
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    </Modal>
  );

  // Edit Clinic Modal
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
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    </Modal>
  );

  // Edit Operating Hours Modal
  const EditOperatingHoursModal = () => {
    const [form] = Form.useForm();

    return (
      <Modal
        title="Edit Operating Hours"
        open={isEditOperatingHoursModal}
        onCancel={() => setIsEditOperatingHoursModal(false)}
        footer={null}
      >
        <Form
          form={form}
          initialValues={clinicData.operatingHours}
          onFinish={(values) => {
            setClinicData(prev => ({ ...prev, operatingHours: values }));
            setIsEditOperatingHoursModal(false);
          }}
          layout="vertical"
        >
          {Object.keys(clinicData.operatingHours).map(day => (
            <div key={day} className="flex items-center space-x-4 mb-4">
              <Form.Item
                name={[day, 'status']}
                label={`${capitalize(day)} Status`}
                className="flex-1"
              >
                <Select defaultValue={clinicData.operatingHours[day].status}>
                  <Select.Option value="open">Open</Select.Option>
                  <Select.Option value="closed">Closed</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name={[day, 'open']}
                label={`${capitalize(day)} Open`}
                className="flex-1"
              >
                <Input type="time" defaultValue={clinicData.operatingHours[day].open} />
              </Form.Item>
              <Form.Item
                name={[day, 'close']}
                label={`${capitalize(day)} Close`}
                className="flex-1"
              >
                <Input type="time" defaultValue={clinicData.operatingHours[day].close} />
              </Form.Item>
            </div>
          ))}
          <div className="flex justify-end">
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    );
  };

  // Helper function to capitalize day names
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="max-w-full mx-auto p-6 bg-white dark:bg-boxdark shadow-md rounded-lg">
      {/* Combined Clinic Overview and Contact Information */}
      {renderClinicOverviewAndContact()}

      {/* Dental Team */}
      <section className="mb-8 relative">
        <h2 className="text-2xl font-bold mb-4">Dental Team</h2>
        <Button
          type="primary"
          onClick={() => setIsModalVisible(true)}
          className="absolute top-0 right-0"
        >
          Add Team Member
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-sm">
              <img src={member.image} alt={member.name} className="w-24 h-24 rounded-full mb-4" />
              <div className="text-center">
                <p className="font-bold">{member.name}</p>
                <p className="text-sm text-gray-600">{member.qualifications}</p>
                <p className="text-sm text-gray-600">{member.experience}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Team Member Modal */}
        <Modal
          title="Add Team Member"
          open={isModalVisible}
          onOk={addTeamMember}
          onCancel={() => setIsModalVisible(false)}
          okText="Add"
          cancelText="Cancel"
        >
          <div className="flex flex-col space-y-4">
            <Select
              placeholder="Select Title"
              value={newMember.title}
              onChange={(value) => setNewMember({ ...newMember, title: value })}
            >
              <Select.Option value="mr">Mr.</Select.Option>
              <Select.Option value="ms">Ms.</Select.Option>
              <Select.Option value="dr">Dr.</Select.Option>
            </Select>
            <Input
              placeholder="Name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            />
            <Select
              placeholder="Select Role"
              value={newMember.role}
              onChange={(value) => setNewMember({ ...newMember, role: value })}
            >
              <Select.Option value="doctor">Doctor</Select.Option>
              <Select.Option value="visiting_doctor">Visiting Doctor</Select.Option>
              <Select.Option value="admin_staff">Admin Staff</Select.Option>
            </Select>
            <Input
              placeholder="Specialization (e.g., Orthodontist)"
              value={newMember.specialization}
              onChange={(e) => setNewMember({ ...newMember, specialization: e.target.value })}
            />
            <Input
              placeholder="Email Address"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            />
            <Upload
              name="file"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => false} // Prevent automatic upload
              onChange={handleImageUpload}
            >
              {newMember.image ? (
                <img
                  src={newMember.image}
                  alt="Uploaded"
                  style={{ width: "100%" }}
                />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </div>
        </Modal>
      </section>

      {/* Add Treatment Procedures Section */}
      {renderTreatments()}

      {/* Add Medication Preferences Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black dark:text-white">Medication Preferences</h2>
          <Button type="primary" onClick={() => setIsMedicationModal(true)}>
            Add Medication
          </Button>
        </div>
        {/* Render medication preferences... */}
      </section>

      {/* Special Holidays */}
      {/* {renderSpecialHolidays()} */}

      {/* Other Clinic Information */}
      {renderOtherClinicInfo()}

      {/* Modals */}
      <EditClinicModal />
      <EditOperatingHoursModal />
      <EditOtherInfoModal />
      <Modal
        title="Add Treatment Procedure"
        open={isTreatmentModal}
        onCancel={() => setIsTreatmentModal(false)}
        footer={null}
      >
        <TreatmentForm />
      </Modal>

      <Modal
        title="Add Medication Preference"
        open={isMedicationModal}
        onCancel={() => setIsMedicationModal(false)}
        footer={null}
      >
        <MedicationForm />
      </Modal>
      {renderAddHolidayModal()}
    </div>
  );
};

export default ClinicInfo;