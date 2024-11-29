   // src/models/TreatmentModel.js
   const { createClient } = require('@supabase/supabase-js');
   const dotenv = require('dotenv');
   dotenv.config();

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
   const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

   const supabase = createClient(supabaseUrl, supabaseKey);

   const createTreatment = async (treatmentData) => {
     const { data, error } = await supabase
       .from('treatments')
       .insert([treatmentData]);

     if (error) {
       console.error("Error creating treatment:", error);
       throw error;
     }
     return data;
   };

   const getTreatmentsByUserId = async (userId) => {
     const { data, error } = await supabase
       .from('treatments')
       .select('*')
       .eq('user_id', userId);

     if (error) {
       console.error("Error fetching treatments:", error);
       throw error;
     }

     return data;
   };

   const updateTreatment = async (id, treatmentData) => {
     const { data, error } = await supabase
       .from('treatments')
       .update(treatmentData)
       .eq('id', id);

     if (error) {
       console.error("Error updating treatment:", error);
       throw error;
     }

     return data;
   };

   const deleteTreatment = async (id) => {
     const { data, error } = await supabase
       .from('treatments')
       .delete()
       .eq('id', id);

     if (error) {
       console.error("Error deleting treatment:", error);
       throw error;
     }

     return data;
   };

   const getTreatmentById = async (id) => {
     const { data, error } = await supabase
       .from('treatments')
       .select('*')
       .eq('id', id);

     if (error) throw error;
     return data;
   };

   module.exports = { createTreatment, getTreatmentsByUserId, updateTreatment, deleteTreatment, getTreatmentById };