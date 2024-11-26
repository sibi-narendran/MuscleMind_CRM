const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const createUser = async (userData) => {
  const { username, email, phoneNumber, password } = userData;

  const { data, error } = await supabase
    .from('users')
    .insert([{ username, email, phoneNumber, password }]);

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

module.exports = { createUser, getUserByEmail };

