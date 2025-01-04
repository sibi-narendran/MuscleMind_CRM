const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getAttendances = async (date, userId) => {
    try {
        const { data: staffData, error: staffError } = await supabase
            .from('staff_attendances')
            .select('*')
            .eq('user_id', userId)
            .eq('date', date)
            .eq('type', 'staff');

        if (staffError) throw staffError;

        const { data: consultantData, error: consultantError } = await supabase
            .from('consultant_attendances')
            .select('*')
            .eq('user_id', userId)
            .eq('date', date)
            .eq('type', 'consultant');

        if (consultantError) throw consultantError;

        return { 
            data: {
                staff: staffData || [],
                consultants: consultantData || []
            }
        };
    } catch (error) {
        console.error('Error in getAttendances:', error);
        return { error: error.message };
    }
};

module.exports = {
    getAttendances
};
