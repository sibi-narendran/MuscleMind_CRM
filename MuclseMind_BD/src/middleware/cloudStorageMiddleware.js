const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Helper function to extract file path from URL
const getFilePathFromUrl = (url) => {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split('/public/')[1];
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

// Helper function to delete existing image
const deleteExistingImage = async (imageUrl) => {
  if (!imageUrl) return;
  
  const filePath = getFilePathFromUrl(imageUrl);
  if (filePath) {
    const { error } = await supabase.storage
      .from('dental_crm')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting existing image:', error);
    }
  }
};

const handleClinicImageUpload = async (req, res) => {
  try {
    if (!req.files || (!req.files.headerImage && !req.files.footerImage)) {
      return res.status(400).json({
        success: false,
        message: 'No image files uploaded'
      });
    }

    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found'
      });
    }

    // Get current user data
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('header_image_url, footer_image_url')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`Database error: ${userError.message}`);
    }

    const uploadImage = async (file, type, existingUrl) => {
      // First delete existing image if it exists
      await deleteExistingImage(existingUrl);

      // Then upload new image
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `dental_CRM_cloud/${fileName}`;

      const { data, error } = await supabase.storage
        .from('dental_crm')
        .upload(filePath, file.data, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('dental_crm')
        .getPublicUrl(filePath);

      return publicUrl;
    };

    const updateData = {};

    // Handle header image
    if (req.files.headerImage) {
      updateData.header_image_url = await uploadImage(
        req.files.headerImage, 
        'headerImage',
        existingUser?.header_image_url
      );
    }

    // Handle footer image
    if (req.files.footerImage) {
      updateData.footer_image_url = await uploadImage(
        req.files.footerImage, 
        'footerImage',
        existingUser?.footer_image_url
      );
    }

    // Update user record with new image URLs
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        ...updateData,
      })
      .eq('id', userId)
      .select('header_image_url, footer_image_url')
      .single();

    if (updateError) {
      throw new Error(`Failed to update user record: ${updateError.message}`);
    }

    res.status(200).json({
      success: true,
      message: 'Images updated successfully',
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
      error: error.message
    });
  }
};

module.exports = { 
  handleClinicImageUpload
}; 