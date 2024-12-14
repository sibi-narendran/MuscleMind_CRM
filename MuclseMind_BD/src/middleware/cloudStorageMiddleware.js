const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const handleClinicImageUpload = async (req, res, next) => {
  try {
    console.log('Files received:', req.files);
    console.log('Headers:', req.headers);
    
    if (!req.files || (!req.files.headerImage && !req.files.footerImage)) {
      console.log('No files found in request');
      return res.status(400).json({
        success: false,
        message: 'No image files uploaded'
      });
    }

    if (req.files.headerImage) {
      console.log('Header image details:', {
        name: req.files.headerImage.name,
        size: req.files.headerImage.size,
        mimetype: req.files.headerImage.mimetype
      });
    }

    if (req.files.footerImage) {
      console.log('Footer image details:', {
        name: req.files.footerImage.name,
        size: req.files.footerImage.size,
        mimetype: req.files.footerImage.mimetype
      });
    }

    const userId = req.user?.id || req.user?.userId;
    console.log('Current userId:', userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in request'
      });
    }

    // First verify user exists
    console.log('Checking if user exists...');
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, header_image_url, footer_image_url')
      .eq('id', userId)
      .maybeSingle();

    console.log('Existing user check result:', { existingUser, userError });

    if (userError) {
      console.error('Error finding user:', userError);
      throw new Error(`Database error: ${userError.message}`);
    }

    // If user doesn't exist, create new user
    if (!existingUser) {
      console.log('Creating new user...');
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          header_image_url: null,
          footer_image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id, header_image_url, footer_image_url')
        .single();

      console.log('User creation result:', { newUser, createError });

      if (createError) {
        console.error('User creation error:', createError);
        throw new Error(`Failed to create user: ${createError.message}`);
      }
      existingUser = newUser;
    }

    const uploadImage = async (file, type) => {
      // Log file details
      console.log('File details:', {
        name: file.name,
        size: file.size,
        mimetype: file.mimetype
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `dental_CRM_cloud/${fileName}`;

      // Convert file buffer to Uint8Array if needed
      let fileBuffer;
      if (file.data instanceof Buffer) {
        fileBuffer = file.data;
      } else if (file.tempFilePath) {
        // If using temp files
        const fs = require('fs');
        fileBuffer = fs.readFileSync(file.tempFilePath);
      } else {
        throw new Error('Invalid file data');
      }

      // Upload file
      const { data, error } = await supabase.storage
        .from('dental_crm')
        .upload(filePath, fileBuffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('dental_crm')
        .getPublicUrl(filePath);

      console.log('Upload successful:', {
        fileName,
        publicUrl,
        size: fileBuffer.length
      });

      return publicUrl;
    };

    const updateData = {};

    if (req.files.headerImage) {
      console.log('Processing header image...');
      updateData.header_image_url = await uploadImage(req.files.headerImage, 'headerImage');
    }

    if (req.files.footerImage) {
      console.log('Processing footer image...');
      updateData.footer_image_url = await uploadImage(req.files.footerImage, 'footerImage');
    }

    console.log('Updating user with data:', updateData);

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, header_image_url, footer_image_url')
      .single();

    console.log('Update result:', { updatedUser, updateError });

    if (updateError) {
      throw new Error(`Failed to update user record: ${updateError.message}`);
    }

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        header_image_url: updatedUser.header_image_url,
        footer_image_url: updatedUser.footer_image_url
      }
    });

  } catch (error) {
    console.error('Error in handleClinicImageUpload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message,
      details: error.stack
    });
  }
};

module.exports = { 
  handleClinicImageUpload 
}; 