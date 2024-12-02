const express = require('express');
const { addStaffMemberController, getStaffMembersController, editStaffMemberController, deleteStaffMemberController } = require('../../controller/StaffController');
const { authenticateJWT } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/addStaffMember', authenticateJWT, addStaffMemberController);
router.get('/getStaffMembers', authenticateJWT, getStaffMembersController);
router.put('/editStaffMember/:id', authenticateJWT, editStaffMemberController);
router.delete('/deleteStaffMember/:id', authenticateJWT, deleteStaffMemberController);

module.exports = router;
