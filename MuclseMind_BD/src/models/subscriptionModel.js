const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const createSubscription = async (subscriptionData) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: subscriptionData.userId,
        plan_id: subscriptionData.planId,
        status: 'active',
        start_date: new Date(),
        end_date: subscriptionData.isAnnual 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        payment_id: subscriptionData.paymentId,
        is_annual: subscriptionData.isAnnual
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

module.exports = {
  createSubscription
}; 