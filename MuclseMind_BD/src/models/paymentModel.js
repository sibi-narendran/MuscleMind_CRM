const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const createPaymentRecord = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in createPaymentRecord:', error);
    return { data: null, error: error.message };
  }
};

const updatePaymentStatus = async (orderId, paymentDetails) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id: paymentDetails.razorpay_payment_id,
        razorpay_order_id: paymentDetails.razorpay_order_id,
        razorpay_signature: paymentDetails.razorpay_signature,
        status: 'completed'
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error);
    return { data: null, error: error.message };
  }
};

module.exports = {
  createPaymentRecord,
  updatePaymentStatus
};