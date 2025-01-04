const { addTeamMember, getAllTeamMembers, editTeamMember, deleteTeamMember } = require('../services/DentalTeamService');
const { createResponse } = require('../utils/responseUtil');

const addTeamMemberController = async (req, res) => {
  const { id: userId } = req.user;
  const memberData = { ...req.body, user_id: userId };
  try {
    const newMember = await addTeamMember(memberData);
    res.status(201).json(createResponse(true, 'Team member added successfully', newMember));
  } catch (error) {
    console.error("Controller error adding team member:", error);
    res.status(500).json(createResponse(false, 'Failed to add team member', null, error.message || JSON.stringify(error)));
  }
};

const getTeamMembersController = async (req, res) => {
  const { id: userId } = req.user;
  try {
    const members = await getAllTeamMembers(userId);
    res.status(200).json(createResponse(true, 'Team members retrieved successfully', members));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to retrieve team members', null, error.message));
  }
};

const editTeamMemberController = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedMember = await editTeamMember(id, req.body);
    res.status(200).json(createResponse(true, 'Team member updated successfully', updatedMember));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to update team member', null, error.message));
  }
};

const deleteTeamMemberController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteTeamMember(id);
    res.status(200).json(createResponse(true, 'Team member deleted successfully'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to delete team member', null, error.message));
  }
};

module.exports = { addTeamMemberController, getTeamMembersController, editTeamMemberController, deleteTeamMemberController };
