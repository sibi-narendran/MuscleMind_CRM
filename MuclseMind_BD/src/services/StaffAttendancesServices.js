const staffAttendanceModel = require('../models/staffAttendanceModel');
const consultantAttendanceModel = require('../models/consultantAttendanceModel');
const moment = require('moment');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MONTHLY_LEAVE_CREDIT = 2; // Fixed 2 days leave per month

const getAttendances = async (date, userId) => {
    return await staffAttendanceModel.getAttendances(date, userId);
};

const updateAttendanceStatus = async (id, status, date, userId) => {
    try {
        // Check if the date is current date
        const currentDate = moment().format('YYYY-MM-DD');
        if (date !== currentDate) {
            return {
                success: false,
                error: 'Cannot modify attendance for past or future dates',
                message: 'You can only modify attendance for the current date'
            };
        }

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

module.exports = {
    getAttendances,
    updateAttendanceStatus,
    getMonthlyAttendanceSummary,
    getConsultantAttendances,
    updateConsultantAttendanceStatus
}; 