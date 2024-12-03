import React, { useState, useEffect } from 'react';
import { Users, Clock, DollarSign, Calendar } from 'lucide-react';
import { Modal, DatePicker, Alert, message, Input, Switch, Select } from 'antd';
import moment from 'moment';
import { fetchAttendances, updateAttendanceStatus } from '../api.services/services';

const { Option } = Select;

const Management = () => {
  const [staff, setStaff] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchAttendances(selectedDate)
      .then(response => {
        if (response.success) {
          setStaff(response.data);
        } else {
          console.error('Error fetching staff:', response.error);
        }
      })
      .catch(error => {
        console.error('Error fetching attendances:', error);
      });
  }, [selectedDate]);

  const handleDateChange = (date, dateString) => {
    setSelectedDate(dateString);
  };

  const handleSearchTextChange = (event) => {
    setSearchText(event.target.value);
  };

  const filteredStaff = staff.filter(member => {
    const nameMatches = member.name.toLowerCase().includes(searchText.toLowerCase());
    const dateMatches = selectedDate ? moment(member.date).isSame(moment(selectedDate), 'day') : true;
    return nameMatches && dateMatches;
  });

  const handleStatusChange = (id, status) => {
    updateAttendanceStatus(id, status).then(response => {
      console.log('Update response:', response);
      fetchAttendances(selectedDate).then(response => {
        if (response.success) {
          setStaff(response.data);
          console.log('Fetched data after updating:', response.data);
        } else {
          console.error('Error fetching staff:', response.error);
        }
      });
    }).catch(error => {
      console.error('Error updating attendance status:', error);
    });
  };

  const getTitle = () => {
    const isToday = moment().format('YYYY-MM-DD') === selectedDate;
    return isToday ? "Today's Attendances" : `Attendances for ${selectedDate}`;
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setShowAddModal(true);
  };

  return (
    <div className="p-6 dark:bg-boxdark">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {getTitle()}
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
                      Date of Joining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-boxdark divide-y divide-gray-200 dark:divide-strokedark">
                  {staff.length > 0 ? staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-meta-4" onClick={() => handleMemberClick(member)}>
                      <td className="px-6 py-4 whitespace-nowrap">{moment(member.date).format("YYYY-MM-DD")}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.doj }</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.salary}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleStatusChange(member.id, member.attendance_status === 'Present' ? 'Working' : 'Absent')}>
                          {member.attendance_status || 'Pending'}
                        </button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="6" className="text-center py-4">No data available</td></tr>}
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
              <span>Attendances:</span>
              <Select
                defaultValue={selectedMember.status}
                style={{ width: 120 }}
                onChange={(newStatus) => handleStatusChange(selectedMember.id, newStatus)}
              >
                <Option value="Working" className='text-meta-3'>Working</Option>
                <Option value="Day Off" className='text-meta-6'>Day Off</Option>
                <Option value="Absent" className='text-meta-1'>Absent</Option>
              </Select>
            </div>
           
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Management;