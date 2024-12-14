const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const handleClinicImageUpload = async (req, res, next) => {
  try {
    if (!req.files || (!req.files.headerImage && !req.files.footerImage)) {
      return res.status(400).json({
        success: false,
        message: 'No image files uploaded'
      });
    }

    const uploadImage = async (file, type) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `clinic/${fileName}`;

      // Delete old image if exists
      try {
        const { data: oldImages } = await supabase.storage
          .from('dental_CRM_cloud')
          .list('clinic', {
            prefix: type
          });   

        if (oldImages?.length > 0) {
          await supabase.storage
            .from('dental_CRM_cloud')
            .remove(oldImages.map(img => `clinic/${img.name}`));
        }
      } catch (error) {
        console.error('Error deleting old image:', error);
      }

      // Upload new image
      const { data, error } = await supabase.storage
        .from('dental_CRM_cloud')
        .upload(filePath, file.data, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('dental_CRM_cloud')
        .getPublicUrl(filePath);

      return publicUrl;
    };

    // Handle header image
    if (req.files.headerImage) {
      const headerUrl = await uploadImage(req.files.headerImage, 'headerImage');
      req.body.header_image_url = headerUrl;
    }

    // Handle footer image
    if (req.files.footerImage) {
      const footerUrl = await uploadImage(req.files.footerImage, 'footerImage');
      req.body.footer_image_url = footerUrl;
    }

    next();
  } catch (error) {
    console.error('Error in handleClinicImageUpload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

// Helper function to delete images
const deleteClinicImage = async (imageType) => {
  try {
    const { data: images } = await supabase.storage
      .from('dental_CRM_cloud')
      .list('clinic', {
        prefix: imageType
      });

    if (images?.length > 0) {
      await supabase.storage
        .from('dental_CRM_cloud')
        .remove(images.map(img => `clinic/${img.name}`));
    }

    return { success: true };
  } catch (error) {
    console.error(`Error deleting ${imageType}:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = { 
  handleClinicImageUpload,
  deleteClinicImage
}; 