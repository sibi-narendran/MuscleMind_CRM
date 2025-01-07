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
import { Modal, DatePicker, Alert, message, Input, Table, Tabs,Button, Select, InputNumber, Space } from "antd";
import moment from "moment";
import {
  fetchStaffAttendances,
  updateAttendanceStatus,
  updateConsultantAttendanceStatus,
  createManualAttendance,
  getStaffDetails,
  downloadStaffReport,
  getConsultantDetails,
  getConsultantAttendances,
  downloadConsultantReport,
  calculateConsultantPayable,
  getConsultantStatusColor,
  consultantStatusOptions
} from "../interceptor/services";
import * as XLSX from 'xlsx';
import { Box } from '@mui/material';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import ExcelJS from 'exceljs';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 1. First, declare constants outside the component
const statusOptions = [
  { value: 'present', label: 'Present', color: 'text-green-600' },
  { value: 'absent', label: 'Absent', color: 'text-red-600' },
  { value: 'half-day', label: 'Half Day', color: 'text-yellow-600' },
  { value: 'holiday', label: 'Holiday', color: 'text-blue-600' },
  { value: 'day-off', label: 'Day Off', color: 'text-purple-600' }
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
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffDetails, setStaffDetails] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [downloadDateRange, setDownloadDateRange] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [modalDate, setModalDate] = useState(moment());
  const [loadingRows, setLoadingRows] = useState({});
  const [isConsultantModalVisible, setIsConsultantModalVisible] = useState(false);
  const [isStaffModalVisible, setIsStaffModalVisible] = useState(false);

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
    try {
      setLoadingRows(prev => ({ ...prev, [record.id]: true }));
      
      const formattedDate = moment(modalDate).format('YYYY-MM-DD');
      const updateFunction = record.type === 'staff' 
        ? updateAttendanceStatus 
        : updateConsultantAttendanceStatus;

      const response = await updateFunction(record.id, {
        status: newStatus,
        date: formattedDate
      });

      if (response.success) {
        // Update both table and modal data
        if (isModalVisible && selectedRecord?.id === record.id) {
          setSelectedRecord(prev => ({
            ...prev,
            attendance_status: newStatus
          }));
        }
        
        // Refresh the table data
        await fetchAttendanceData(formattedDate);
        message.success('Status updated successfully');
      } else {
        message.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status');
    } finally {
      setLoadingRows(prev => ({ ...prev, [record.id]: false }));
    }
  };

  // Update status for staff

  // 5. Effects
  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate]);

  // 6. Modals - keeping exactly the same
  const renderStaffModal = () => {
    if (!selectedRecord) return null;

    // Get appropriate status options based on employee type
    const statusOptionsToUse = selectedRecord.type === 'staff' 
      ? staffStatusOptions 
      : consultantStatusOptions;

    return (
      <Modal
        title={
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-xl font-semibold text-gray-800">{selectedRecord.name}'s Details</h2>
            <DatePicker 
              value={modalDate}
              onChange={handleModalDateChange}
              format="DD MMM YYYY"
              className="border rounded-lg"
              allowClear={false}
              disabledDate={(current) => {
                // Disable future dates
                return current && current > moment().endOf('day');
              }}
            />
          </div>
        }
        open={isStaffModalVisible}
        onCancel={handleStaffModalClose}
        footer={null}
        width={800}
        className="staff-details-modal"
      >
        <div className="space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Personal Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{selectedRecord.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialisation:</span>
                  <span className="font-medium">{selectedRecord.specialisation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Employee Type:</span>
                  <span className="font-medium capitalize">{selectedRecord.type}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Joining:</span>
                  <span className="font-medium">{moment(selectedRecord.doj).format('DD MMM YYYY')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Salary:</span>
                  <span className="font-medium text-blue-600">₹{selectedRecord.salary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Leave Balance:</span>
                  <span className="font-medium">{selectedRecord.leave_balances} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance & Payroll Card */}
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Attendance & Payroll Details</h3>
              <Button 
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadReport(selectedRecord)}
                loading={loadingRows[`download_${selectedRecord?.id}`]}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {loadingRows[`download_${selectedRecord?.id}`] ? 'Downloading...' : 'Download Report'}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Current Day Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 text-gray-700">Today's Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{moment(selectedRecord.date).format('DD MMM YYYY')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${getStatusClass(selectedRecord.attendance_status)}`}>
                      {selectedRecord.attendance_status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Today's Payable:</span>
                    <span className="text-blue-600 font-medium">
                      ₹{selectedRecord.monthly_statistics?.daily_rate?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 text-gray-700">Monthly Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Basic:</span>
                    <span className="text-blue-600 font-medium">₹{selectedRecord.salary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Rate:</span>
                    <span className="font-medium">₹{selectedRecord.monthly_statistics?.daily_rate?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Payable:</span>
                    <span className="text-blue-600 font-medium">
                      ₹{selectedRecord.monthly_statistics?.total_payable?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Updated Attendance Status Card */}
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Update Attendance Status</h3>
              <Select
                value={selectedRecord.attendance_status}
                onChange={(newStatus) => handleQuickStatusUpdate(selectedRecord, newStatus)}
                className="w-40"
                loading={loadingRows[selectedRecord.id]}
                disabled={loadingRows[selectedRecord.id]}
              >
                {statusOptionsToUse.map(status => (
                  <Option 
                    key={status.value} 
                    value={status.value}
                    className={`${getStatusClass(status.value)} capitalize`}
                  >
                    {status.label}
                  </Option>
                ))}
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <span className={`font-medium ${getStatusClass(selectedRecord.attendance_status)}`}>
                    {selectedRecord.attendance_status.charAt(0).toUpperCase() + 
                     selectedRecord.attendance_status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Selected Date:</span>
                  <span>{moment(modalDate).format('DD MMM YYYY')}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Rate:</span>
                  <span className="font-medium">
                    ₹{selectedRecord.monthly_statistics?.daily_rate?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payable Amount:</span>
                  <span className="font-medium text-primary">
                    ₹{calculatePayableAmount(selectedRecord).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Change History or Additional Info */}
            <div className="mt-4 text-sm text-gray-500">
              <p>Last updated: {moment(selectedRecord.updated_at).format('DD MMM YYYY, hh:mm A')}</p>
            </div>
          </div>

          {/* Attendance Statistics Card */}
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Monthly Attendance Statistics</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">Present Days:</span>
                <span className="font-medium text-green-600">{selectedRecord.monthly_statistics?.present_days || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-gray-600">Absent Days:</span>
                <span className="font-medium text-red-600">{selectedRecord.monthly_statistics?.absent_days || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-600">Half Days:</span>
                <span className="font-medium text-yellow-600">{selectedRecord.monthly_statistics?.half_days || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600">LOP Days:</span>
                <span className="font-medium text-orange-600">{selectedRecord.monthly_statistics?.lop_days || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600">Holiday Days:</span>
                <span className="font-medium text-blue-600">{selectedRecord.monthly_statistics?.holiday_days || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-600">Working Days:</span>
                <span className="font-medium text-purple-600">{selectedRecord.monthly_statistics?.working_days || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  // Consultant Modal Component
  const renderConsultantModal = () => {
    if (!selectedRecord) return null;

    return (
      <Modal
        title={
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-xl font-semibold text-gray-800">{selectedRecord.name}'s Details</h2>
            <DatePicker 
              value={moment(selectedRecord.date)}
              onChange={handleModalDateChange}
              format="DD MMM YYYY"
              className="border rounded-lg"
              allowClear={false}
            />
          </div>
        }
        open={isConsultantModalVisible}
        onCancel={handleConsultantModalClose}
        footer={null}
        width={800}
      >
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Personal Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{selectedRecord.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span>{selectedRecord.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Specialisation:</span>
                <span>{selectedRecord.specialisation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Rate:</span>
                <span className="font-medium">₹{selectedRecord.salary?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Attendance Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className={`font-medium ${getConsultantStatusColor(selectedRecord.attendance_status)}`}>
                  {selectedRecord.attendance_status?.charAt(0).toUpperCase() + 
                   selectedRecord.attendance_status?.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{moment(selectedRecord.date).format('DD MMM YYYY')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>{moment(selectedRecord.updated_at).format('DD MMM YYYY HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payable Amount:</span>
                <span className="font-medium text-primary">
                  ₹{selectedRecord.payable_amount?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Status Update Section */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Update Attendance Status</h3>
            <Select
              value={selectedRecord.attendance_status}
              onChange={(newStatus) => handleConsultantStatusUpdate(selectedRecord, newStatus)}
              className="w-40"
              loading={loadingRows[selectedRecord.id]}
            >
              {consultantStatusOptions.map(option => (
                <Option 
                  key={option.value} 
                  value={option.value}
                  className={option.color}
                >
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* Report Download Section */}
        <div className="flex justify-end">
          <Button 
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleConsultantReportDownload(selectedRecord)}
            loading={loadingRows[`download_${selectedRecord.id}`]}
          >
            Download Report
          </Button>
        </div>
      </Modal>
    );
  };

  const handleViewClick = async (record) => {
    try {
      setLoadingRows(prev => ({ ...prev, [record.id]: true }));
      
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
      const isConsultant = record.type === 'consultant';
      
      const response = isConsultant 
        ? await getConsultantDetails(record.dental_team_id, formattedDate)
        : await getStaffDetails(record.dental_team_id, formattedDate);

      if (response.success) {
        setSelectedRecord({
          ...record,
          ...response.data,
          employeeType: isConsultant ? 'consultant' : 'staff'
        });
        
        // Set the correct modal visibility
        if (isConsultant) {
          setIsConsultantModalVisible(true);
        } else {
          setIsStaffModalVisible(true);
        }
      } else {
        message.error('Failed to fetch details');
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      message.error('Failed to fetch details');
    } finally {
      setLoadingRows(prev => ({ ...prev, [record.id]: false }));
    }
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
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => moment(date).format('DD MMM YYYY'),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
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
          loading={loadingRows[record.id]}
          icon={!loadingRows[record.id] && <EyeOutlined />}
          className="bg-blue-500"
        >
          {loadingRows[record.id] ? 'Loading' : 'View'}
        </Button>
      ),
    },
  ];

  const consultantColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Specialisation",
      dataIndex: "specialisation",
      key: "specialisation",
      render: (specialisation) => specialisation || 'N/A',
      sorter: (a, b) => (a.specialisation || '').localeCompare(b.specialisation || ''),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => moment(date).format('DD MMM YYYY'),
    },
    {
      title: "Status",
      dataIndex: "attendance_status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => handleConsultantStatusUpdate(record, newStatus)}
          className="w-32"
          loading={loadingRows[record.id]}
        >
          {consultantStatusOptions.map(option => (
            <Option key={option.value} value={option.value}>
              <span className={option.color}>{option.label}</span>
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: "Daily Pay",
      dataIndex: "salary",
      key: "daily_pay",
      render: (salary) => `₹${(salary || 0).toLocaleString()}`,
      sorter: (a, b) => (a.salary || 0) - (b.salary || 0),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleViewClick({ ...record, type: 'consultant' })}
          icon={<EyeOutlined />}
          loading={loadingRows[record.id]}
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

  const handleViewDetails = async (record, type) => {
    try {
      setLoading(true);
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
      
      let response;
      if (type === 'staff') {
        response = await getStaffDetails(record.dental_team_id, formattedDate);
      } else {
        response = await getConsultantDetails(record.dental_team_id, formattedDate);
      }

      if (response.success) {
        showDetailModal(response.data);
      } else {
        message.error('Failed to fetch details');
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      message.error('Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (record) => {
    try {
      setLoadingRows(prev => ({ ...prev, [`download_${record.id}`]: true }));
      
      const startDate = moment(selectedDate).startOf('month').format('YYYY-MM-DD');
      const endDate = moment(selectedDate).endOf('month').format('YYYY-MM-DD');
      
      const response = await downloadStaffReport(record.dental_team_id, startDate, endDate);
      
      // Create blob from response
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${record.name}_attendance_report_${moment(selectedDate).format('MMM_YYYY')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      message.error('Failed to download report: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingRows(prev => ({ ...prev, [`download_${record.id}`]: false }));
    }
  };

  const renderDetailsModal = () => (
    <Modal
      title={`${selectedEmployee?.name || 'Employee'}'s Details`}
      open={isDetailsModalVisible}
      onCancel={() => {
        setIsDetailsModalVisible(false);
        setSelectedEmployee(null);
        setEmployeeDetails(null);
      }}
      footer={null}
      width={800}
    >
      {loading ? (
        <div>Loading...</div>
      ) : employeeDetails ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Basic Information</h3>
              <p>Name: {employeeDetails.name}</p>
              <p>Specialisation: {employeeDetails.specialisation}</p>
              <p>Type: {selectedEmployee?.employeeType === 'staff' ? 'Staff' : 'Consultant'}</p>
              {selectedEmployee?.employeeType === 'staff' && (
                <p>Date of Joining: {moment(employeeDetails.doj).format('DD MMM YYYY')}</p>
              )}
              <p>Monthly Salary: ₹{employeeDetails.salary}</p>
            </div>
            <div>
              <h3 className="font-semibold">Monthly Statistics</h3>
              <p>Present Days: {employeeDetails.monthly_statistics?.present_days || 0}</p>
              <p>Absent Days: {employeeDetails.monthly_statistics?.absent_days || 0}</p>
              {selectedEmployee?.employeeType === 'staff' && (
                <>
                  <p>Half Days: {employeeDetails.monthly_statistics?.half_days || 0}</p>
                  <p>LOP Days: {employeeDetails.monthly_statistics?.lop_days || 0}</p>
                  <p>Leave Balance: {employeeDetails.leave_balances || 0} days</p>
                </>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Payroll Information</h3>
            <p>Daily Rate: ₹{(employeeDetails.monthly_statistics?.daily_rate || 0).toFixed(2)}</p>
            <p>Total Payable: ₹{(employeeDetails.monthly_statistics?.total_payable || 0).toFixed(2)}</p>
          </div>
        </div>
      ) : (
        <div>No data available</div>
      )}
    </Modal>
  );

  const renderDownloadModal = () => (
    <Modal
      title="Download Attendance Report"
      open={isDownloadModalVisible}
      onOk={() => handleDownloadReport(selectedStaff)}
      onCancel={() => setIsDownloadModalVisible(false)}
    >
      <div className="space-y-4">
        <p>Select date range for the report:</p>
        <RangePicker
          value={downloadDateRange}
          onChange={setDownloadDateRange}
          className="w-full"
        />
      </div>
    </Modal>
  );

  const handleModalDateChange = async (date) => {
    try {
      setLoading(true);
      setModalDate(date);
      const formattedDate = date.format('YYYY-MM-DD');
      
      if (selectedRecord) {
        const isConsultant = selectedRecord.type === 'consultant';
        const detailsResponse = isConsultant 
          ? await getConsultantDetails(selectedRecord.dental_team_id, formattedDate)
          : await getStaffDetails(selectedRecord.dental_team_id, formattedDate);

        if (detailsResponse.success) {
          setSelectedRecord(detailsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error updating modal date:', error);
      message.error('Failed to fetch updated details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch consultant attendances
  const fetchConsultantAttendances = async (date) => {
    try {
      setLoading(true);
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const response = await getConsultantAttendances(formattedDate);
      
      if (response.success) {
        setConsultantData(response.data);
      } else {
        message.error('Failed to fetch consultant data');
      }
    } catch (error) {
      console.error('Error fetching consultant data:', error);
      message.error('Failed to fetch consultant data');
    } finally {
      setLoading(false);
    }
  };

  // Handle consultant status update
  const handleConsultantStatusUpdate = async (record, newStatus) => {
    try {
      setLoadingRows(prev => ({ ...prev, [record.id]: true }));
      
      const response = await updateConsultantAttendanceStatus(record.id, {
        status: newStatus,
        date: moment(selectedDate).format('YYYY-MM-DD')
      });

      if (response.success) {
        message.success('Status updated successfully');
        
        // Fetch updated data for the modal
        const detailsResponse = await getConsultantDetails(
          record.dental_team_id, 
          moment(selectedDate).format('YYYY-MM-DD')
        );

        if (detailsResponse.success) {
          setSelectedRecord(detailsResponse.data);
        }

        // Refresh the table data
        await fetchConsultantAttendances(selectedDate);
      } else {
        message.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status');
    } finally {
      setLoadingRows(prev => ({ ...prev, [record.id]: false }));
    }
  };

  // Handle consultant report download
  const handleConsultantReportDownload = async (record) => {
    try {
      setLoadingRows(prev => ({ ...prev, [`download_${record.id}`]: true }));
      
      const startDate = moment(selectedDate).startOf('month').format('YYYY-MM-DD');
      const endDate = moment(selectedDate).endOf('month').format('YYYY-MM-DD');
      
      const response = await downloadConsultantReport(record.dental_team_id, startDate, endDate);
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${record.name}_consultant_report_${moment(selectedDate).format('MMM_YYYY')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      message.error('Failed to download report');
    } finally {
      setLoadingRows(prev => ({ ...prev, [`download_${record.id}`]: false }));
    }
  };

  const handleStaffModalClose = () => {
    setIsStaffModalVisible(false);
    setSelectedRecord(null);
  };

  const handleConsultantModalClose = () => {
    setIsConsultantModalVisible(false);
    setSelectedRecord(null);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-boxdark-2">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white dark:bg-boxdark p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-meta-2">
                Total Staff
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {staffData.length}
              </h3>
            </div>
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 dark:text-meta-3" />
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-meta-2">
                Present Today
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {presentStaff}
              </h3>
            </div>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 dark:text-meta-3" />
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-meta-2">
                Absent Today
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {absentStaff}
              </h3>
            </div>
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 dark:text-meta-3" />
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-meta-2">
                Day Off Staff
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dayOffStaff}
              </h3>
            </div>
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 dark:text-meta-3" />
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-meta-2">
                Total Payroll
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ₹{totalPayroll.toLocaleString()}
              </h3>
            </div>
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 dark:text-meta-3" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-4 sm:mt-8 overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-4 overflow-x-auto hide-scrollbar">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            {selectedDate === moment().format("YYYY-MM-DD")
              ? "Today's Attendances"
              : `Attendances for ${moment(selectedDate).format('DD MMM YYYY')}`}
          </h2>

          {/* Search & Date */}
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search by name"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 sm:py-2.5 bg-white dark:bg-boxdark-2 
                          border border-gray-200 dark:border-strokedark rounded-xl 
                          focus:outline-none focus:ring-2 focus:ring-primary/20
                          text-sm sm:text-base text-black dark:text-white"
              />
            </div>

            {/* Ant Design DatePicker with Tailwind styles */}
            <DatePicker 
              value={moment(selectedDate)}
              onChange={(date, dateString) => setSelectedDate(dateString)}
              format="DD MMM YYYY"
              className="w-full md:w-44 h-[38px] sm:h-[42px] !rounded-xl antd-datepicker-custom
                        !border-gray-200 dark:!border-strokedark 
                        !bg-white dark:!bg-boxdark-2
                        !text-sm sm:!text-base"
            />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-gray-100 dark:border-strokedark overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <Tabs 
              defaultActiveKey="staff"
              items={tabItems}
              className="attendance-tabs"
              tabBarStyle={{
                margin: 0,
                padding: '12px 12px 0 12px',
                '@media (min-width: 640px)': {
                  padding: '16px 16px 0',
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Create Attendance Button */}
      <Box sx={{ p: { xs: 1, sm: 2 }, mt: { xs: 2, sm: 3 } }}>
        <Button
          type="primary"
          loading={loading}
          onClick={handleCreateAttendance}
          className="bg-blue-500 w-full sm:w-auto text-sm sm:text-base py-1.5 sm:py-2"
        >
          Create Today's Attendance
        </Button>
      </Box>

      {renderDetailsModal()}
      {renderDownloadModal()}
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
  @apply !px-3 sm:!px-4 !py-1.5 sm:!py-2 w-full md:w-auto;
}

/* Responsive Search and Date Container */
@media (max-width: 768px) {
  .attendance-tabs .search-date-container {
    @apply flex-col w-full;
  }
  
  .attendance-tabs .search-input,
  .attendance-tabs .ant-picker {
    @apply w-full;
  }
}

/* Hide scrollbar but keep functionality */
.hide-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
}

/* Table Container Styles */
.attendance-tabs {
  @apply w-full overflow-x-auto hide-scrollbar;
}

.attendance-tabs .ant-table-wrapper {
  @apply overflow-x-auto hide-scrollbar;
}

.attendance-tabs .ant-table {
  @apply min-w-[640px]; /* Minimum width to prevent squishing */
}

/* Table Row Styles */
.attendance-tabs .ant-table-tbody > tr > td {
  @apply text-xs sm:text-sm whitespace-nowrap bg-white dark:bg-boxdark;
  border-bottom: 1px solid #f0f0f0;
}

.attendance-tabs .ant-table-tbody > tr:hover > td {
  @apply bg-gray-50 dark:bg-boxdark-2 !important;
}

/* Make table header stick to top while scrolling */
.attendance-tabs .ant-table-thead > tr > th {
  @apply text-xs sm:text-sm whitespace-nowrap sticky top-0 bg-white dark:bg-boxdark z-10 border-b border-gray-200 dark:border-strokedark;
}

/* Table Cell Padding */
.attendance-tabs .ant-table-cell {
  @apply px-2 sm:px-4 py-3;
}

/* Table Background */
.attendance-tabs .ant-table-container {
  @apply bg-white dark:bg-boxdark;
}

/* Table Border Styles */
.attendance-tabs .ant-table {
  @apply border-separate border-spacing-0;
}

.attendance-tabs .ant-table-tbody > tr:last-child > td {
  border-bottom: none;
}

/* Modal Responsive Styles */
.ant-modal {
  @apply max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px];
}

.ant-modal-content {
  @apply p-4 sm:p-6 overflow-x-auto hide-scrollbar;
}

.ant-modal-body {
  @apply text-sm sm:text-base overflow-x-auto hide-scrollbar;
}

/* Modal Content Scrolling */
.ant-modal-body {
  max-height: calc(90vh - 130px);
  overflow-y: auto;
  @apply hide-scrollbar;
}

/* Table Select Styles */
.attendance-tabs .ant-select {
  @apply min-w-[120px];
}

.attendance-tabs .ant-select-selector {
  @apply rounded-lg border-gray-200 dark:border-strokedark;
}

/* Status Colors */
.attendance-tabs .text-green-500 {
  @apply bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg;
}

.attendance-tabs .text-red-500 {
  @apply bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg;
}

.attendance-tabs .text-yellow-500 {
  @apply bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg;
}

.attendance-tabs .text-blue-500 {
  @apply bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg;
}

/* Table Container Styles */
.attendance-tabs .ant-table-wrapper {
  @apply w-full overflow-x-auto;
}

/* Table Background and Row Styles */
.attendance-tabs .ant-table {
  @apply min-w-full bg-white dark:bg-boxdark;
}

/* Table Row Background */
.attendance-tabs .ant-table-tbody > tr {
  @apply bg-white dark:bg-boxdark w-full;
}

.attendance-tabs .ant-table-tbody > tr > td {
  @apply text-xs sm:text-sm whitespace-nowrap bg-white dark:bg-boxdark border-b border-gray-200 dark:border-strokedark;
}

/* Table Row Hover */
.attendance-tabs .ant-table-tbody > tr:hover {
  @apply bg-gray-50 dark:bg-boxdark-2;
}

.attendance-tabs .ant-table-tbody > tr:hover > td {
  @apply bg-gray-50 dark:bg-boxdark-2 !important;
}

/* Table Header */
.attendance-tabs .ant-table-thead > tr > th {
  @apply text-xs sm:text-sm whitespace-nowrap sticky top-0 bg-white dark:bg-boxdark z-10 
         border-b border-gray-200 dark:border-strokedark w-full;
}

/* Table Cell Padding */
.attendance-tabs .ant-table-cell {
  @apply px-4 py-3;
}

/* Ensure full width on mobile */
@media (max-width: 640px) {
  .attendance-tabs .ant-table {
    @apply w-[100vw];
  }
  
  .attendance-tabs .ant-table-tbody > tr > td,
  .attendance-tabs .ant-table-thead > tr > th {
    @apply min-w-[120px];  /* Minimum width for cells on mobile */
  }
}

/* Table Container */
.attendance-tabs .ant-table-container {
  @apply bg-white dark:bg-boxdark overflow-x-auto w-full;
}
`;

export default Management;