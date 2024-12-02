const { createStaffMember, getStaffMembers, updateStaffMember, deleteStaffMember } = require('../models/StaffModel');

const addStaffMember = async (memberData) => {
  try {
    return await createStaffMember(memberData);
  } catch (error) {
    console.error("Service error adding staff member:", error);
    throw error;
  }
};

const getAllStaffMembers = async (userId) => {
  return await getStaffMembers(userId);
};

const editStaffMember = async (id, memberData) => {
  return await updateStaffMember(id, memberData);
};

const deleteStaffMemberService = async (id) => {
  return await deleteStaffMember(id);
};

module.exports = { addStaffMember, getAllStaffMembers, editStaffMember, deleteStaffMember: deleteStaffMemberService };
