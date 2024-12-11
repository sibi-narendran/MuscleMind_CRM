const express = require('express');
const clinicRoutes = express.Router();
const { getClinicInfo, updateClinicInfo } = require('../../controller/ClinicController');
const {authenticateJWT} = require('../../middleware/authMiddleware');

clinicRoutes.put('/put-clinic/:id', authenticateJWT, updateClinicInfo);

clinicRoutes.get('/get-clinic',authenticateJWT, getClinicInfo);
module.exports = clinicRoutes;