const consultantAttendanceModel = require('../models/consultantAttendanceModel');
const moment = require('moment');

const calculateConsultantPayableAmount = (attendance) => {
    if (!attendance || !attendance.dental_team) return 0;

    // For consultants, they get paid only for present days
    switch (attendance.attendance_status.toLowerCase()) {
        case 'present':
            return attendance.dental_team.salary; // Full daily rate for present
        case 'absent':
            return 0; // No pay for absent
        default:
            return 0;
    }
};

const generateConsultantReport = async (id, startDate, endDate, userId) => {
    try {
        const { data: attendances, error } = await consultantAttendanceModel.generateConsultantReport(
            id, 
            startDate, 
            endDate, 
            userId
        );

        if (error) throw new Error(error);

        // Calculate summary
        const presentDays = attendances.filter(a => a.attendance_status === 'present').length;
        const absentDays = attendances.filter(a => a.attendance_status === 'absent').length;
        const totalDays = attendances.length;
        const dailySalary = attendances[0]?.dental_team?.salary || 0;
        const totalPayable = presentDays * dailySalary;

        // Format attendance data for Excel
        const formattedAttendances = attendances.map(a => ({
            name: a.dental_team?.name || 'N/A',
            type: 'consultant',
            specialisation: a.dental_team?.specialisation || 'N/A',
            date: moment(a.date).format('DD MMM YYYY'),
            status: a.attendance_status,
            daily_pay: a.attendance_status === 'present' ? dailySalary : 0,
            payable_amount: calculateConsultantPayableAmount(a)
        }));

        const summary = {
            employee_name: attendances[0]?.dental_team?.name || 'N/A',
            employee_type: 'consultant',
            specialisation: attendances[0]?.dental_team?.specialisation || 'N/A',
            total_days: totalDays,
            present_days: presentDays,
            absent_days: absentDays,
            daily_salary: dailySalary,
            total_payable: totalPayable
        };

        return {
            success: true,
            data: {
                attendances: formattedAttendances,
                summary
            }
        };
    } catch (error) {
        console.error('Error generating consultant report:', error);
        return { error: error.message };
    }
};

const getConsultantAttendances = async (date, userId) => {
    try {
        const { data, error } = await consultantAttendanceModel.getConsultantAttendances(date, userId);
        if (error) throw new Error(error);

        // Calculate payable amount for each attendance
        const formattedData = data.map(attendance => ({
            ...attendance,
            payable_amount: calculateConsultantPayableAmount(attendance)
        }));

        return {
            success: true,
            data: formattedData
        };
    } catch (error) {
        console.error('Error fetching consultant attendances:', error);
        return { error: error.message };
    }
};

const updateConsultantAttendance = async (id, status, userId) => {
    try {
        const { data, error } = await consultantAttendanceModel.updateConsultantAttendanceStatus(
            id, 
            status, 
            userId
        );

        if (error) throw new Error(error);

        return {
            success: true,
            data,
            message: 'Consultant attendance updated successfully'
        };
    } catch (error) {
        console.error('Error updating consultant attendance:', error);
        return {
            success: false,
            error: error.message,
            message: 'Failed to update consultant attendance'
        };
    }
};

const getConsultantDetails = async (id, date, userId) => {
    try {
        const { data, error } = await consultantAttendanceModel.getConsultantDetails(id, date, userId);
        
        if (error) throw new Error(error);

        // Calculate monthly statistics
        const startOfMonth = moment(date).startOf('month').format('YYYY-MM-DD');
        const endOfMonth = moment(date).endOf('month').format('YYYY-MM-DD');
        
        const monthlyStats = await consultantAttendanceModel.getMonthlyStatistics(
            id, 
            startOfMonth, 
            endOfMonth,
            userId
        );

        const formattedData = {
            ...data,
            monthly_statistics: monthlyStats,
            payable_amount: calculateConsultantPayableAmount(data)
        };

        return {
            success: true,
            data: formattedData
        };
    } catch (error) {
        console.error('Error fetching consultant details:', error);
        return { error: error.message };
    }
};

module.exports = {
    generateConsultantReport,
    getConsultantAttendances,
    updateConsultantAttendance,
    calculateConsultantPayableAmount,
    getConsultantDetails
}; 