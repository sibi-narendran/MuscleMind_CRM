import React, { useState, useEffect } from 'react';
import { Users, Clock, DollarSign, Calendar } from 'lucide-react';
import axios from 'axios';
import { Modal, DatePicker, Alert, message,Input, Switch } from 'antd';
import moment from 'moment';

const Management = () => {
  const [staff, setStaff] = useState([
    { id: 1,date: '2023-12-01', name: 'John Doe', role: 'Developer', experience: '5 years', salary: 5000, status: 'Present', day_off: false },
    { id: 2,date: '2023-12-01', name: 'Jane Doe', role: 'Designer', experience: '3 years', salary: 4000, status: 'Absent', day_off: true },
    { id: 3,date: '2023-12-02', name: 'Bob Smith', role: 'Manager', experience: '10 years', salary: 7000, status: 'Present', day_off: false },
    { id: 4,date: '2023-12-02', name: 'Alice Johnson', role: 'Developer', experience: '2 years', salary: 3500, status: 'Present', day_off: false },
    { id: 5,date: '2023-12-03', name: 'Charlie Brown', role: 'Designer', experience: '4 years', salary: 4000, status: 'Absent', day_off: true },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await getTeamMembers();
        setStaff(response.data);
      } catch (error) {
        console.error('Error fetching staff:', error);
      }
    };

    fetchStaff();
  }, []);

  const handleAddStaff = async (newMember) => {
    try {
      await axios.post('/api/staff/addStaffMember', newMember);
      fetchStaff();
    } catch (error) {
      console.error('Error adding staff member:', error);
    }
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const handleDateChange = (date, dateString) => {
    setSelectedDate(dateString);
  };

  const handleButtonClick = (messageText) => {
    Modal.confirm({
      title: 'Confirm',
      content: messageText,
      onOk() {
        // Handle OK button click
      },
      onCancel() {
        // Handle Cancel button click
      },
    });
  };
  const handleSearchTextChange = (event) => {
    setSearchText(event.target.value);
  };

  // Filtered staff data based on search text and selected date
  const filteredStaff = staff.filter(member => {
    const nameMatches = member.name.toLowerCase().includes(searchText.toLowerCase());
    const dateMatches = selectedDate ? moment(member.date).isSame(moment(selectedDate), 'day') : true;
    console.log(`Comparing: ${member.date} with ${selectedDate} - Result: ${dateMatches}`);
    return nameMatches && dateMatches;
  });

  // Function to format the title based on the selected date
  const getTitle = () => {
    if (selectedDate) {
      return `${moment(selectedDate).format("MMMM Do YYYY")} Attendances`;
    }
    return "Today's Attendances";
  };

  // Function to handle status change
  const handleStatusChange = (id, newStatus) => {
    // Update logic for changing status
    console.log(`Status for ${id} changed to ${newStatus}`);
  };

  // Function to handle remark change
  const handleRemarkChange = (id, newRemark) => {
    // Update logic for changing remark
    console.log(`Remark for ${id} changed to ${newRemark}`);
  };

  return (
    <div className="p-6 dark:bg-boxdark">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {selectedDate ? `Attendances for ${selectedDate}` : "Today's Attendances"}
        </h2>
       
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-meta-2">Total Staff</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{staff.length}</h3>
            </div>
            <Users className="h-8 w-8 text-blue-500 dark:text-meta-3" />
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-meta-2">Present Today</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{staff.filter(member => member.status === 'Present').length}</h3>
            </div>
            <Clock className="h-8 w-8 text-green-500 dark:text-meta-3" />
          </div>
        </div>
        <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div className='flex flex-col'>
              <p className="text-sm text-gray-500 dark:text-meta-2">Total Payroll</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${staff.reduce((acc, member) => acc + parseFloat(member.salary), 0).toFixed(2)}</h3>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500 dark:text-meta-3" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full">
        <div>
          <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
            <div className="p-6 border-b border-gray-200 dark:border-strokedark flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mr-4">{getTitle()}</h2>
              <div className="flex space-x-4">
                <Input placeholder="Search by name" value={searchText} onChange={handleSearchTextChange} />
                <DatePicker onChange={handleDateChange} format="YYYY-MM-DD" />
              </div>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-strokedark">
                <thead>
                  <tr className="bg-gray-50 dark:bg-strokedark">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Day Off
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-boxdark divide-y divide-gray-200 dark:divide-strokedark">
                  {filteredStaff.length > 0 ? filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-meta-4" onClick={() => handleMemberClick(member)}>
                      <td className="px-6 py-4 whitespace-nowrap">{moment(member.date).format("YYYY-MM-DD")}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.experience}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.salary}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleStatusChange(member.id, member.status === 'Present' ? 'Absent' : 'Present')}>
                          {member.status || 'Pending'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleDayOffChange(member.id, !member.day_off)}>
                          {member.day_off ? 'Day Off' : 'Working'}
                        </button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="2" className="text-center py-4">No data available</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedMember && (
        <Modal
          title={<div style={{ textAlign: 'center', fontWeight: 'bold' }}>{selectedMember.name}</div>}
          visible={!!selectedMember}
          onCancel={() => setSelectedMember(null)}
          footer={null}
        >
          <div className="flex flex-col items-center">
            <p>Role: {selectedMember.role}</p>
            <div className="flex justify-between w-full px-4">
              <span>Status:</span>
              <Switch
                checkedChildren="Present"
                unCheckedChildren="Absent"
                checked={selectedMember.status === 'Present'}
                onChange={() => handleStatusChange(selectedMember.id, selectedMember.status === 'Present' ? 'Absent' : 'Present')}
              />
            </div>
            <div className="flex justify-between w-full px-4">
              <span>Remark:</span>
              <div>
                <Switch
                  checkedChildren="Working"
                  unCheckedChildren="Day Off"
                  checked={selectedMember.day_off}
                  onChange={() => handleRemarkChange(selectedMember.id, selectedMember.day_off ? 'Working' : 'Day Off')}
                />
                <Switch
                  checkedChildren="Not Informed"
                  unCheckedChildren="Informed"
                  checked={!selectedMember.informed}
                  onChange={() => handleRemarkChange(selectedMember.id, !selectedMember.informed ? 'Informed' : 'Not Informed')}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Management;