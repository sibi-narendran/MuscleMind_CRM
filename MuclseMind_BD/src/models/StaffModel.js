const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const createStaffMember = async (memberData) => {
  const { data, error } = await supabase
    .from('staff')
    .insert([memberData]);

  if (error) {
    console.error("Error creating staff member:", error);
    throw new Error(`Supabase error: ${error.message || JSON.stringify(error)}`);
  }
  return data;
};

const getStaffMembers = async (userId) => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error("Error fetching staff members:", error);
    throw error;
  }

  return data;
};

const updateStaffMember = async (id, memberData) => {
  const { data, error } = await supabase
    .from('staff')
    .update(memberData)
    .eq('id', id);

  if (error) {
    console.error("Error updating staff member:", error);
    throw error;
  }

  return data;
};

const deleteStaffMember = async (id) => {
  const { data, error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting staff member:", error);
    throw error;
  }

  return data;
};

module.exports = { createStaffMember, getStaffMembers, updateStaffMember, deleteStaffMember };
