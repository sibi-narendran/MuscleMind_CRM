const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const checkDuplicateInvoice = async (invoice_no, user_id) => {
  try {
    const { data, error } = await supabase
      .from('billings')
      .select('invoice_no')
      .eq('invoice_no', invoice_no)
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      throw error;
    }

    return { exists: !!data, error: null };
  } catch (error) {
    console.error('Error checking duplicate invoice:', error);
    return { exists: false, error: error.message };
  }
};

const createBilling = async (billingData) => {
  try {
    // Check for duplicate invoice
    const { exists, error: checkError } = await checkDuplicateInvoice(
      billingData.invoice_no,
      billingData.user_id
    );

    if (checkError) throw new Error(checkError);
    if (exists) {
      throw new Error('Invoice number already exists');
    }

    const { data, error } = await supabase
      .from('billings')
      .insert([{
        ...billingData,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in createBilling:', error);
    return { data: null, error: error.message };
  }
};

const getBillingsByUserId = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('billings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in getBillingsByUserId:', error);
    return { data: null, error: error.message };
  }
};

const updateBilling = async (id, billingData, userId) => {
  try {
    const { data, error } = await supabase
      .from('billings')
      .update(billingData)
      .match({ id: id, user_id: userId })
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in updateBilling:', error);
    return { data: null, error: error.message };
  }
};

const deleteBilling = async (id, userId) => {
  try {
    const { data, error } = await supabase
      .from('billings')
      .delete()
      .match({ id: id, user_id: userId });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in deleteBilling:', error);
    return { data: null, error: error.message };
  }
};

module.exports = {
  createBilling,
  getBillingsByUserId,
  updateBilling,
  deleteBilling
}; 