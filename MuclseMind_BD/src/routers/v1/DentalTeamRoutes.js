const express = require('express');
const { addTeamMemberController, getTeamMembersController, editTeamMemberController, deleteTeamMemberController } = require('../../controller/DentalTeamController');
const { authenticateJWT } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/addTeamMember', authenticateJWT, addTeamMemberController);
router.get('/getTeamMembers', authenticateJWT, getTeamMembersController);
router.put('/editTeamMember/:id', authenticateJWT, editTeamMemberController);
router.delete('/deleteTeamMember/:id', authenticateJWT, deleteTeamMemberController);

module.exports = router;
    