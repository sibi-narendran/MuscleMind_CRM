const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const moment = require('moment');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Initialize OpenAI with the new syntax
const openai = new OpenAI({
    
    apiKey: process.env.OPENAI_API_KEY
});

const getBillingDetails = async (billingId) => {
    try {
        const { data, error } = await supabase
            .from('billings')
            .select('*')
            .eq('id', billingId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching billing:', error);
        return null;
    }
};

const generateAIDescription = async (billing) => {
    const prompt = `
    Generate a concise medical billing description (4-5 words only) for:
    Patient: ${billing.patient_name}
    Treatment: ${billing.treatment_name}
    Cost: ${billing.cost}
    Date: ${billing.date}
    
    Requirements:
    1. Exactly 4-5 professional medical words
    2. Use standard medical terminology
    3. Be specific to the treatment
    4. Example format: "Dental Scaling Deep Cleaning" or "Complete Root Canal Treatment"
`;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a professional medical billing assistant."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 200,
            temperature: 0.5
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating AI description:', error);
        throw new Error('Failed to generate AI description');
    }
};

const generateInvoiceDescription = async (billingId, userId) => {
    try {
        // Get billing details and verify ownership
        const billing = await getBillingDetails(billingId);
        if (!billing) {
            throw new Error('Billing not found');
        }
        
        // Verify user ownership
        if (billing.user_id !== userId) {
            throw new Error('Unauthorized access to billing');
        }

        // Generate description using billing data
        const description = await generateAIDescription(billing);

        // Update billing with new description
        const { error } = await supabase
            .from('billings')
            .update({ description })
            .eq('id', billingId);

        if (error) throw error;

        return description;
    } catch (error) {
        console.error('Error in generateInvoiceDescription:', error);
        throw error;
    }
};

module.exports = {
    generateInvoiceDescription,
    getBillingDetails
};