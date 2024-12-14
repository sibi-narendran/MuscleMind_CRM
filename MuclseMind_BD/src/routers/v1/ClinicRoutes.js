const express = require('express');
const clinicRoutes = express.Router();
const { getClinicInfo, updateClinicInfo, uploadClinicImages } = require('../../controller/ClinicController');
const {authenticateJWT} = require('../../middleware/authMiddleware');
const { handleClinicImageUpload } = require('../../middleware/cloudStorageMiddleware');
const fileUpload = require('express-fileupload');
const path = require('path');

// Configure fileUpload middleware with simpler settings
clinicRoutes.use(fileUpload({
  // useTempFiles: false,  // Changed to false to store in memory
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  // abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: true,
  debug: true 
}));
  
clinicRoutes.put('/put-clinic/:id', authenticateJWT, updateClinicInfo);
clinicRoutes.put('/put-image-clinic', 
  authenticateJWT,
  (req, res, next) => {
    console.log('Request received:', {
      files: req.files ? Object.keys(req.files) : 'No files',
      body: req.body
    });
    next();
  },
  handleClinicImageUpload
);
clinicRoutes.get('/get-clinic', authenticateJWT, getClinicInfo);

module.exports = clinicRoutes;