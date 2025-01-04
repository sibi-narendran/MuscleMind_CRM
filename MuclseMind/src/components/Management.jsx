import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  Clock, 
  DollarSign, 
  Calendar, 
  Eye,
  Search,
  Download,
  Plus
} from "lucide-react";
import { Modal, DatePicker, Alert, message, Input, Table, Tabs,Button, Select, InputNumber } from "antd";
import moment from "moment";
import {
  fetchStaffAttendances,
  fetchConsultantAttendances,
  updateAttendanceStatus,
  updateConsultantAttendanceStatus,
  createManualAttendance,
} from "../api.services/services";
import * as XLSX from 'xlsx';
import { Box } from '@mui/material';
import { EyeOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Option } = Select;

// 1. First, declare constants outside the component
const statusOptions = [
  { value: 'present', label: 'Present', color: 'text-green-500' },
  { value: 'absent', label: 'Absent', color: 'text-red-500' },
  { value: 'half-day', label: 'Half Day', color: 'text-yellow-500' },
  { value: 'day-off', label: 'Day Off', color: 'text-blue-500' }
];

const getStatusClass = (status) => {
  if (!status) return '';
  
  switch(status.toLowerCase()) {
    case 'present':
      return 'text-green-500';
    case 'absent':
      return 'text-red-500';
    case 'half-day':
      return 'text-yellow-500';
    case 'day-off':
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
};

const calculateStaffDailySalary = (salary, daysOffPerMonth) => {
  const workingDays = 30 - (daysOffPerMonth || 0);
  return salary / workingDays;
};

const calculatePayableAmount = (employee) => {
  if (!employee || !employee.salary) return 0;
  
  const status = employee.attendance_status?.toLowerCase() || '';
  const salary = Number(employee.salary) || 0;

  switch(status) {
    case 'present':
      return salary;
    case 'half-day':
      return salary / 2;
    case 'absent':
    case 'day-off':
    case 'pending':
    default:
      return 0;
  }
};

const Management = () => {
  // 2. Utility functions
  const calculateMonthlyDetails = (employee) => {
    if (!employee) return {
      presentDays: 0,
      monthlyBasic: 0,
      payableAmount: 0,
      dailyRate: 0
    };

    const isStaff = employee.type === 'staff';
    const dailyRate = isStaff 
      ? employee.salary / (30 - employee.leave_balances)
      : employee.salary;

    return {
      dailyRate: dailyRate,
      monthlyBasic: isStaff ? employee.salary : dailyRate * 30,
      leaveBalance: isStaff ? employee.leave_balances : 'N/A',
      presentDays: employee.attendance_status === 'present' ? 1 : 
                  employee.attendance_status === 'half-day' ? 0.5 : 0,
      payableAmount: calculatePayableAmount(employee)
    };
  };

  // 3. State declarations
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [consultantData, setConsultantData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [monthlyTotals, setMonthlyTotals] = useState({
    presentStaff: 0,
    absentStaff: 0,
    dayOffStaff: 0,
    totalPayroll: 0,
    totalPresent: 0,
    totalAbsent: 0
  });
  const [searchText, setSearchText] = useState("");

  // Separate status options for staff and consultants
  const staffStatusOptions = [
    { label: 'Present', value: 'present' },
    { label: 'Absent', value: 'absent' },
    { label: 'Half Day', value: 'half-day' },
    { label: 'Day Off', value: 'day-off' }
  ];

  const consultantStatusOptions = [
    { value: 'present', label: 'Present', color: 'text-green-500' },
    { value: 'absent', label: 'Absent', color: 'text-red-500' }
  ];

  // 4. Handler functions
  const handleModalClose = () => {
    try {
      setIsModalVisible(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error closing modal:', error);
    }
  };

  const handleDateChange = (date) => {  
    setSelectedDate(date.format('YYYY-MM-DD'));
  };

  const handleStatusChange = async (record, newStatus, newSalary) => {
    setUpdatingStatus(true);
    try {
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
      const updateFunction = record.type === 'staff' 
        ? updateAttendanceStatus 
        : updateConsultantAttendanceStatus;

      const payload = {
        status: newStatus || record.attendance_status,
        date: formattedDate,
        salary: newSalary || record.salary
      };

      const response = await updateFunction(record.id, payload);

      if (response.success) {
        message.success(response.message || 'Updated successfully');
        await fetchAttendanceData(formattedDate);
      } else {
        message.error(response.message || 'Failed to update');
      }
    } catch (error) {
      console.error('Error updating:', error);
      message.error('Failed to update');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchAttendanceData = async (date) => {
    try {
      setLoading(true);
      const response = await fetchStaffAttendances(date);
      
      if (response?.success && response?.data) {
        // Ensure we're setting arrays and preserve the type property
        const staffList = Array.isArray(response.data.staff) 
            ? response.data.staff.map(staff => ({ ...staff, type: 'staff' }))
            : [];
        const consultantList = Array.isArray(response.data.consultants)
            ? response.data.consultants.map(consultant => ({ ...consultant, type: 'consultant' }))
            : [];

        setStaffData(staffList);
        setConsultantData(consultantList);
      } else {
        setStaffData([]);
        setConsultantData([]);
        message.error('Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setStaffData([]);
      setConsultantData([]);
      message.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Updated handler with proper payload
  const handleQuickStatusUpdate = async (record, newStatus) => {
    setUpdatingStatus(true);
    try {
        const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
        const updateFunction = record.type === 'staff' 
            ? updateAttendanceStatus 
            : updateConsultantAttendanceStatus;

        const response = await updateFunction(
            record.id,
            {
                status: newStatus,
                date: formattedDate  // Include the date in the request
            }
        );

        if (response.success) {
            message.success(response.message || 'Status updated successfully');
            await fetchAttendanceData(formattedDate);
        } else {
            message.error(response.message || 'Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        message.error('Failed to update status');
    } finally {
        setUpdatingStatus(false);
    }
  };

  // Update status for staff
  const handleModalStatusChange = async (newStatus) => {
    if (!selectedRecord) return;

    setUpdatingStatus(true);
    try {
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
      const updateFunction = selectedRecord.type === 'staff' 
        ? updateAttendanceStatus 
        : updateConsultantAttendanceStatus;

      await updateFunction(
        selectedRecord.id,
        newStatus,
        formattedDate
      );

      message.success('Status updated successfully');
      
      // Refresh the data with same date
      if (selectedRecord.type === 'staff') {
        await fetchStaffData(formattedDate);
      } else {
        await fetchConsultantData(formattedDate);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // 5. Effects
  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate]);

  // 6. Modals - keeping exactly the same
  const renderStaffModal = () => {
    if (!selectedRecord || selectedRecord.type !== 'staff') return null;
    
    return (
      <Modal
        title={
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              {selectedRecord.name}'s Details
            </h3>
            <DatePicker
              value={moment(selectedDate)}
              onChange={handleDateChange}
              format="DD MMM YYYY"
              className="w-44 h-[42px] rounded-xl"
            />
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        destroyOnClose={true}
        maskClosable={false}
        footer={null}
        width={800}
      >
        <div className="space-y-6">
          {/* Personal & Employment Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50  p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-black dark:text-white mb-4">
                Personal Information
              </h4>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{selectedRecord.name}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Specialisation:</span>
                  <span>{selectedRecord.specialisation}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Employee Type:</span>
                  <span className="capitalize">{selectedRecord.type}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Date of Joining:</span>
                  <span>{moment(selectedRecord.doj).format('DD MMM YYYY')}</span>
                </p>
              </div>
            </div>

            <div className="bg-gray-50  p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-black dark:text-white mb-4">
                Salary Information
              </h4>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p className="flex justify-between">
                  <span className="font-medium">
                    {selectedRecord.type === 'staff' ? 'Monthly Salary' : 'Daily Rate'}:
                  </span>
                  <span>₹{selectedRecord.salary.toLocaleString()}</span>
                </p>
            
                {selectedRecord.type === 'staff' && (
                  <p className="flex justify-between">
                    <span className="font-medium">Leave Balance:</span>
                    <span>{selectedRecord.leave_balances} days</span>
                  </p>
                  
                )}
                
              </div>
            </div>
          </div>

          {/* Attendance & Payroll Details with Download Button */}
          <div className="bg-gray-50  p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">
                Attendance & Payroll Details
              </h4>
              <Button
                type="primary"
                icon={<Download size={16} />}
                onClick={() => setIsDownloadModalVisible(true)}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                Download Report
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{moment(selectedRecord.date).format('DD MMM YYYY')}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={getStatusClass(selectedRecord.attendance_status)}>
                    {selectedRecord.attendance_status.toUpperCase()}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Present Days:</span>
                  <span>{calculateMonthlyDetails(selectedRecord).presentDays}</span>
                </p>
              </div>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p className="flex justify-between">
                  <span className="font-medium">Basic Pay:</span>
                  <span>₹{calculateMonthlyDetails(selectedRecord).monthlyBasic.toFixed(2)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Today's Payable:</span>
                  <span>₹{calculateMonthlyDetails(selectedRecord).payableAmount.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Payment History - Optional */}
          <div className="bg-gray-50  p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-black dark:text-white mb-4">
              Payment Summary
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-600 dark:text-gray-300">Monthly Basic:</span>
                <span className="text-lg font-semibold text-primary">
                  ₹{calculateMonthlyDetails(selectedRecord).monthlyBasic.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-600 dark:text-gray-300">Daily Rate:</span>
                <span className="text-lg font-semibold text-primary">
                  ₹{calculateMonthlyDetails(selectedRecord).dailyRate.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-gray-600 dark:text-gray-300">Today's Payable:</span>
                <span className="text-xl font-bold text-primary">
                  ₹{calculateMonthlyDetails(selectedRecord).payableAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Summary for Consultants */}
          {selectedRecord.type === 'consultant' && monthlyTotals && (
            <div className="bg-gray-50  p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-black  mb-4">
                Monthly Summary
              </h4>
                 <Button
                type="primary"
                icon={<Download size={16} />}
                onClick={() => setIsDownloadModalVisible(true)}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                Download Report
              </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p className="flex justify-between">
                    <span className="font-medium">Total Working Days:</span>
                    <span>{monthlyTotals.totalDays}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Present Days:</span>
                    <span>{monthlyTotals.presentDays}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Half Days:</span>
                    <span>{monthlyTotals.halfDays}</span>
                  </p>
                </div>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p className="flex justify-between">
                    <span className="font-medium">Daily Rate:</span>
                    <span>₹{selectedRecord.salary.toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Monthly Total:</span>
                    <span className="text-lg font-semibold text-primary">
                      {/* ₹{monthlyTotals.totalAmount.toLocaleString()} */}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Status Section */}
          <div className="bg-gray-50 p-6 rounded-xl col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Attendance Status</h4>
              <Select
                value={selectedRecord.attendance_status}
                onChange={handleModalStatusChange}
                loading={updatingStatus}
                className="w-40"
                dropdownClassName="rounded-xl"
              >
                {statusOptions.map(status => (
                  <Option key={status.value} value={status.value}>
                    <span className={status.color}>
                      {status.label}
                    </span>
                  </Option>
                ))}
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="flex justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <span className={`font-medium ${
                    selectedRecord.attendance_status === 'present' ? 'text-green-500' : 
                    selectedRecord.attendance_status === 'absent' ? 'text-red-500' : 
                    selectedRecord.attendance_status === 'half-day' ? 'text-yellow-500' : 
                    selectedRecord.attendance_status === 'day-off' ? 'text-blue-500' : 
                    'text-gray-500'
                  }`}>
                    {selectedRecord.attendance_status.charAt(0).toUpperCase() + 
                     selectedRecord.attendance_status.slice(1)}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{moment(selectedDate).format('DD MMM YYYY')}</span>
                </p>
              </div>
              <div className="space-y-3">
                <p className="flex justify-between">
                  <span className="text-gray-600">Payable Amount:</span>
                  <span className="font-medium text-primary">
                    ₹{calculatePayableAmount(selectedRecord).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  // Consultant Modal Component
  const renderConsultantModal = () => {
    if (!selectedRecord || selectedRecord.type !== 'consultant') return null;

    const consultantData = {
      name: selectedRecord?.name || 'N/A',
      specialisation: selectedRecord?.specialisation || 'N/A',
      type: selectedRecord?.type || 'consultant',
      salary: Number(selectedRecord?.salary) || 0,
      date: selectedRecord?.date || moment().format('YYYY-MM-DD'),
      attendance_status: selectedRecord?.attendance_status || 'pending',
      doj: selectedRecord?.created_at || selectedRecord?.date || moment().format('YYYY-MM-DD')
    };

    return (
      <Modal
        title={
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              {consultantData.name}'s Details
            </h3>
            <DatePicker
              value={moment(selectedDate)}
              onChange={handleDateChange}
              format="DD MMM YYYY"
              className="w-44 h-[42px] rounded-xl"
            />
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        destroyOnClose={true}
        maskClosable={false}
        footer={null}
        width={800}
      >
        <div className="space-y-6">
          {/* Personal & Employment Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-black dark:text-white mb-4">
                Personal Information
              </h4>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{consultantData.name}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Specialisation:</span>
                  <span>{consultantData.specialisation}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Employee Type:</span>
                  <span className="capitalize">{consultantData.type}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Date of Joining:</span>
                  <span>{moment(consultantData.doj).format('DD MMM YYYY')}</span>
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-black dark:text-white mb-4">
                Salary Information
              </h4>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p className="flex justify-between">
                  <span className="font-medium">Daily Rate:</span>
                  <span>₹{consultantData.salary.toLocaleString()}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Today's Payable:</span>
                  <span>₹{calculatePayableAmount(consultantData).toLocaleString()}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Attendance & Payroll Details */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">
                Attendance & Payroll Details
              </h4>
              <Button
                type="primary"
                icon={<Download size={16} />}
                onClick={() => setIsDownloadModalVisible(true)}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                Download Report
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{moment(consultantData.date).format('DD MMM YYYY')}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={getStatusClass(consultantData.attendance_status)}>
                    {consultantData.attendance_status.toUpperCase()}
                  </span>
                </p>
              </div>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p className="flex justify-between">
                  <span className="font-medium">Basic Pay:</span>
                  <span>₹{consultantData.salary.toLocaleString()}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Today's Payable:</span>
                  <span>₹{calculatePayableAmount(consultantData).toLocaleString()}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Status Section */}
          <div className="bg-gray-50 p-6 rounded-xl col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Attendance Status</h4>
              <Select
                value={consultantData.attendance_status}
                onChange={handleModalStatusChange}
                loading={updatingStatus}
                className="w-40"
                popupClassName="rounded-xl"
              >
                {statusOptions.map(status => (
                  <Option key={status.value} value={status.value}>
                    <span className={status.color}>
                      {status.label}
                    </span>
                  </Option>
                ))}
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="flex justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <span className={`font-medium ${getStatusClass(consultantData.attendance_status)}`}>
                    {consultantData.attendance_status.charAt(0).toUpperCase() + 
                     consultantData.attendance_status.slice(1)}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{moment(selectedDate).format('DD MMM YYYY')}</span>
                </p>
              </div>
              <div className="space-y-3">
                <p className="flex justify-between">
                  <span className="text-gray-600">Payable Amount:</span>
                  <span className="font-medium text-primary">
                    ₹{calculatePayableAmount(consultantData).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  // Dashboard Cards with rounded borders
  const DashboardCard = ({ icon: Icon, title, value, className }) => (
    <div className="bg-white dark:bg-boxdark rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-boxdark-2">
          <Icon className="h-6 w-6 text-primary dark:text-white" />
        </div>
        <div>
          <h4 className="text-2xl font-bold text-black dark:text-white">
            {value}
          </h4>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
        </div>
      </div>
    </div>
  );

  const handleViewClick = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  // Function to download Excel
  const handleDownload = async () => {
    try {
      // Prepare data for excel
      const excelData = [...staffData, ...consultantData].map(item => ({
        Name: item.name,
        Specialisation: item.specialisation,
        Type: item.type,
        Status: item.attendance_status,
        Date: moment(item.date).format('DD MMM YYYY'),
        'Daily Rate': item.type === 'staff' ? (item.salary / 30).toFixed(2) : item.salary,
        Salary: item.salary
      }));

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

      // Save file
      XLSX.writeFile(wb, `Attendance_Report_${moment(selectedDate).format('DD_MMM_YYYY')}.xlsx`);

      message.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      message.error('Failed to download report');
    }
  };

  // Add DownloadModal component
  const DownloadModal = useMemo(() => (
    <Modal
      title="Download Attendance Report"
      open={isDownloadModalVisible}
      onCancel={() => setIsDownloadModalVisible(false)}
      destroyOnClose={true}
      maskClosable={false}
      footer={[
        <Button 
          key="cancel" 
          onClick={() => setIsDownloadModalVisible(false)}
        >
          Cancel
        </Button>,
        <Button 
          key="download" 
          type="primary" 
          onClick={handleDownload}
          className="bg-primary hover:bg-primary/90"
        >
          Download
        </Button>
      ]}
    >
      <div className="p-4">
        <p className="mb-4">Select date range for the report:</p>
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          format="DD MMM YYYY"
          className="w-full h-[42px] rounded-xl"
        />
      </div>
    </Modal>
  ), [isDownloadModalVisible, dateRange]);

  // Columns configuration for both tables
  const staffColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      filteredValue: [searchText],
      onFilter: (value, record) => 
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Specialisation",
      dataIndex: "specialisation",
      key: "specialisation",
    },
    {
      title: "Monthly Salary",
      dataIndex: "salary",
      key: "salary",
      render: (salary) => `₹${salary.toLocaleString()}`,
    },
    {
      title: "Leave Balance",
      dataIndex: "leave_balances",
      key: "leaveBalance",
      render: (days_off) => `${days_off} days`,
    },
    {
      title: "Status",
      dataIndex: "attendance_status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => handleQuickStatusUpdate(record, newStatus)}
          className="w-32"
          dropdownClassName="rounded-xl"
        >
          {statusOptions.map(option => (
            <Option key={option.value} value={option.value}>
              <span className={option.color}>
                {option.label}
              </span>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleViewClick(record)}
          icon={<EyeOutlined />}
          className="bg-blue-500"
        >
          View
        </Button>

        
      ),
    },
  ];

  const consultantColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Specialisation',
      dataIndex: 'specialisation',
      key: 'specialisation',
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary, record) => (
        <InputNumber
          defaultValue={salary}
          onChange={(value) => handleStatusChange(record, record.attendance_status, value)}
          min={0}
          formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/₹\s?|(,*)/g, '')}
        />
      )
    },
    {
      title: 'Status',
      dataIndex: 'attendance_status',
      key: 'attendance_status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => handleStatusChange(record, newStatus)}
          className="w-32"
          dropdownClassName="rounded-xl"
        >
          {consultantStatusOptions.map(option => (
            <Option key={option.value} value={option.value}>
              <span className={option.color}>
                {option.label}
              </span>
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD MMM YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => showDetailModal(record)}
          icon={<EyeOutlined />}
          className="bg-blue-500"
        >
          View
        </Button>
      )
    }
  ];

  const tabItems = [
    {
      key: 'staff',
      label: (
        <div className="flex items-center gap-2 px-6 py-3 text-base font-medium rounded-t-xl 
                      hover:bg-gray-50 dark:hover:bg-boxdark-2 transition-colors">
          <Users className="w-5 h-5 text-primary" />
          <span>Staff Attendance</span>
        </div>
      ),
      children: (
        <div className="p-4">
          <Table 
            columns={staffColumns}
            dataSource={staffData}
            loading={loading}
            rowKey="id"
            className="dark:text-white"
          />
        </div>
      ),
    },
    {
      key: 'consultant',
      label: (
        <div className="flex items-center gap-2 px-6 py-3 text-base font-medium rounded-t-xl 
                      hover:bg-gray-50 dark:hover:bg-boxdark-2 transition-colors">
          <Users className="w-5 h-5 text-secondary" />
          <span>Consultant Attendance</span>
        </div>
      ),
      children: (
        <div className="p-4">
          <Table 
            columns={consultantColumns}
            dataSource={consultantData}
            loading={loading}
            rowKey="id"
            className="dark:text-white"
          />
        </div>
      ),
    },
  ];

  const formatDate = (date) => {
    return moment(date).format('DD MMM YYYY'); // Format: 01 Jan 2024
  };

  // Update the header date display
  const headerDate = selectedDate === moment().format('YYYY-MM-DD')
    ? "Today's Attendances"
    : `Attendances for ${formatDate(selectedDate)}`;

  // Reset date range when download modal closes
  useEffect(() => {
    if (!isDownloadModalVisible) {
      setDateRange([]);
    }
  }, [isDownloadModalVisible]);

  // Dashboard stats calculation
  const totalStaff = staffData.length;
  const presentStaff = staffData.filter(staff => staff.attendance_status === 'present').length;
  const absentStaff = staffData.filter(staff => staff.attendance_status === 'absent').length;
  const dayOffStaff = staffData.filter(staff => staff.attendance_status === 'day-off').length;
  const totalPayroll = [...staffData, ...consultantData].reduce((total, employee) => {
    return total + calculatePayableAmount(employee);
  }, 0);

  // Calculate monthly totals
  const calculateMonthlyTotals = (staffList = [], consultantList = []) => {
    const allEmployees = [...staffList, ...consultantList];
    
    const totals = {
      presentStaff: allEmployees.filter(emp => emp.attendance_status === 'present').length,
      absentStaff: allEmployees.filter(emp => emp.attendance_status === 'absent').length,
      dayOffStaff: allEmployees.filter(emp => emp.attendance_status === 'day-off').length,
      totalPayroll: allEmployees.reduce((total, emp) => {
        const amount = calculatePayableAmount(emp);
        return total + amount;
      }, 0),
      totalPresent: allEmployees.filter(emp => emp.attendance_status === 'present').length,
      totalAbsent: allEmployees.filter(emp => emp.attendance_status === 'absent').length
    };

    setMonthlyTotals(totals);
  };

  // Update totals when data changes
  useEffect(() => {
    calculateMonthlyTotals(staffData, consultantData);
  }, [staffData, consultantData]);

  // Update modal props to include monthlyTotals
  const staffModalProps = {
    selectedRecord,
    isModalVisible,
    selectedDate,
    handleDateChange: (date) => setSelectedDate(date.format('YYYY-MM-DD')),
    handleModalClose: () => {
      setIsModalVisible(false);
      setSelectedRecord(null);
    },
    handleQuickStatusUpdate,
    handleModalStatusChange,
    calculateMonthlyDetails,
    calculatePayableAmount,
    monthlyTotals,
    statusOptions: [
      { value: 'present', label: 'Present' },
      { value: 'absent', label: 'Absent' },
      { value: 'half-day', label: 'Half Day' },
      { value: 'day-off', label: 'Day Off' }
    ]
  };

  const consultantModalProps = {
    selectedRecord,
    isModalVisible,
    selectedDate,
    handleDateChange: (date) => setSelectedDate(date.format('YYYY-MM-DD')),
    handleModalClose: () => {
      setIsModalVisible(false);
      setSelectedRecord(null);
    },
    handleQuickStatusUpdate,
    handleModalStatusChange,
    calculatePayableAmount,
    monthlyTotals,
    statusOptions: [
      { value: 'present', label: 'Present' },
      { value: 'absent', label: 'Absent' },
      { value: 'half-day', label: 'Half Day' },
      { value: 'day-off', label: 'Day Off' }
    ]
  };

  const fetchStaffData = async (date = selectedDate) => {
    try {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const response = await fetchStaffAttendances(formattedDate);
      if (response.success) {
        setStaffData(response.data);
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
      message.error('Failed to fetch staff data');
    }
  };

  const fetchConsultantData = async (date = selectedDate) => {
    try {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const response = await fetchConsultantAttendances(formattedDate);
      if (response.success) {
        setConsultantData(response.data);
      }
    } catch (error) {
      console.error('Error fetching consultant data:', error);
      message.error('Failed to fetch consultant data');
    }
  };

  const handleCreateAttendance = async () => {
    try {
      setLoading(true);
      const response = await createManualAttendance();
      
      if (response.success) {
        message.success('Attendance created successfully');
        await fetchAttendanceData(moment().format('YYYY-MM-DD'));
      } else {
        message.error(response.message || 'Failed to create attendance');
      }
    } catch (error) {
      console.error('Error creating attendance:', error);
      message.error(error.message || 'Failed to create attendance');
    } finally {
      setLoading(false);
    }
  };

  const showDetailModal = (record) => {
    try {
        console.log('Opening modal for:', record);
        if (!record) {
            console.error('No record provided to modal');
            return;
        }
        setSelectedRecord({...record});
        setIsModalVisible(true);
    } catch (error) {
        console.error('Error showing modal:', error);
        message.error('Failed to open details');
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-boxdark-2">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-meta-2">
                Total Staff
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {staffData.length}
              </h3>
            </div>
            <Users className="h-8 w-8 text-blue-500 dark:text-meta-3" />
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-meta-2">
                Present Today
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {presentStaff}
              </h3>
            </div>
            <Clock className="h-8 w-8 text-green-500 dark:text-meta-3" />
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-meta-2">
                Absent Today
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {absentStaff}
              </h3>
            </div>
            <Calendar className="h-8 w-8 text-red-500 dark:text-meta-3" />
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-meta-2">
                Day Off Staff
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dayOffStaff}
              </h3>
            </div>
            <Calendar className="h-8 w-8 text-yellow-500 dark:text-meta-3" />
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm text-gray-500 dark:text-meta-2">
                Total Payroll
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ₹{totalPayroll.toLocaleString()}
              </h3>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500 dark:text-meta-3" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-8">
        {/* Header Section */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedDate === moment().format("YYYY-MM-DD")
              ? "Today's Attendances"
              : `Attendances for ${moment(selectedDate).format('DD MMM YYYY')}`}
          </h2>

          {/* Search & Date */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-boxdark-2 
                          border border-gray-200 dark:border-strokedark rounded-xl 
                          focus:outline-none focus:ring-2 focus:ring-primary/20
                          text-black dark:text-white"
              />
            </div>

            {/* Ant Design DatePicker with Tailwind styles */}
            <DatePicker 
              value={moment(selectedDate)}
              onChange={(date, dateString) => setSelectedDate(dateString)}
              format="DD MMM YYYY"
              className="w-full sm:w-44 h-[42px] !rounded-xl antd-datepicker-custom
                        !border-gray-200 dark:!border-strokedark 
                        !bg-white dark:!bg-boxdark-2"
            />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <Tabs 
            defaultActiveKey="staff"
            items={tabItems}
            className="attendance-tabs"
            tabBarStyle={{
              margin: 0,
              padding: '16px 16px 0',
            }}
          />
        </div>
      </div>

      {/* Render Modals */}
      {renderStaffModal()}
      {renderConsultantModal()}

      {/* Download Modal */}
      {DownloadModal}

      <Box sx={{ p: 2 }}>
        <Button
          type="primary"
          loading={loading}
          onClick={handleCreateAttendance}
          className="bg-blue-500"
        >
          Create Today's Attendance
        </Button>
      </Box>
    </div>
  );
};

// Add this to your services.js file
const fetchAttendanceReport = async (startDate, endDate) => {
  try {
    const response = await axios.get('/api/attendance/report', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add these styles to your global CSS file
const styles = `
/* Custom styles for Ant Design DatePicker */
.antd-datepicker-custom {
  @apply !px-4 !py-2;
}

.antd-datepicker-custom:hover {
  @apply !border-primary;
}

.antd-datepicker-custom .ant-picker-input > input {
  @apply text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500;
}

.antd-datepicker-custom .ant-picker-suffix {
  @apply text-gray-400 dark:text-gray-500;
}

/* DatePicker Dropdown Panel */
.ant-picker-dropdown {
  @apply dark:bg-boxdark-2 dark:border-strokedark;
}

.ant-picker-dropdown .ant-picker-cell-in-view {
  @apply dark:text-white;
}

.ant-picker-dropdown .ant-picker-cell-selected .ant-picker-cell-inner {
  @apply !bg-primary dark:!text-white;
}

.ant-picker-dropdown .ant-picker-header {
  @apply dark:text-white dark:border-strokedark;
}

.ant-picker-dropdown .ant-picker-header button {
  @apply dark:text-gray-400 hover:dark:text-white;
}

.ant-picker-dropdown .ant-picker-content th {
  @apply dark:text-gray-400;
}
`;

export default Management;