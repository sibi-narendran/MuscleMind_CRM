const model = require('../models/staffAttendanceModel');
const { createResponse } = require('../utils/responseUtil');
const { fetchEmployeeAttendance } = require('../models/staffAttendanceModel');

const fetchAttendances = async (req, res) => {
    const { date } = req.params;
    const userId = req.user.userId;
    const result = await model.getAttendances(date, userId);
    if (result.error) {
        res.status(500).json(createResponse(false, 'Failed to fetch attendances', null, result.error));
    } else {
        if (result.data && result.data.length > 0) {
            res.status(200).json(createResponse(true, 'Attendances fetched successfully', result.data));
        } else {
            res.status(200).json(createResponse(true, 'No attendances data for the given date', []));
        }
    }
};

const editAttendanceStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    const result = await model.updateAttendanceStatus(id, status, userId);
    if (result.error) {
        res.status(500).json(createResponse(false, 'Failed to update attendance status', null, result.error));
    } else {
        res.status(200).json(createResponse(true, 'Attendance status updated successfully', result.data));
    }
};

const getEmployeeAttendance = async (req, res) => {
    const dentalTeamId = req.params.dental_team_id;  // Corrected to match the route parameter
    const userId = req.user.userId;

    console.log("Dental Team ID:", dentalTeamId);
    console.log("User ID:", userId);

    try {
        const data = await fetchEmployeeAttendance(dentalTeamId, userId);
        if (data.length === 0) {
            res.status(404).json({ success: false, message: 'No attendance records found' });
        } else {
            res.status(200).json({ success: true, data: data });
        }
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch attendance data' });
    }
};




module.exports = { fetchAttendances, editAttendanceStatus, getEmployeeAttendance };
