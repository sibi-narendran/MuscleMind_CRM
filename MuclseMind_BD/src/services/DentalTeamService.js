const { createTeamMember, getTeamMembers, updateTeamMember, deleteTeamMember } = require('../models/DentalTeamModel');

const addTeamMember = async (memberData) => {
  try {
    return await createTeamMember(memberData);
  } catch (error) {
    console.error("Service error adding team member:", error);
    throw error;
  }
};

const getAllTeamMembers = async (userId) => {
  return await getTeamMembers(userId);
};

const editTeamMember = async (id, memberData) => {
  return await updateTeamMember(id, memberData);
};

const deleteTeamMemberService = async (id) => {
  return await deleteTeamMember(id);
};

module.exports = { addTeamMember, getAllTeamMembers, editTeamMember, deleteTeamMember: deleteTeamMemberService };
