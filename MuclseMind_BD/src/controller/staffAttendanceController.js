const model = require('../models/staffAttendanceModel');
const { createResponse } = require('../utils/responseUtil');
const StaffAttendancesServices = require('../services/StaffAttendancesServices');

const fetchAttendances = async (req, res) => {
    const { date } = req.params;
    const userId = req.user.userId;
    const result = await model.getAttendances(date, userId);
    if (result.error) {
        res.status(500).json(createResponse(false, 'Failed to fetch attendances', null, result.error));
    } else {
        res.status(200).json(createResponse(true, 'Attendances fetched successfully', result.data));
    }
};

const editAttendanceStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    const result = await model.updateAttendanceStatus(id, status, userId);
    if (result.error) {
        res.status(500).send(result.error);
    } else {
        res.status(200).send(result.data);
    }
};

module.exports = { fetchAttendances, editAttendanceStatus };
