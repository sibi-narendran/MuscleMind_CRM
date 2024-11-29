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
  console.log('Received hoursData:', hoursData); // Debugging: Log the received data

  try {
    // Validate and format the incoming data
    const formattedHoursData = hoursData.map(({ day, status, open_time, close_time }) => {
      if (!status) {
        throw new Error(`Status is required for day: ${day}`);
      }
      return {
        user_id: userId,
        day,
        status,
        open_time: open_time || null,
        close_time: close_time || null
      };
    });

    console.log('Formatted hoursData:', formattedHoursData); // Debugging: Log the formatted data

    await editOperatingHours(userId, formattedHoursData);

    res.status(200).json(createResponse(true, 'Operating hours updated successfully'));
  } catch (error) {
    console.error('Error updating operating hours:', error.message); // Debugging: Log the error
    res.status(500).json(createResponse(false, 'Failed to update operating hours', null, error.message));
  }
};

module.exports = { getOperatingHoursController, updateOperatingHoursController }; 