const { createClient } = require("@supabase/supabase-js");
const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getAllMedications = async (userId) => {
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
};

const updatePrescriptionMedicines = async (prescriptionId, medicines) => {
  const { data, error } = await supabase
    .from("prescriptions")
    .update({ medicines })
    .eq("id", prescriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const analyzeMedicationsWithAI = async (
  treatmentName,
  patientData,
  medications,
  userId
) => {
  const prompt = `
    Analyze and suggest medications for a dental treatment based on the following information:

    Patient Information:
    - Name: ${patientData.patient_name}
    - Age: ${patientData.age}
    - Gender: ${patientData.gender}
    
    Treatment: ${treatmentName}


    

    Available Medications in Database:
    ${formatAvailableMeds(medications)}
                Return ONLY a JSON array with this exact structure:
            [
                {{
                    "name": "MEDICATION_NAME",
                    "night": true,
                    "dosage": "DOSAGE",
                    "morning": true,
                    "duration": "DURATION",
                    "afternoon": false,
                    "instructions": "INSTRUCTIONS"
                }}
            ]

            Ensure all boolean values are lowercase (true/false) and the JSON is properly formatted.
            Consider treatment requirements, patient age, and standard dental protocols.
            """
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are a dental prescription expert. Return ONLY a valid JSON array of medications without any additional text.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content.trim());
};

const formatAvailableMeds = (medications) => {
  if (!medications?.length) return "No medications available in database";
  return medications
    .map((med) => `- ${med.name} (${med.dosage || "N/A"})`)
    .join("\n");
};

module.exports = {
  getAllMedications,
  updatePrescriptionMedicines,
  analyzeMedicationsWithAI,
};
