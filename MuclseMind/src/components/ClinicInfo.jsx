import React, { useState } from 'react';
import { useTable } from 'react-table';
import { Button, Modal, Input, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const ClinicInfo = () => {
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

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow-md rounded-lg">
      {/* Clinic Overview */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Clinic Overview</h2>
        <p><strong>Name:</strong> Smile Dental Clinic</p>
        <p><strong>Tagline:</strong> Your Smile, Our Priority</p>
        <p><strong>Description:</strong> We are committed to providing the best dental care with a focus on patient comfort and satisfaction. Our mission is to enhance your smile and improve your oral health.</p>
        <p><strong>Operating Hours:</strong> Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM</p>
      </section>

      {/* Contact Information */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
        <p><strong>Address:</strong> 123 Smile St, Dental City, DC 12345 <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500">View on Google Maps</a></p>
        <p><strong>Phone:</strong> (123) 456-7890</p>
        <p><strong>Email:</strong> contact@smiledental.com</p>
        <p><strong>Social Media:</strong> <a href="https://facebook.com" className="text-blue-500">Facebook</a>, <a href="https://instagram.com" className="text-blue-500">Instagram</a></p>
      </section>

      {/* Dental Services Table */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Dental Services</h2>
        <table {...getTableProps()} className="min-w-full bg-white">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()} className="px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600">
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} className="px-4 py-2 border-b border-gray-200 text-sm">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

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
          visible={isModalVisible}
          onOk={addTeamMember}
          onCancel={() => setIsModalVisible(false)}
          okText="Add"
          cancelText="Cancel"
        >
          <div className="flex flex-col space-y-4">
            <Input
              placeholder="Name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            />
            <Input
              placeholder="Qualifications"
              value={newMember.qualifications}
              onChange={(e) => setNewMember({ ...newMember, qualifications: e.target.value })}
            />
            <Input
              placeholder="Experience"
              value={newMember.experience}
              onChange={(e) => setNewMember({ ...newMember, experience: e.target.value })}
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
    </div>
  );
};

export default ClinicInfo;