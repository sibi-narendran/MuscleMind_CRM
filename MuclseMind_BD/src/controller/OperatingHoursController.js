const { fetchOperatingHours, editOperatingHours } = require('../services/OperatingHoursService.js');
const { createResponse } = require('../utils/responseUtil.js');

const getOperatingHoursController = async (req, res) => {
  const { userId } = req.user;
  try {
    const data = await fetchOperatingHours(userId);
    res.status(200).json(createResponse(true, 'Operating hours retrieved successfully', data));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to retrieve operating hours', null, error.message));
  }
};

const updateOperatingHoursController = async (req, res) => {
  const { userId } = req.user;
  const hoursData = req.body;

  try {
    // Convert the array data to the correct format
    const formattedHoursData = hoursData.map(day => ({
      user_id: userId,
      day: day.day,
      status: day.status,
      shift_1_open_time: day.shift_1_open_time,
      shift_1_close_time: day.shift_1_close_time,
      shift_2_open_time: day.shift_2_open_time,
      shift_2_close_time: day.shift_2_close_time
    }));

    console.log('Formatted hours data:', formattedHoursData); // Debug log

    const result = await editOperatingHours(userId, formattedHoursData);
    
    if (!result.success) {
      return res.status(400).json(createResponse(false, 'Failed to update operating hours', null, result.error));
    }

    res.status(200).json(createResponse(true, 'Operating hours updated successfully', result.data));
  } catch (error) {
    console.error('Error in updateOperatingHoursController:', error);
    res.status(500).json(createResponse(false, 'Failed to update operating hours', null, error.message));
  }
};

module.exports = { getOperatingHoursController, updateOperatingHoursController }; 