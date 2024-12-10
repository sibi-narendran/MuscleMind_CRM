import React, { useState, useEffect } from "react";
import { Users, Clock, DollarSign, Calendar } from "lucide-react";
import { Modal, DatePicker, Alert, message, Input, Switch, Select } from "antd";
import moment from "moment";
import {
  fetchAttendances,
  updateAttendanceStatus,
  } from "../api.services/services";
import ViewManagementModal from "./ViewManagementModal";
import { EyeOutlined } from "@ant-design/icons";

const { Option } = Select;

const Management = () => {
  const [staff, setStaff] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [searchText, setSearchText] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAttendanceModalVisible, setIsAttendanceModalVisible] =
    useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentDentalTeamId, setCurrentDentalTeamId] = useState(null);

  const handleDateChange = (date, dateString) => {
    setSelectedDate(dateString);
  };

  const handleSearchTextChange = (event) => {
    setSearchText(event.target.value);
  };

  const filteredStaff = staff.filter((member) =>
    member.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const presentCount = staff.filter(
    (member) => member.attendance_status === "Present"
  ).length;
  const absentCount = staff.filter(
    (member) => member.attendance_status === "Absent"
  ).length;
  const dayOffCount = staff.filter(
    (member) => member.attendance_status === "Day Off"
  ).length;
  const totalPayroll = staff
    .reduce((acc, member) => acc + parseFloat(member.salary), 0)
    .toFixed(2);

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const handleStatusChange = async (id, newStatus) => {
    const response = await updateAttendanceStatus(id, newStatus);
    if (response.success) {
      message.success("Attendance status updated successfully.");
      fetchData();
    } else {
      console.error("Error updating attendance status:", response.error);
      message.error("Failed to update attendance status");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Present":
        return "px-2 py-1 text-xs font-medium rounded-full text-meta-3 bg-meta-4 dark:bg-green-900"; // Class for Present
      case "Day Off":
        return "px-2 py-1 text-xs font-medium rounded-full text-meta-6 bg-meta-4 dark:bg-yellow-900"; // Class for Day Off
      case "Absent":
        return "px-2 py-1 text-xs font-medium rounded-full text-meta-1 bg-meta-4 dark:bg-red-900"; // Class for Absent
      default:
        return "px-2 py-1 text-xs font-medium rounded-full"; // Default class if no status is matched
    }
  };

  const fetchData = async () => {
    const data = await fetchAttendances(selectedDate);
    if (data.success) {
      setStaff(data.data);
    } else {
      console.error("Error fetching staff:", data.error);
      message.error("Failed to fetch staff data");
    }
  };

  const handleViewAttendance = (dentalTeamId) => {
    console.log("View button clicked, Dental Team ID:", dentalTeamId);
    setCurrentDentalTeamId(dentalTeamId);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  return (
    <div className="p-6 dark:bg-boxdark">
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-center lg:text-left">
          {selectedDate === moment().format("YYYY-MM-DD")
            ? "Today's Attendances"
            : `Attendances for ${selectedDate}`}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-meta-2">
                Total Staff
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {staff.length}
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
                {presentCount}
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
                {absentCount}
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
                {dayOffCount}
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
                ${totalPayroll}
              </h3>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500 dark:text-meta-3" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full">
        <div>
          <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark">
            <div className="p-6 border-b border-gray-200 dark:border-strokedark flex flex-col sm:flex-row items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
                {selectedDate === moment().format("YYYY-MM-DD")
                  ? "Today's Attendances"
                  : `Attendances for ${selectedDate}`}
              </h2>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Input
                  placeholder="Search by name"
                  value={searchText}
                  onChange={handleSearchTextChange}
                />
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-meta-2 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-boxdark divide-y divide-gray-200 dark:divide-strokedark">
                  {staff.length > 0 ? (
                    staff.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-gray-50 dark:hover:bg-meta-4"
                        onClick={() => handleMemberClick(member)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {moment(member.date).format("YYYY-MM-DD")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {member.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {member.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {member.doj}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {member.salary}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className={getStatusClass(member.attendance_status)}
                          >
                            {member.attendance_status || "Pending"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleViewAttendance(member.dental_team_id);
                            }}
                            className="bg-blue-500 text-white rounded px-2 py-1 flex items-center"
                          >
                            <EyeOutlined style={{ color: 'white' }} />
                            <span className="ml-1">View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedMember && (
        <Modal
          title={
            <div style={{ textAlign: "center", fontWeight: "bold" }}>
              {selectedMember.name}
            </div>
          }
          visible={!!selectedMember}
          onCancel={() => setSelectedMember(null)}
          footer={null}
        >
          <div className="flex flex-col items-center font-bold">
            <p>{selectedMember.role}</p>
            {/* <p>Date of Joining: {selectedMember.doj}</p> */}
            <div className="flex justify-between w-full px-4">
              <span>Attendance Status:</span>
              <Select
                defaultValue={selectedMember.attendance_status}
                style={{ width: 120 }}
                onChange={(newStatus) =>
                  handleStatusChange(selectedMember.id, newStatus)
                }
              >
                <Option value="Present" className="text-meta-3">
                  Present
                </Option>
                <Option value="Day Off" className="text-meta-6">
                  Day Off
                </Option>
                <Option value="Absent" className="text-meta-1">
                  Absent
                </Option>
              </Select>
            </div>
          </div>
        </Modal>
      )}

      <ViewManagementModal
        dentalTeamId={currentDentalTeamId}
        isVisible={isModalVisible}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Management;
