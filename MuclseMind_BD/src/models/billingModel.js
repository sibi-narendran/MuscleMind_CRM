const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getBillings = async (userId) => {
  const { data, error } = await supabase
    .from('billing')
    .select('*')
    .eq('user_id', userId);

  return { data, error };
};

const createBilling = async (billingData) => {
  const { data, error } = await supabase
    .from('billing')
    .insert([billingData]);

  return { data, error };
};

const updateBilling = async (billingId, billingData, userId) => {
  const { data, error } = await supabase
    .from('billing')
    .update(billingData)
    .match({ billing_id: billingId, user_id: userId });

  return { data, error };
};

const deleteBilling = async (billingId, userId) => {
  const { data, error } = await supabase
    .from('billing')
    .delete()
    .match({ billing_id: billingId, user_id: userId });

  return { data, error };
};

module.exports = { getBillings, createBilling, updateBilling, deleteBilling }; 