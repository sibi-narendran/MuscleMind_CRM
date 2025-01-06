const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getConsultantAttendances = async (date, userId) => {
    try {
        const { data, error } = await supabase
            .from('consultant_attendances')
            .select(`
                *,
                dental_team:dental_team_id (
                    name,
                    salary,
                    specialisation,
                    type
                )
            `)
            .eq('user_id', userId)
            .eq('date', date);

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};

const updateConsultantAttendanceStatus = async (id, status, userId) => {
    try {
        const { data, error } = await supabase
            .from('consultant_attendances')
            .update({ 
                attendance_status: status,
                updated_at: new Date().toISOString()
            })
            .match({ id, user_id: userId })
            .select();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};

const generateConsultantReport = async (id, startDate, endDate, userId) => {
    try {
        const { data, error } = await supabase
            .from('consultant_attendances')
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

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};

const getConsultantDetails = async (id, date, userId) => {
    try {
        const { data, error } = await supabase
            .from('consultant_attendances')
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
            .eq('date', date)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};

const getMonthlyStatistics = async (id, startDate, endDate, userId) => {
    try {
        const { data, error } = await supabase
            .from('consultant_attendances')
            .select('*')
            .eq('dental_team_id', id)
            .eq('user_id', userId)
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) throw error;

        const presentDays = data.filter(a => a.attendance_status === 'present').length;
        const absentDays = data.filter(a => a.attendance_status === 'absent').length;
        const totalDays = data.length;

        return {
            present_days: presentDays,
            absent_days: absentDays,
            total_days: totalDays
        };
    } catch (error) {
        return { error: error.message };
    }
};

module.exports = {
    getConsultantAttendances,
    updateConsultantAttendanceStatus,
    generateConsultantReport,
    getConsultantDetails,
    getMonthlyStatistics
}; 