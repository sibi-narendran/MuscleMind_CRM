const consultantAttendanceService = require('../services/ConsultantAttendanceServices');
const { createResponse } = require('../utils/responseUtil');
const ExcelJS = require('exceljs');

const fetchConsultantAttendances = async (req, res) => {
    try {
        const { date } = req.params;
        const userId = req.user.id;

        const result = await consultantAttendanceService.getConsultantAttendances(date, userId);
        
        if (result.error) {
            return res.status(400).json(
                createResponse(false, 'Failed to fetch consultant attendances', null, result.error)
            );
        }

        return res.status(200).json(
            createResponse(true, 'Consultant attendances fetched successfully', result.data)
        );
    } catch (error) {
        console.error('Error in fetchConsultantAttendances:', error);
        return res.status(500).json(
            createResponse(false, 'Internal server error', null, error.message)
        );
    }
};

const updateConsultantAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        const result = await consultantAttendanceService.updateConsultantAttendance(id, status, userId);
        
        if (!result.success) {
            return res.status(400).json(
                createResponse(false, result.message, null, result.error)
            );
        }

        return res.status(200).json(
            createResponse(true, 'Consultant attendance updated successfully', result.data)
        );
    } catch (error) {
        console.error('Error in updateConsultantAttendance:', error);
        return res.status(500).json(
            createResponse(false, 'Internal server error', null, error.message)
        );
    }
};

const downloadConsultantReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;
        const userId = req.user.id;

        const result = await consultantAttendanceService.generateConsultantReport(
            id, 
            startDate, 
            endDate, 
            userId
        );
        
        if (result.error) {
            return res.status(400).json(
                createResponse(false, 'Failed to generate report', null, result.error)
            );
        }

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Consultant Attendance Report');

        // Set headers
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Specialisation', key: 'specialisation', width: 20 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Daily Pay', key: 'daily_pay', width: 15 },
            { header: 'Payable Amount', key: 'payable_amount', width: 15 }
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
        worksheet.addRow(['Total Days', result.data.summary.total_days]);
        worksheet.addRow(['Present Days', result.data.summary.present_days]);
        worksheet.addRow(['Absent Days', result.data.summary.absent_days]);
        worksheet.addRow(['Daily Salary', `₹${result.data.summary.daily_salary}`]);
        worksheet.addRow(['Total Payable', `₹${result.data.summary.total_payable}`]);

        // Style summary section
        const summaryStartRow = worksheet.rowCount - 8;
        worksheet.getRow(summaryStartRow).font = { bold: true };
        worksheet.getRow(summaryStartRow).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=consultant_attendance_report.xlsx'
        );

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error in downloadConsultantReport:', error);
        return res.status(500).json(
            createResponse(false, 'Failed to generate report', null, error.message)
        );
    }
};

const getConsultantDetails = async (req, res) => {
    try {
        const { id, date } = req.params;
        const userId = req.user.id;

        const result = await consultantAttendanceService.getConsultantDetails(id, date, userId);
        
        if (result.error) {
            return res.status(400).json(
                createResponse(false, 'Failed to fetch consultant details', null, result.error)
            );
        }

        return res.status(200).json(
            createResponse(true, 'Consultant details fetched successfully', result.data)
        );
    } catch (error) {
        console.error('Error in getConsultantDetails:', error);
        return res.status(500).json(
            createResponse(false, 'Internal server error', null, error.message)
        );
    }
};

module.exports = {
    fetchConsultantAttendances,
    updateConsultantAttendance,
    downloadConsultantReport,
    getConsultantDetails
}; 