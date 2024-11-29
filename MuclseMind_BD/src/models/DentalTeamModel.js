const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const createTeamMember = async (memberData) => {
  const { data, error } = await supabase
    .from('dental_team')
    .insert([memberData]);

  if (error) {
    console.error("Error creating team member:", error);
    throw new Error(`Supabase error: ${error.message || JSON.stringify(error)}`);
  }
  return data;
};

const getTeamMembers = async (userId) => {
  const { data, error } = await supabase
    .from('dental_team')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }

  return data;
};

const updateTeamMember = async (id, memberData) => {
  const { data, error } = await supabase
    .from('dental_team')
    .update(memberData)
    .eq('id', id);

  if (error) {
    console.error("Error updating team member:", error);
    throw error;
  }

  return data;
};

const deleteTeamMember = async (id) => {
  const { data, error } = await supabase
    .from('dental_team')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting team member:", error);
    throw error;
  }

  return data;
};

module.exports = { createTeamMember, getTeamMembers, updateTeamMember, deleteTeamMember };
