const staffAttendanceService = require('../services/StaffAttendancesServices');
const { createResponse } = require('../utils/responseUtil');
const AttendanceCreationService = require('../services/AttendanceCreationService');

const fetchAttendances = async (req, res) => {
    try {
        const { date } = req.params;
        const userId = req.user.id;

        const result = await staffAttendanceService.getAttendances(date, userId);
        
        if (result.error) {
            return res.status(500).json(
                createResponse(false, 'Failed to fetch attendances', null, result.error)
            );
        }
        
        return res.status(200).json(
            createResponse(true, 'Attendances fetched successfully', result.data)
        );
    } catch (error) {
        return res.status(500).json(
            createResponse(false, 'Internal server error', null, error.message)
        );
    }
};

const editAttendanceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = req.body.status?.status || req.body.status;
        const date = req.body.status?.date || req.body.date;
        const userId = req.user.id;

        if (!id || !status || !date) {
            return res.status(400).json(
                createResponse(false, 'Missing required parameters', null, 
                    `ID: ${id}, status: ${status}, date: ${date} - all are required`)
            );
        }

        const result = await staffAttendanceService.updateAttendanceStatus(id, status, date, userId);
        
        if (result.error) {
            return res.status(400).json(
                createResponse(false, result.error, null, result.error)
            );
        }
        
        return res.status(200).json(
            createResponse(true, result.message || 'Attendance status updated successfully', result.data)
        );
    } catch (error) {
        console.error('Error in editAttendanceStatus:', error);
        return res.status(500).json(
            createResponse(false, 'Internal server error', null, error.message)
        );
    }
};

const getMonthlyAttendanceSummary = async (req, res) => {
    try {
        const { date } = req.params;
        const userId = req.user.id;

        const result = await staffAttendanceService.getMonthlyAttendanceSummary(userId, date);
        
        if (result.error) {
            return res.status(500).json(
                createResponse(false, 'Failed to fetch monthly summary', null, result.error)
            );
        }
        
        return res.status(200).json(
            createResponse(true, 'Monthly summary fetched successfully', result.data)
        );
    } catch (error) {
        return res.status(500).json(
            createResponse(false, 'Internal server error', null, error.message)
        );
    }
};

const getConsultantAttendances = async (req, res) => {
    try {
        const { date } = req.params;
        const userId = req.user.id;

        const result = await staffAttendanceService.getConsultantAttendances(date, userId);
        
        if (result.error) {
            return res.status(500).json(
                createResponse(false, 'Failed to fetch consultant attendances', null, result.error)
            );
        }
        
        return res.status(200).json(
            createResponse(true, 'Consultant attendances fetched successfully', result.data)
        );
    } catch (error) {
        return res.status(500).json(
            createResponse(false, 'Internal server error', null, error.message)
        );
    }
};

const updateConsultantAttendanceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, date } = req.body;
        const userId = req.user.id;
    console.log(userId);
    

        const result = await staffAttendanceService.updateConsultantAttendanceStatus(id, status, date, userId);
        
        if (result.error) {
            return res.status(400).json(
                createResponse(false, result.error, null, result.error)
            );
        }
        
        return res.status(200).json(
            createResponse(true, 'Consultant attendance status updated successfully', result.data)
        );
    } catch (error) {
        return res.status(500).json(
            createResponse(false, 'Internal server error', null, error.message)
        );
    }
};

const createManualAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Triggering manual attendance creation for user:', userId);
        
        const result = await AttendanceCreationService.createDailyAttendances();
        
        if (result.success) {
            return res.status(200).json(
                createResponse(true, 'Attendance created successfully', result.data)
            );
        } else {
            return res.status(500).json(
                createResponse(false, 'Failed to create attendance', null, result.error)
            );
        }
    } catch (error) {
        console.error('Error in manual attendance creation:', error);
        return res.status(500).json(
            createResponse(false, 'Internal server error', null, error.message)
        );
    }
};

module.exports = {
    fetchAttendances,
    editAttendanceStatus,
    getMonthlyAttendanceSummary,
    getConsultantAttendances,
    updateConsultantAttendanceStatus,
    createManualAttendance
};