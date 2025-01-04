const { createClient } = require('@supabase/supabase-js');
const moment = require('moment');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const createDailyAttendances = async () => {
    try {
        const currentDate = moment().format('YYYY-MM-DD');
        const dayOfWeek = moment().format('dddd').toLowerCase();

        // Get all users without status filter
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id');

        if (userError) throw userError;

        // Check if attendance already created today
        const { data: existingLogs } = await supabase
            .from('cron_logs')
            .select('*')
            .eq('job_name', 'attendance_creation')
            .eq('status', 'success')
            .gte('execution_time', currentDate)
            .lt('execution_time', moment().add(1, 'day').format('YYYY-MM-DD'));

        if (existingLogs?.length > 0) {
            return { success: true, message: 'Attendance already created for today' };
        }

        // Process attendance for each user
        for (const user of users) {
            await processUserAttendance(user.id, currentDate, dayOfWeek);
        }

        // Log successful execution
        await supabase
            .from('cron_logs')
            .insert({
                job_name: 'attendance_creation',
                status: 'success',
                message: 'Daily attendances created successfully',
                execution_time: new Date().toISOString()
            });

        return { success: true, message: 'Daily attendances created successfully' };
    } catch (error) {
        // Log error
        await supabase
            .from('cron_logs')
            .insert({
                job_name: 'attendance_creation',
                status: 'error',
                message: 'Failed to create daily attendances',
                error: error.message,
                execution_time: new Date().toISOString()
            });

        console.error('Error in createDailyAttendances:', error);
        return { success: false, error: error.message };
    }
};

const processUserAttendance = async (userId, currentDate, dayOfWeek) => {
    try {
        // Check operating hours
        const { data: operatingHours } = await supabase
            .from('operating_hours')
            .select('*')
            .eq('day', dayOfWeek)
            .eq('user_id', userId)
            .single();

        if (!operatingHours || operatingHours.status === 'closed') {
            console.log(`Clinic ${userId} is closed on ${dayOfWeek}`);
            return;
        }

        // Check for holidays
        const { data: holidays } = await supabase
            .from('holidays')
            .select('*')
            .eq('date', currentDate)
            .eq('user_id', userId);

        if (holidays?.length > 0) {
            console.log(`Holiday for clinic ${userId} on ${currentDate}`);
            return;
        }

        // Create staff attendances
        await createStaffAttendances(userId, currentDate);
        
        // Create consultant attendances
        await createConsultantAttendances(userId, currentDate);

    } catch (error) {
        console.error(`Error processing attendance for user ${userId}:`, error);
        throw error;
    }
};

const createStaffAttendances = async (userId, currentDate) => {
    try {
        // Get all active staff without trying to join leave_balances
        const { data: staffMembers, error: staffError } = await supabase
            .from('dental_team')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'staff');

        if (staffError) throw staffError;
        
        // Guard against null staffMembers
        if (!staffMembers) {
            console.log('No staff members found for user:', userId);
            return;
        }

        // Check existing attendances
        const { data: existingAttendances, error: attendanceError } = await supabase
            .from('staff_attendances')
            .select('dental_team_id')
            .eq('date', currentDate)
            .eq('user_id', userId);

        if (attendanceError) throw attendanceError;

        const existingIds = existingAttendances?.map(a => a.dental_team_id) || [];

        // Create attendance records for staff without existing attendance
        const attendanceRecords = staffMembers
            .filter(staff => !existingIds.includes(staff.id))
            .map(staff => ({
                dental_team_id: staff.id,
                user_id: userId,
                date: currentDate,
                attendance_status: 'pending',
                name: staff.name,
                specialisation: staff.specialisation,
                type: 'staff',
                doj: staff.doj,
                leave_balances: staff.leave_balances, // Use the column from dental_team
                salary: staff.salary,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }));

        if (attendanceRecords.length > 0) {
            const { error: insertError } = await supabase
                .from('staff_attendances')
                .insert(attendanceRecords);

            if (insertError) throw insertError;
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error in createStaffAttendances:', error);
        throw error;
    }
};

const createConsultantAttendances = async (userId, currentDate) => {
    try {
        // Get all consultants
        const { data: consultants, error: consultantError } = await supabase
            .from('dental_team')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'consultant');

        if (consultantError) throw consultantError;

        if (!consultants) {
            console.log('No consultants found for user:', userId);
            return;
        }

        // Check existing attendances
        const { data: existingAttendances, error: attendanceError } = await supabase
            .from('consultant_attendances')
            .select('dental_team_id')
            .eq('date', currentDate)
            .eq('user_id', userId);

        if (attendanceError) throw attendanceError;

        const existingIds = existingAttendances?.map(a => a.dental_team_id) || [];

        // Create attendance records for consultants without existing attendance
        const attendanceRecords = consultants
            .filter(consultant => !existingIds.includes(consultant.id))
            .map(consultant => ({
                dental_team_id: consultant.id,
                user_id: userId,
                date: currentDate,
                attendance_status: 'pending',
                name: consultant.name,
                specialisation: consultant.specialisation,
                type: 'consultant',
                salary: consultant.salary,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }));

        if (attendanceRecords.length > 0) {
            const { error: insertError } = await supabase
                .from('consultant_attendances')
                .insert(attendanceRecords);

            if (insertError) throw insertError;
        }

        return { success: true };
    } catch (error) {
        console.error('Error in createConsultantAttendances:', error);
        throw error;
    }
};

module.exports = {
    createDailyAttendances
    
}; 