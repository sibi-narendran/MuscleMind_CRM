const express = require('express');
const clinicRoutes = express.Router();
const { getClinicInfo, updateClinicInfo, uploadClinicImages } = require('../../controller/ClinicController');
const {authenticateJWT} = require('../../middleware/authMiddleware');
const { handleClinicImageUpload } = require('../../middleware/cloudStorageMiddleware');
const fileUpload = require('express-fileupload');

// Add fileUpload middleware
clinicRoutes.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

clinicRoutes.put('/put-clinic/:id', authenticateJWT, updateClinicInfo);
clinicRoutes.put('/put-image-clinic', authenticateJWT, handleClinicImageUpload, uploadClinicImages);
clinicRoutes.get('/get-clinic', authenticateJWT, getClinicInfo);

module.exports = clinicRoutes;