const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../../middleware/authMiddleware');
const { upload, handleUploadError } = require('../../middleware/uploadMiddleware');
const {
  addPatientController,
  getPatientsController,
  editPatientController,
  deletePatientController
} = require('../../controller/PatientController');

router.post('/addPatients', 
  authenticateJWT, 
  upload.array('documents'), 
  handleUploadError,
  addPatientController
);

router.get('/getPatients', 
  authenticateJWT, 
  getPatientsController
);

router.put('/updatePatients/:id', 
  authenticateJWT, 
  upload.array('documents'),
  handleUploadError, 
  editPatientController
);

router.delete('/deletePatients/:id', 
  authenticateJWT, 
  deletePatientController
);

module.exports = router;