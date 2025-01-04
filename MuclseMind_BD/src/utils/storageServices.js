const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const uploadFiles = async (files) => {
  const uploadedFiles = [];
  
  try {
    if (files && files.length > 0) {
      for (const file of files) {
        // Create unique filename with timestamp
        const fileName = `Additional_documents/${Date.now()}_${file.originalname}`;
        
        // Upload file to Supabase storage with correct bucket name
        const { data, error } = await supabase.storage
          .from('dental_crm')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('File upload error:', error);
          throw error;
        }

        // Get public URL for the uploaded file from correct bucket
        const { data: { publicUrl } } = supabase.storage
          .from('dental_crm')
          .getPublicUrl(fileName);

        // Add file info to uploaded files array
        uploadedFiles.push({
          name: file.originalname,
          url: publicUrl,
          type: file.mimetype,
          size: file.size,
          path: fileName
        });
      }
    }
    
    return uploadedFiles;
  } catch (error) {
    console.error('Storage service error:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from('dental_crm')
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('File deletion error:', error);
    throw new Error(`File deletion failed: ${error.message}`);
  }
};

module.exports = {
  uploadFiles,
  deleteFile
};
