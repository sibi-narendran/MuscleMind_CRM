const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const updateConsultantAttendanceStatus = async (id, payload, userId) => {
    try {
        const status = payload.status?.status || payload.status;
        const date = payload.status?.date || payload.date;
        const salary = payload.salary;

        console.log('Updating consultant attendance with:', { id, status, date, salary, userId });

        if (!status || !date) {
            throw new Error('Status and date are required');
        }

        // Prepare update data
        const updateData = {
            attendance_status: status,
            updated_at: new Date().toISOString()
        };

        // Add salary to update if provided
        if (salary !== undefined && salary !== null) {
            updateData.salary = salary;
        }

        console.log('Update Data:', updateData);

        // Update the record
        const { data, error } = await supabase
            .from('consultant_attendances')
            .update(updateData)
            .eq('id', id)
            .eq('date', date)
            .select()
            .single();

        if (error) {
            console.error('Update Error:', error);
            throw error;
        }

        return { 
            success: true,
            data,
            message: 'Consultant attendance updated successfully'
        };
    } catch (error) {
        console.error('Error in updateConsultantAttendanceStatus:', error);
        return { 
            success: false,
            error: error.message,
            message: `Failed to update consultant attendance: ${error.message}`
        };
    }
};

const getConsultantAttendances = async (date, userId) => {
    try {
        const { data, error } = await supabase
            .from('consultant_attendances')
            .select('*')
            .eq('user_id', userId)
            .eq('date', date)
            .eq('type', 'consultant');

        if (error) throw error;

        return { 
            data: data || []
        };
    } catch (error) {
        console.error('Error in getConsultantAttendances:', error);
        return { error: error.message };
    }
};

module.exports = {
    updateConsultantAttendanceStatus,
    getConsultantAttendances
}; 