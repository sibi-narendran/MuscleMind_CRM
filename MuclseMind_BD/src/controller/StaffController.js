const { addStaffMember, getAllStaffMembers, editStaffMember, deleteStaffMember } = require('../services/StaffService');
const { createResponse } = require('../utils/responseUtil');

const addStaffMemberController = async (req, res) => {
  const { id: userId } = req.user;
  const memberData = { ...req.body, user_id: userId };
  try {
    const newMember = await addStaffMember(memberData);
    res.status(201).json(createResponse(true, 'Staff member added successfully', newMember));
  } catch (error) {
    console.error("Controller error adding staff member:", error);
    res.status(500).json(createResponse(false, 'Failed to add staff member', null, error.message || JSON.stringify(error)));
  }
};

const getStaffMembersController = async (req, res) => {
  const { id: userId } = req.user;
  try {
    const members = await getAllStaffMembers(userId);
    res.status(200).json(createResponse(true, 'Staff members retrieved successfully', members));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to retrieve staff members', null, error.message));
  }
};

const editStaffMemberController = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedMember = await editStaffMember(id, req.body);
    res.status(200).json(createResponse(true, 'Staff member updated successfully', updatedMember));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to update staff member', null, error.message));
  }
};

const deleteStaffMemberController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteStaffMember(id);
    res.status(200).json(createResponse(true, 'Staff member deleted successfully'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to delete staff member', null, error.message));
  }
};

module.exports = { addStaffMemberController, getStaffMembersController, editStaffMemberController, deleteStaffMemberController };
