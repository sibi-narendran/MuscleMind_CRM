import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Table, Upload, DatePicker, List, Typography, message, TimePicker, Checkbox, Image, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getOperatingHours, updateOperatingHours,getTreatments, addTreatment, editTreatment, deleteTreatment  } from '../api.services/services';
import { getMedications, addMedication, editMedication, deleteMedication } from '../api.services/services';
import { getTeamMembers, addTeamMember, editTeamMember, deleteTeamMember } from '../api.services/services';
import { addHoliday, getHolidays, updateHoliday, deleteHoliday } from '../api.services/services';
import { clinicInfo, updateClinicInfo } from '../api.services/services';
import axios from 'axios';
import { updateImageClinicInfo } from '../api.services/services';


const { Option } = Select;
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const ClinicInfo = () => {
  const [clinicData, setClinicData] = useState({
    name: '',
    clinic_name: '',
    address: '', 
    state: '',
    city: '',
    pincode: '',
    phone: '',
    email: '',
    GST_Number: '',
    License_Number: '',
    socialMedia: {
      facebook: '',
      instagram: '',
    },
  });

  const [teamMembers, setTeamMembers] = useState();

  const [treatments, setTreatments] = useState([]);

  const [medications, setMedications] = useState([]);
  const [isMedicationModal, setIsMedicationModal] = useState(false);
  const [editMedicationData, setEditMedicationData] = useState(null);

  const [specialHolidays, setSpecialHolidays] = useState([]);


  // Modal visibility states
  const [isEditClinicModal, setIsEditClinicModal] = useState(false);
  const [isEditOperatingHoursModal, setIsEditOperatingHoursModal] = useState(false);
  const [isHolidayModalVisible, setIsHolidayModalVisible] = useState(false);
  const [isTreatmentModalVisible, setIsTreatmentModalVisible] = useState(false);
  const [isTeamMemberModalVisible, setIsTeamMemberModalVisible] = useState(false);
  const [editHoliday, setEditHoliday] = useState(null);
  const [editTreatmentData, setEditTreatmentData] = useState(null);
  const [editTeamMemberData, setEditTeamMemberData] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);
  const [footerPreview, setFooterPreview] = useState(null);
  const [headerError, setHeaderError] = useState('');
  const [footerError, setFooterError] = useState('');
  const [headerFile, setHeaderFile] = useState(null);
  const [footerFile, setFooterFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const [operatingHours, setOperatingHours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        // Fetch clinic info
        const clinicResponse = await clinicInfo();
        if (!clinicResponse.success) {
          message.error('Failed to fetch clinic data');
          return;
        }

        // Fetch operating hours
        const hoursResponse = await getOperatingHours();
        if (!hoursResponse.success) {
          message.error('Failed to fetch operating hours');
          return;
        }

        // Combine both responses
        setClinicData({
          ...clinicResponse.data,
          operatingHours: hoursResponse.data
        });

      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Error fetching clinic information');
      }
    };

    fetchClinicData();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await getHolidays();
      if (response.success) {
        setSpecialHolidays(response.data);
      } else {
        message.error('Error fetching holidays');
      }
    } catch (error) {
      console.error('Error in fetchHolidays:', error);
      message.error('Error fetching holidays');
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);



  const fetchTreatments = async () => {
    try {
      const response = await getTreatments();
      if (response.success) {
        console.log('Fetched treatments:', response.data);
        setTreatments(response.data);
      } else {
        message.error('Failed to fetch treatments');
      }
    } catch (error) {
      console.error('Error fetching treatments:', error);
      message.error('Error fetching treatments');
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, []);
  

  const fetchOperatingHours = async () => {
    try {
      setIsLoading(true);
      const response = await getOperatingHours();
      if (response.success) {
        setOperatingHours(response.data);
      } else {
        message.error('Failed to fetch operating hours');
      }
    } catch (error) {
      console.error('Error fetching operating hours:', error);
      message.error('Error fetching operating hours');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOperatingHours();
  }, []);

  const handleSaveOperatingHours = async (values) => {
    try {
      const updatedData = Object.entries(values).map(([day, { status, open, close }]) => ({
        day: day.toLowerCase(),
        status: status || 'closed',
        open_time: open ? moment(open).format('HH:mm') : null,
        close_time: close ? moment(close).format('HH:mm') : null,
      }));

      const response = await updateOperatingHours(updatedData);
      if (response.success) {
        message.success('Operating hours updated successfully');
        setOperatingHours(updatedData);
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
    if (!record || !record.treatment_id) {
      message.error('Invalid treatment data');
      return;
    }
    
    // Get the original minutes value before it was converted for display
    const originalMinutes = treatments.find(t => t.treatment_id === record.treatment_id)?.duration;
    
    const editData = {
      ...record,
      duration: originalMinutes ? convertMinutesToHours(originalMinutes) : '0 hr' // Use original minutes value
    };
    
    console.log('Edit data:', editData); // Debug log
    setEditTreatmentData(editData);
    setIsTreatmentModalVisible(true);
  };

  const handleAddOrEditTreatment = async (values) => {
    try {
      const payload = {
        category: values.category,
        procedure_name: values.procedure_name,
        cost: values.cost,
        duration: values.duration // This will be in "X hr Y mins" format
      };

      let response;
      if (editTreatmentData && editTreatmentData.treatment_id) {
        response = await editTreatment(editTreatmentData.treatment_id, payload);
      } else {
        response = await addTreatment(payload);
      }

      if (response.success) {
        message.success(`Treatment ${editTreatmentData ? 'updated' : 'added'} successfully`);
        fetchTreatments();
      } else {
        message.error(`Failed to ${editTreatmentData ? 'update' : 'add'} treatment`);
      }
    } catch (error) {
      console.error('Error saving treatment:', error);
      message.error('Error saving treatment');
    } finally {
      setEditTreatmentData(null);
      setIsTreatmentModalVisible(false);
    }
  };

  const handleDeleteTreatment = async (id) => {
    if (!id) {
      message.error('Invalid treatment ID');
      return;
    }

    Modal.confirm({
      title: 'Delete Treatment',
      content: 'Are you sure you want to delete this treatment?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      async onOk() {
        try {
          console.log("Deleting treatment with ID:", id);
          const response = await deleteTreatment(id);
          if (response.success) {
            message.success('Treatment deleted successfully');
            await fetchTreatments();
          } else {
            message.error('Failed to delete treatment');
          }
        } catch (error) {
          console.error('Error deleting treatment:', error);
          message.error('Error deleting treatment');
        }
      },
    });
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
    console.log("Received team member data for editing:", member);
    if (member && member.id) {
      const formattedMember = {
        ...member,
        doj: member.doj ? moment(member.doj, "YYYY-MM-DD") : null
      };
      setEditTeamMemberData(formattedMember);
      setIsTeamMemberModalVisible(true);
    } else {
      console.error("Invalid team member data or missing identifier:", member);
      message.error('Invalid team member data or missing identifier');
    }
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
      // Ensure the date is formatted correctly before sending
      const payload = {
        ...values,
        doj: values.doj ? values.doj.format("YYYY-MM-DD") : null
      };

      let response;
      if (editTeamMemberData) {
        response = await editTeamMember(editTeamMemberData.id, payload);
        if (response.success) {
          message.success('Team member updated successfully');
        } else {
          message.error('Failed to update team member');
        }
      } else {
        response = await addTeamMember(payload);
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Clinic Overview & Contact Information</h2>
        <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditClinicModal(true)}>
          Edit
        </Button>
      </div>
      <div className="space-y-2">
        <p><strong>Name:</strong> {clinicData.username}</p>
        <p><strong>Clinic Name:</strong> {clinicData.clinicName}</p>
        <p><strong>Address:</strong> {clinicData.address}</p>
        <p><strong>State:</strong> {clinicData.state}</p>
        <p><strong>City:</strong> {clinicData.city}</p>
        <p><strong>Pincode:</strong> {clinicData.pincode}</p>
        <p><strong>Phone:</strong> {clinicData.phoneNumber}</p>
        <p><strong>Email:</strong> {clinicData.email}</p>
        <p><strong>GST Number:</strong> {clinicData.gst_number}</p>
        <p><strong>License Number:</strong> {clinicData.license_number}</p>
      </div>
    </section>
  );

  const renderOperatingHours = () => (
    <section className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Operating Hours</h2>
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={() => setIsEditOperatingHoursModal(true)}
          loading={isLoading}
        >
          Edit
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table
          dataSource={clinicData.operatingHours?.map((entry, index) => ({
            key: index,
            day: capitalize(entry.day),
            status: entry.status,
            open: entry.open_time ? entry.open_time.slice(0, 5) : 'N/A',
            close: entry.close_time ? entry.close_time.slice(0, 5) : 'N/A',
          })) || []}
          columns={[
            { title: 'Day', dataIndex: 'day', key: 'day' },
            { title: 'Status', dataIndex: 'status', key: 'status' },
            { title: 'Open', dataIndex: 'open', key: 'open' },
            { title: 'Close', dataIndex: 'close', key: 'close' },
          ]}
          pagination={false}
          className="min-w-full"
        />
      </div>
    </section>
  );

  const handleDeleteHoliday = async () => {
    if (editHoliday && editHoliday.id) {
      console.log("Deleting holiday with ID:", editHoliday.id); // Debugging line to check the ID
      try {
        const response = await deleteHoliday(editHoliday.id);
        if (response.success) {
          message.success('Holiday deleted successfully');
          fetchHolidays(); // Refresh the list after deletion
          setIsHolidayModalVisible(false);
          setEditHoliday(null); // Reset the edit state
        } else {
          message.error('Failed to delete holiday');
        }
      } catch (error) {
        message.error('Error deleting holiday');
      }
    } else {
      message.error('No holiday selected or missing ID');
    }
  };
  
// Assuming you fetch or set `editHoliday` somewhere in your code:
const handleEditHoliday = (holiday) => {
  console.log("Received holiday data for editing:", holiday);
  if (holiday && holiday.id) {
    const formattedHoliday = {
      ...holiday,
      date: holiday.date ? moment(holiday.date, "YYYY-MM-DD") : null
    };
    setEditHoliday(formattedHoliday);
    setIsHolidayModalVisible(true);
  } else {
    console.error("Invalid holiday data or missing identifier:", holiday);
    message.error('Invalid holiday data or missing identifier');
  }
};


const handleFinish = async (values) => {
  try {
    // Ensure the date is formatted correctly before sending
    const payload = {
      ...values,
      date: values.date.format("YYYY-MM-DD")
    };

    if (editHoliday) {
      const response = await updateHoliday(editHoliday.id, payload);
      console.log(response);
      if (response.success) {
        message.success('Holiday updated successfully');
      } else {
        message.error('Failed to update holiday');
      }
    } else {
      const response = await addHoliday(payload);
      if (response.success) {
        message.success('Holiday added successfully');
      } else {
        message.error('Failed to add holiday');
      }
    }
    fetchHolidays();
  } catch (error) {
    message.error('Error saving holiday');
  } finally {
    setEditHoliday(null);
    setIsHolidayModalVisible(false);
  }
};

const renderHolidays = () => (
  <section className="mb-8">
    <div className="flex flex-col md:flex-row justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">Holidays</h2>
      <Button type="primary" onClick={() => setIsHolidayModalVisible(true)}>
        Add Holiday
      </Button>
    </div>
    <div className="overflow-x-auto">
      <Table
        dataSource={specialHolidays}
        columns={[
          { title: 'Reason', dataIndex: 'name', key: 'name' },
          { title: 'Date', dataIndex: 'date', key: 'date' },
          {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
              <Button type="link" onClick={() => handleEditHoliday(record)}>
                Edit
              </Button>
            ),
          }
        ]}
        pagination={false}
        className="min-w-full"
      />
    </div>
  </section>
);
  const renderDentalTeam = () => (
    <section className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Dental Team</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTeamMember}>
          Add Team Member
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table
          dataSource={teamMembers}
          columns={[
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Role', dataIndex: 'role', key: 'role' },
            { title: 'Date of joining', dataIndex: 'doj', key: 'doj' },
            { title: 'Salary Per Month', dataIndex: 'salary', key: 'salary' },
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
          className="min-w-full"
        />
      </div>
    </section>
  );

  const convertMinutesToHours = (minutes) => {
    if (!minutes) return '0 hr';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes} mins`;
    if (remainingMinutes === 0) return `${hours} hr`;
    return `${hours} hr ${remainingMinutes} mins`;
  };

  const convertHoursToMinutes = (timeString) => {
    const hourMatch = timeString.match(/(\d+)\s*hr/);
    const minuteMatch = timeString.match(/(\d+)\s*mins/);
    let totalMinutes = 0;
    
    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
    
    return totalMinutes;
  };

  const renderTreatments = () => (
    <section className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Treatment Procedures & Fees</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditTreatmentData(null);
            setIsTreatmentModalVisible(true);
          }}
        >
          Add Treatment
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table
          dataSource={treatments.map(treatment => {
            const displayDuration = convertMinutesToHours(treatment.duration);
            return {
              ...treatment,
              key: treatment.treatment_id,
              displayDuration // Store converted duration in a separate field
            };
          })}
          columns={[
            { title: 'Category', dataIndex: 'category', key: 'category' },
            { title: 'Procedure Name', dataIndex: 'procedure_name', key: 'procedure_name' },
            { title: 'Cost', dataIndex: 'cost', key: 'cost' },
            { 
              title: 'Duration', 
              dataIndex: 'displayDuration', // Use the display duration
              key: 'duration'
            },
            {
              title: 'Action',
              key: 'action',
              render: (_, record) => (
                <Space>
                  <Button 
                    type="link" 
                    onClick={() => handleEditTreatment(record)}
                  >
                    Edit
                  </Button>
                  <Button 
                    type="link" 
                    danger 
                    onClick={() => handleDeleteTreatment(record.treatment_id)}
                  >
                    Delete
                  </Button>
                </Space>
              ),
            }
          ]}
          pagination={false}
          className="min-w-full"
        />
      </div>
    </section>
  );
  const renderMedications = () => (
    <section className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Medication Preferences</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsMedicationModal(true)}>
          Add Medication
        </Button>
      </div>
      <div className="overflow-x-auto">
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
            { title: 'Times', dataIndex: 'times', key: 'times', render: (times) => (
              <div className="flex flex-col">
                {times.map((time, index) => (
                  <span key={index}>{time}</span>
                ))}
              </div>
            )   },
            { title: 'Food Instructions', dataIndex: 'foodInstructions', key: 'foodInstructions', render: (instructions) => (
              <div className="flex flex-col">
                {instructions.map((instruction, index) => (
                  <span key={index}>{instruction}</span>
                ))}
              </div>
            )  },
            { title: 'Special Note', dataIndex: 'specialNote', key: 'specialNote' },
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
          className="min-w-full"
        />
      </div>
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
        onFinish={handleSaveClinicInfo}
        layout="vertical"
      >
        <Form.Item name="username" label="User Name">
          <Input />
        </Form.Item>
        <Form.Item name="clinicName" label="Clini name">
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input />
        </Form.Item>
        <Form.Item name="gmapLink" label="Google Maps Link">
          <Input />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Phone Number">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input /> 
        </Form.Item>
        <Form.Item name="state" label="State">
          <Input />
        </Form.Item>
        <Form.Item name="city" label="City">
          <Input />
        </Form.Item>
        <Form.Item name="pincode" label="Pincode">
          <Input />
        </Form.Item>
        <Form.Item name={['socialMedia', 'facebook']} label="Facebook">
          <Input />
        </Form.Item>
        <Form.Item name={['socialMedia', 'instagram']} label="Instagram">
          <Input />
        </Form.Item>
        <Form.Item name="gst_number" label="GST Number">
          <Input />
        </Form.Item>
        <Form.Item name="license_number" label="License Number">
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
        initialValues={clinicData.operatingHours && Array.isArray(clinicData.operatingHours) ? clinicData.operatingHours.reduce((acc, { day, status, open_time, close_time }) => {
          acc[day] = { status, open: open_time, close: close_time };
          return acc;
        }, {}) : {}}
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
const renderAddHolidayModal = () => {
  const formattedInitialValues = editHoliday ? {
    ...editHoliday,
    date: editHoliday.date ? moment(editHoliday.date, "YYYY-MM-DD") : null
  } : {
    name: '',
    date: null,
  };

  return (
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
        initialValues={formattedInitialValues}
        onFinish={handleFinish}
        layout="vertical"
        key={editHoliday ? editHoliday.id : 'new'}
      >
        <Form.Item
          name="name"
          label="Name of Holiday"
          rules={[{ required: true, message: 'Please enter the name of the holiday!' }]}
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
          {editHoliday && (
            <Button type="danger" onClick={() => handleDeleteHoliday(editHoliday.id)}>Delete</Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};



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
        initialValues={editMedicationData || { 
          condition: '', 
          name: '', 
          brand: '', 
          dosage: { adult: '', child: '', infant: '' },
          times: [], // New field for checkboxes
          foodInstructions: [], // New field for checkboxes
          specialNote: '' // New field
        }}
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
        {/* New fields for Day, Evening, Night, After Food, Before Food */}
        <Form.Item name="times" label="Dosage Times">
          <Checkbox.Group>
            <Checkbox value="Day">Day</Checkbox>
            <Checkbox value="Evening">Evening</Checkbox>
            <Checkbox value="Night">Night</Checkbox>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item name="foodInstructions" label="Food Instructions">
          <Checkbox.Group>
            <Checkbox value="After Food">After Food</Checkbox>
            <Checkbox value="Before Food">Before Food</Checkbox>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item name="specialNote" label="Special Note">
          <Input.TextArea />
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
  initialValues={{
    name: editTeamMemberData ? editTeamMemberData.name : '',
    role: editTeamMemberData ? editTeamMemberData.role : '',
    doj: editTeamMemberData && editTeamMemberData.doj ? moment(editTeamMemberData.doj) : null,
    salary: editTeamMemberData ? editTeamMemberData.salary : ''
  }}
  onFinish={handleAddOrEditTeamMember}
  layout="vertical"
>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please enter a role!' }]}>
          <Input />
        </Form.Item>
        <Form.Item
            name="doj"
          label="Date of Joining"
          rules={[{ required: true, message: 'Please enter date of joining!' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
              placeholder="Select date"
          />
        </Form.Item>
        <Form.Item name="salary" label="Salary Per Month" rules={[{ required: true, message: 'Please enter salary!' }]}>
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

  const handleSaveClinicInfo = async (values) => {
    try {
      // Assuming 'id' is stored in the clinicData state
      const clinicId = clinicData.id;
      if (!clinicId) {
        message.error('Clinic ID is missing');
        return;
      }

      const response = await updateClinicInfo(clinicId, values);
      if (response.success) {
        message.success('Clinic information updated successfully');
        setClinicData(values);  // Update the local state to reflect the changes
        setIsEditClinicModal(false);  // Close the modal
      } else {
        message.error('Failed to update clinic information');
      }
    } catch (error) {
      message.error('Error updating clinic information: ' + error.message);
    }
  };

  const validateFile = (file, setError) => {
    const isImage = file.type.startsWith('image/');
    const maxSizeInMB = 5;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Convert MB to bytes

    if (!isImage) {
      setError('You can only upload image files!');
      return false;
    }

    if (file.size > maxSizeInBytes) {
      setError(`File size should not exceed ${maxSizeInMB} MB!`);
      return false;
    }

    setError('');
    return true;
  };

  const handleUpload = async (byteArray, type) => {
    try {
      const response = await axios.post('/api/upload', {
        type,
        data: byteArray,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.data.success) {
        message.success(`${type} uploaded successfully`);
      } else {
        message.error(`Failed to upload ${type}`);
      }
    } catch (error) {
      message.error(`Error uploading ${type}: ${error.message}`);
    }
  };

  

  const handleHeaderChange = ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      if (validateFile(file, setHeaderError)) {
        const reader = new FileReader();
        reader.onload = () => setHeaderPreview(reader.result);
        reader.readAsDataURL(file);
        setHeaderFile(file);
      } else {
        setHeaderPreview(null);
        setHeaderFile(null);
      }
    } else {
      setHeaderPreview(null);
      setHeaderFile(null);
    }
  };

  const handleFooterChange = ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      if (validateFile(file, setFooterError)) {
        const reader = new FileReader();
        reader.onload = () => setFooterPreview(reader.result);
        reader.readAsDataURL(file);
        setFooterFile(file);
      } else {
        setFooterPreview(null);
        setFooterFile(null);
      }
    } else {
      setFooterPreview(null);
      setFooterFile(null);
    }
  };

  const PreviewHeader = () => {
    // Add state for existing images
    const [existingImages, setExistingImages] = useState({
      header: '',
      footer: ''
    });

    // Fetch existing images when component mounts
    useEffect(() => {
      const fetchImages = async () => {
        try {
          const response = await clinicInfo ();
          if (response.success) {
            setExistingImages({
              header: response.data.header_image_url,
              footer: response.data.footer_image_url
            });
          }
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      };

      fetchImages();
    }, []);

    return (
      <>
        <h1 className="text-2xl font-bold text-white dark:text-white">Prescription Header & Footer</h1>
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mt-5">
          <Form.Item label="Prescription Header" name="prescriptionHeader" className="text-white dark:text-white flex-1">
            <Upload
              name="header"
              listType="picture"
              beforeUpload={() => false}
              onChange={handleHeaderChange}
              className="w-full"
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} className="w-full md:w-auto">
                Upload Header
              </Button>
            </Upload>
            {(headerPreview || existingImages.header) && (
              <Image
                src={headerPreview || existingImages.header}
                alt="Header Preview"
                style={{ width: '200px', height: 'auto', marginTop: '10px' }}
              />
            )}
            {headerError && <p className="text-red-500 mt-2">{headerError}</p>}
          </Form.Item>

          <Form.Item label="Prescription Footer" name="prescriptionFooter" className="text-white dark:text-white flex-1">
            <Upload
              name="footer"
              listType="picture"
              beforeUpload={() => false}
              onChange={handleFooterChange}
              className="w-full"
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} className="w-full md:w-auto">
                Upload Footer
              </Button>
            </Upload>
            {(footerPreview || existingImages.footer) && (
              <Image
                src={footerPreview || existingImages.footer}
                alt="Footer Preview"
                style={{ width: '200px', height: 'auto', marginTop: '10px' }}
              />
            )}
            {footerError && <p className="text-red-500 mt-2">{footerError}</p>}
          </Form.Item>
        </div>
      </>
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); 
    try {
      const formData = new FormData();
      if (headerFile) {
        formData.append("headerImage", headerFile);
      }
      if (footerFile) {
        formData.append("footerImage", footerFile);
      }

      const response = await updateImageClinicInfo(formData);
      if (response.success) {
        message.success('Images updated successfully');
      } else {
        message.error('Failed to update images');
      }
    } catch (error) {
      message.error('Error updating images');
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white dark:bg-boxdark shadow-md rounded-lg">
      {renderClinicOverviewAndContact()}
      {renderOperatingHours()}
      {renderHolidays()}
      {renderDentalTeam()}
      {renderTreatments()}
      {renderMedications()}

      {/* Modals */}
      <EditClinicModal />
      <EditOperatingHoursModal />
      {renderAddHolidayModal()}
      <TreatmentForm />
      <MedicationForm />
      <TeamMemberForm />
      <PreviewHeader />
      <Button type="primary" onClick={handleSubmit} loading={isSubmitting}>
        Submit Images
      </Button>
    </div>
  );
};

export default ClinicInfo;