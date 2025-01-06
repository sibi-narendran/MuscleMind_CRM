const staffAttendanceModel = require('../models/staffAttendanceModel');
const consultantAttendanceModel = require('../models/consultantAttendanceModel');
const moment = require('moment');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MONTHLY_LEAVE_CREDIT = 2; // Fixed 2 days leave per month

const calculatePayableAmount = (attendance) => {
    if (!attendance || !attendance.dental_team) return 0;

    const monthDays = moment(attendance.date).daysInMonth();
    const dailyRate = attendance.dental_team.salary / monthDays;

    switch (attendance.attendance_status.toLowerCase()) {
        case 'present':
            return dailyRate;
        case 'half-day':
            return dailyRate / 2;
        case 'absent':
            return attendance.is_lop ? 0 : dailyRate;
        case 'holiday':
            return dailyRate; // Full pay for holidays
        case 'clinic-closed':
            return dailyRate; // Full pay when clinic is closed
        default:
            return 0;
    }
};

const getAttendances = async (date, userId) => {
    return await staffAttendanceModel.getAttendances(date, userId);
};

const updateAttendanceStatus = async (id, status, date, userId) => {
    try {
        // Check if the date is current date
        // const currentDate = moment().format('YYYY-MM-DD');
        // if (date !== currentDate) {
        //     return {
        //         success: false,
        //         error: 'Cannot modify attendance for past or future dates',
        //         message: 'You can only modify attendance for the current date'
        //     };
        // }

        // Get current attendance and leave balance details
        const { data: currentAttendance, error: fetchError } = await supabase
            .from('staff_attendances')
            .select(`
                *,
                dental_team:dental_team_id (
                    id,
                    leave_balances,
                    last_leave_update_month
                )
            `)
            .eq('id', id)
            .eq('date', date)
            .single();

        if (fetchError) throw fetchError;
        if (!currentAttendance) throw new Error('Attendance record not found');

        let currentLeaveBalance = Number(currentAttendance.dental_team.leave_balances) || 0;
        let isLOP = false;
        let newLeaveBalance = currentLeaveBalance;

        // First restore previous deduction if any
        if (currentAttendance.attendance_status === 'absent' && !currentAttendance.is_lop) {
            newLeaveBalance += 1;
        } else if (currentAttendance.attendance_status === 'half-day' && !currentAttendance.is_lop) {
            newLeaveBalance += 0.5;
        }

        // Then apply new status deduction
        if (status.toLowerCase() === 'absent') {
            if (newLeaveBalance >= 1) {
                newLeaveBalance -= 1;
                isLOP = false;
            } else {
                isLOP = true;
                newLeaveBalance = currentLeaveBalance; // Keep original balance if LOP
            }
        } else if (status.toLowerCase() === 'half-day') {
            if (newLeaveBalance >= 0.5) {
                newLeaveBalance -= 0.5;
                isLOP = false;
            } else {
                isLOP = true;
                newLeaveBalance = currentLeaveBalance; // Keep original balance if LOP
            }
        }

        // Update staff_attendances
        const { error: staffError } = await supabase
            .from('staff_attendances')
            .update({ 
                attendance_status: status,
                is_lop: isLOP,
                leave_balances: newLeaveBalance,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (staffError) throw staffError;

        // Update dental_team
        const { error: dentalTeamError } = await supabase
            .from('dental_team')
            .update({ 
                leave_balances: newLeaveBalance,
                updated_at: new Date().toISOString()
            })
            .eq('id', currentAttendance.dental_team_id);

        if (dentalTeamError) throw dentalTeamError;

        return {
            success: true,
            data: {
                ...currentAttendance,
                attendance_status: status,
                is_lop: isLOP,
                leave_balances: newLeaveBalance,
                dental_team: {
                    ...currentAttendance.dental_team,
                    leave_balances: newLeaveBalance
                }
            },
            message: `Attendance updated successfully. ${
                isLOP ? 'Marked as Loss of Pay. ' : ''
            }Leave balance: ${newLeaveBalance} days`
        };

    } catch (error) {
        console.error('Error in updateAttendanceStatus:', error);
        return {
            success: false,
            error: error.message,
            message: `Failed to update attendance: ${error.message}`
        };
    }
};

const getMonthlyAttendanceSummary = async (userId, date) => {
    try {
        const monthData = await staffAttendanceModel.getAttendances(date, userId);
        if (monthData.error) throw new Error(monthData.error);

        const summary = {
            totalDays: moment(date).daysInMonth(),
            presentDays: 0,
            halfDays: 0,
            absentDays: 0,
            lopDays: 0,
            dayOffs: 0,
            leaveBalance: monthData.data[0]?.leave_balances || 0
        };

        monthData.data.forEach(record => {
            switch(record.attendance_status.toLowerCase()) {
                case 'present':
                    summary.presentDays++;
                    break;
                case 'half-day':
                    if (record.is_lop) {
                        summary.lopDays += 0.5;
                    } else {
                        summary.halfDays++;
                    }
                    break;
                case 'absent':
                    if (record.is_lop) {
                        summary.lopDays++;
                    } else {
                        summary.absentDays++;
                    }
                    break;
                case 'day-off':
                    summary.dayOffs++;
                    break;
            }
        });

        return { data: summary };
    } catch (error) {
        return { error: error.message };
    }
};

// Consultant specific services
const getConsultantAttendances = async (date, userId) => {
    return await staffAttendanceModel.getConsultantAttendances(date, userId);
};

const updateConsultantAttendanceStatus = async (id, status, date, userId) => {
    return await consultantAttendanceModel.updateConsultantAttendanceStatus(id, status, date, userId);
};

const getStaffDetails = async (id, date, userId) => {
    try {
        // First check if it's a holiday or clinic closed day
        const dayOfWeek = moment(date).format('dddd').toLowerCase();
        
        // Check operating hours
        const { data: operatingHours, error: operatingHoursError } = await supabase
            .from('operating_hours')
            .select('*')
            .eq('day', dayOfWeek)
            .eq('user_id', userId)
            .single();

        if (operatingHoursError) throw operatingHoursError;

        // Check holidays
        const { data: holidays, error: holidaysError } = await supabase
            .from('holidays')
            .select('*')
            .eq('date', date)
            .eq('user_id', userId);

        if (holidaysError) throw holidaysError;

        // Get staff details and attendance
        const { data: staffData, error: staffError } = await supabase
            .from('staff_attendances')
            .select(`
                *,
                dental_team:dental_team_id (
                    id,
                    leave_balances,
                    last_leave_update_month,
                    doj,
                    salary
                )
            `)
            .eq('dental_team_id', id)
            .eq('date', date)
            .eq('user_id', userId)
            .single();

        if (staffError) throw staffError;

        // Override attendance status if holiday or clinic closed
        if (holidays.length > 0 || (operatingHours && operatingHours.status === 'closed')) {
            staffData.attendance_status = 'holiday';
            staffData.is_holiday = true;
            staffData.holiday_reason = holidays.length > 0 ? 'Public Holiday' : 'Clinic Closed';
        }

        // Calculate monthly statistics
        const startOfMonth = moment(date).startOf('month').format('YYYY-MM-DD');
        const endOfMonth = moment(date).endOf('month').format('YYYY-MM-DD');

        // Get monthly operating hours and holidays
        const { data: monthlyOperatingHours, error: monthlyOpError } = await supabase
            .from('operating_hours')
            .select('*')
            .eq('user_id', userId);

        const { data: monthlyHolidays, error: monthlyHolError } = await supabase
            .from('holidays')
            .select('*')
            .gte('date', startOfMonth)
            .lte('date', endOfMonth)
            .eq('user_id', userId);

        if (monthlyOpError || monthlyHolError) throw monthlyOpError || monthlyHolError;

        const { data: monthlyData, error: monthlyError } = await supabase
            .from('staff_attendances')
            .select('*')
            .eq('dental_team_id', id)
            .gte('date', startOfMonth)
            .lte('date', endOfMonth);

        if (monthlyError) throw monthlyError;

        // Calculate statistics including holidays
        const presentDays = monthlyData.filter(d => d.attendance_status === 'present').length;
        const absentDays = monthlyData.filter(d => d.attendance_status === 'absent').length;
        const halfDays = monthlyData.filter(d => d.attendance_status === 'half-day').length;
        const lopDays = monthlyData.filter(d => d.is_lop).length;
        const holidayDays = monthlyHolidays.length + 
            monthlyOperatingHours.filter(oh => oh.status === 'closed').length;

        const workingDays = moment(endOfMonth).daysInMonth() - holidayDays;
        const dailyRate = staffData.dental_team.salary / workingDays;
        const totalPayable = calculatePayableAmount(staffData);

        return {
            success: true,
            data: {
                ...staffData,
                monthly_statistics: {
                    present_days: presentDays,
                    absent_days: absentDays,
                    half_days: halfDays,
                    lop_days: lopDays,
                    holiday_days: holidayDays,
                    working_days: workingDays,
                    daily_rate: dailyRate,
                    total_payable: totalPayable
                }
            }
        };

    } catch (error) {
        console.error('Error in getStaffDetails:', error);
        return { error: error.message };
    }
};

const generateStaffReport = async (id, startDate, endDate, userId) => {
    try {
        // Get attendance data with dental team details
        const { data: attendances, error: attendanceError } = await supabase
            .from('staff_attendances')
            .select(`
                *,
                dental_team:dental_team_id (
                    name,
                    salary,
                    specialisation,
                    type
                )
            `)
            .eq('dental_team_id', id)
            .eq('user_id', userId)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (attendanceError) throw attendanceError;

        // Format attendance data for Excel
        const formattedAttendances = attendances.map(a => ({
            name: a.dental_team?.name || 'N/A',  // Ensure name is included
            type: a.dental_team?.type || 'staff',
            specialisation: a.dental_team?.specialisation || 'N/A',
            date: moment(a.date).format('DD MMM YYYY'),
            status: a.attendance_status,
            leave_balance: a.leave_balances,
            is_lop: a.is_lop ? 'Yes' : 'No',
            daily_pay: calculatePayableAmount(a),
            monthly_salary: a.dental_team?.salary || 0
        }));

        // Calculate summary
        const summary = {
            employee_name: attendances[0]?.dental_team?.name || 'N/A',
            employee_type: attendances[0]?.dental_team?.type || 'staff',
            specialisation: attendances[0]?.dental_team?.specialisation || 'N/A',
            present_days: attendances.filter(a => a.attendance_status === 'present').length,
            absent_days: attendances.filter(a => a.attendance_status === 'absent').length,
            half_days: attendances.filter(a => a.attendance_status === 'half-day').length,
            lop_days: attendances.filter(a => a.is_lop).length,
            holiday_days: attendances.filter(a => a.attendance_status === 'holiday').length,
            working_days: attendances.length,
            monthly_salary: attendances[0]?.dental_team?.salary || 0,
            total_payable: attendances.reduce((total, a) => total + calculatePayableAmount(a), 0)
        };

        return {
            success: true,
            data: {
                attendances: formattedAttendances,
                summary
            }
        };
    } catch (error) {
        console.error('Error generating staff report:', error);
        return { error: error.message };
    }
};

module.exports = {
    getAttendances,
    updateAttendanceStatus,
    getMonthlyAttendanceSummary,
    getConsultantAttendances,
    updateConsultantAttendanceStatus,
    getStaffDetails,
    generateStaffReport
}; 