const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const createUser = async (userData) => {
  const { username, email, phoneNumber, password,clinicName } = userData;

  const { data, error } = await supabase
    .from('users')
    .insert([{ username, email, phoneNumber, password,clinicName }]);

  if (error) {
    console.error("Error creating user:", error);
    throw error;
  }

  return data;
};

const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  return data;
};

const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id);

  if (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
  return data[0]; // Assuming you want a single user object
};

module.exports = { createUser, getUserByEmail, getUserById };

