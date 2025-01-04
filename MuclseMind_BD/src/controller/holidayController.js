const { createHoliday, findAllHolidays, updateHoliday, deleteHoliday } = require('../models/holidayModel');
const { createResponse } = require('../utils/responseUtil');

exports.addHoliday = async (req, res) => {
    try {
        const { name, date } = req.body;
        const userId = req.user.id;
        const newHoliday = await createHoliday({ name, date, user_id: userId });
        res.status(201).json(createResponse(true, 'Holiday added successfully', newHoliday));
    } catch (error) {
        console.error(error);
        res.status(500).json(createResponse(false, 'Error adding holiday', error));
    }
};

exports.getHolidays = async (req, res) => {
    try {
        const userId = req.user.id;
        const holidays = await findAllHolidays(userId);
        res.status(200).json(createResponse(true, 'Holidays retrieved successfully', holidays));
    } catch (error) {
        console.error('Error retrieving holidays:', error);
        res.status(500).json(createResponse(false, 'Error retrieving holidays', error));
    }
};

exports.updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedHoliday = await updateHoliday(id, req.body);
        res.status(200).json(createResponse(true, 'Holiday updated successfully', updatedHoliday));
    } catch (error) {
        res.status(500).json(createResponse(false, 'Error updating holiday', error));
    }
};

exports.deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteHoliday(id);
        res.status(200).json(createResponse(true, 'Holiday deleted successfully'));
    } catch (error) {
        res.status(500).json(createResponse(false, 'Error deleting holiday', error));
    }
}; 