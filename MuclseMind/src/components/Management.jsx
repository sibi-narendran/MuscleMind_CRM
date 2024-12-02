import React, { useState, useEffect } from 'react';
import { Users, Clock, DollarSign, Calendar } from 'lucide-react';
import AddStaffMemberModal from './AddStaffMemberModal';
import axios from 'axios';

const Management = () => {
  const [staff, setStaff] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await axios.get('/api/staff/getStaffMembers');
      setStaff(response.data.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleAddStaff = async (newMember) => {
    try {
      await axios.post('/api/staff/addStaffMember', newMember);
      fetchStaff();
    } catch (error) {
      console.error('Error adding staff member:', error);
    }
  };

  return (
    <div className="p-6 dark:bg-boxdark">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
        <div className="flex space-x-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-meta-4 dark:hover:bg-meta-3"
            onClick={() => setShowAddModal(true)}
          >
            Add Staff Member
          </button>
        </div>
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
            <div>
              <p className="text-sm text-gray-500 dark:text-meta-2">Total Payroll</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${staff.reduce((acc, member) => acc + parseFloat(member.salary), 0).toFixed(2)}</h3>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500 dark:text-meta-3" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
            <div className="p-6 border-b border-gray-200 dark:border-strokedark">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Staff Overview</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-strokedark">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Salary
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-boxdark divide-y divide-gray-200 dark:divide-strokedark">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-meta-4">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-meta-2">{member.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          member.status === 'Present'
                            ? 'text-green-700 bg-green-100 dark:bg-green-900'
                            : 'text-red-700 bg-red-100 dark:bg-red-900'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{member.attendance}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">${member.salary}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-meta-2 hover:bg-gray-50 dark:hover:bg-meta-4 rounded-lg">
                Manage Payroll
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-meta-2 hover:bg-gray-50 dark:hover:bg-meta-4 rounded-lg">
                View Attendance Records
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-meta-2 hover:bg-gray-50 dark:hover:bg-meta-4 rounded-lg">
                Schedule Management
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddStaffMemberModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddStaff}
      />
    </div>
  );
};

export default Management;