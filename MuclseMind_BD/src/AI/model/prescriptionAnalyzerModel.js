const { createClient } = require('@supabase/supabase-js');
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

const getAppointmentDetails = async (appointmentId) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  if (error) throw error;
  return data;
};

const getAllMedications = async () => {
  const { data, error } = await supabase
    .from('medications')
    .select('*');

  if (error) throw error;
  return data;
};

const createPrescription = async (prescriptionData) => {
  const { data, error } = await supabase
    .from('prescriptions')
    .insert([prescriptionData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const analyzeMedicationsWithAI = async (treatmentName, patientData, medications) => {
  const prompt = `
    Analyze and suggest medications for a dental treatment based on the following information:

    Patient Information:
    - Name: ${patientData.patient_name}
    - Age: ${patientData.age}
    - Gender: ${patientData.gender}
    
    Treatment: ${treatmentName}

    Available Medications in Database:
    ${formatAvailableMeds(medications)}
  `;

  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a dental prescription expert. Return ONLY a valid JSON array of medications without any additional text."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  });

  return JSON.parse(response.data.choices[0].message.content.trim());
};

const formatAvailableMeds = (medications) => {
  if (!medications?.length) return "No medications available in database";
  return medications
    .map(med => `- ${med.name} (${med.dosage || 'N/A'})`)
    .join('\n');
};

module.exports = {
  getAppointmentDetails,
  getAllMedications,
  createPrescription,
  analyzeMedicationsWithAI
};
