const express = require('express');
const clinicRoutes = express.Router();
const { getClinicInfo, updateClinicInfo } = require('../../controller/ClinicController');
const {authenticateJWT} = require('../../middleware/authMiddleware');


clinicRoutes.get('/get-clinic',authenticateJWT, getClinicInfo);

clinicRoutes.put('/put-clinic',authenticateJWT, updateClinicInfo);

module.exports = clinicRoutes;