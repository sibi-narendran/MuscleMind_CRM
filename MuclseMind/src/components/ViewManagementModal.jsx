import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import moment from 'moment';
import { fetchEmployeeAttendance } from '../api.services/services';

const ViewManagementModal = ({ isVisible, onClose, dentalTeamId }) => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    console.log("Modal visibility:", isVisible, "Dental Team ID:", dentalTeamId);
    if (dentalTeamId && isVisible) {
      fetchAttendanceData(dentalTeamId);
    }
  }, [dentalTeamId, isVisible]);

  const fetchAttendanceData = async (dentalTeamId) => {
    try {
      const response = await fetchEmployeeAttendance(dentalTeamId);
      if (response.success) {
        setAttendanceData(response.data);
      } else {
        message.error('Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      message.error('Error fetching attendance data');
    }
  };

  return (
<Modal
  title={`Attendance Details for Dental Team ID: ${dentalTeamId}`}
  visible={isVisible}
  onCancel={onClose}
  footer={null}
>
  <div style={{ padding: '20px' }}>
    {attendanceData.length > 0 ? (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '2px solid #ccc', padding: '10px', textAlign: 'left' }}>Date</th>
            <th style={{ borderBottom: '2px solid #ccc', padding: '10px', textAlign: 'left' }}>Name</th>
            <th style={{ borderBottom: '2px solid #ccc', padding: '10px', textAlign: 'center' }}>Attendance Status</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((attendance, index) => (
            <tr key={index}>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{moment(attendance.date).format('MMMM Do YYYY')}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{attendance.name}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'center' }}>{attendance.attendance_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No attendance records found.</p>
    )}
  </div>
</Modal>
  );
};

export default ViewManagementModal; 