const staffAttendanceService = require('../services/StaffAttendancesServices');
const { createResponse } = require('../utils/responseUtil');
const AttendanceCreationService = require('../services/AttendanceCreationService');
const ExcelJS = require('exceljs');

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

const getStaffDetails = async (req, res) => {
    try {
        const { id, date } = req.params;
        const userId = req.user.id;

        const result = await staffAttendanceService.getStaffDetails(id, date, userId);
        
        if (result.error) {
            return res.status(400).json(
                createResponse(false, result.error, null, result.error)
            );
        }
        
        return res.status(200).json(
            createResponse(true, 'Staff details fetched successfully', result.data)
        );
    } catch (error) {
        return res.status(500).json(
            createResponse(false, 'Internal server error', null, error.message)
        );
    }
};

const downloadStaffReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;
        const userId = req.user.id;

        const result = await staffAttendanceService.generateStaffReport(id, startDate, endDate, userId);
        
        if (result.error) {
            return res.status(400).json(
                createResponse(false, result.error, null, result.error)
            );
        }

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance Report');

        // Add headers with name column first
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Specialisation', key: 'specialisation', width: 20 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Leave Balance', key: 'leave_balance', width: 15 },
            { header: 'Is LOP', key: 'is_lop', width: 10 },
            { header: 'Daily Pay', key: 'daily_pay', width: 15 },
            { header: 'Monthly Salary', key: 'monthly_salary', width: 15 }
        ];

        // Style headers
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add data
        worksheet.addRows(result.data.attendances);

        // Add summary section
        worksheet.addRow([]);
        worksheet.addRow(['Summary']);
        worksheet.addRow(['Employee Name', result.data.summary.employee_name]);
        worksheet.addRow(['Employee Type', result.data.summary.employee_type]);
        worksheet.addRow(['Specialisation', result.data.summary.specialisation]);
        worksheet.addRow(['Total Present Days', result.data.summary.present_days]);
        worksheet.addRow(['Total Absent Days', result.data.summary.absent_days]);
        worksheet.addRow(['Total Half Days', result.data.summary.half_days]);
        worksheet.addRow(['Total LOP Days', result.data.summary.lop_days]);
        worksheet.addRow(['Total Holiday Days', result.data.summary.holiday_days]);
        worksheet.addRow(['Total Working Days', result.data.summary.working_days]);
        worksheet.addRow(['Monthly Salary', `₹${result.data.summary.monthly_salary}`]);
        worksheet.addRow(['Total Payable', `₹${result.data.summary.total_payable}`]);

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=attendance_report.xlsx'
        );

        // Send the workbook
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error in downloadStaffReport:', error);
        res.status(500).json(
            createResponse(false, 'Failed to generate report', null, error.message)
        );
    }
};

module.exports = {
    fetchAttendances,
    editAttendanceStatus,
    getMonthlyAttendanceSummary,
    getConsultantAttendances,
    updateConsultantAttendanceStatus,
    createManualAttendance,
    getStaffDetails,
    downloadStaffReport
};