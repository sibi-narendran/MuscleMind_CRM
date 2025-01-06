// MuclseMind_BD/src/services/OperatingHoursService.js
const { getOperatingHours, upsertOperatingHours } = require('../models/OperatingHoursModels.js');

const fetchOperatingHours = async (userId) => {
  return await getOperatingHours(userId);
};

const editOperatingHours = async (userId, hoursData) => {
  try {
    console.log('Received hours data:', hoursData); // Debug log

    // Validate the data
    if (!Array.isArray(hoursData)) {
      throw new Error('Hours data must be an array');
    }

    // Format time fields to ensure they have seconds
    const formattedHours = hoursData.map(hour => ({
      ...hour,
      shift_1_open_time: hour.shift_1_open_time ? 
        (hour.shift_1_open_time.includes(':00') ? hour.shift_1_open_time : `${hour.shift_1_open_time}:00`) : null,
      shift_1_close_time: hour.shift_1_close_time ? 
        (hour.shift_1_close_time.includes(':00') ? hour.shift_1_close_time : `${hour.shift_1_close_time}:00`) : null,
      shift_2_open_time: hour.shift_2_open_time ? 
        (hour.shift_2_open_time.includes(':00') ? hour.shift_2_open_time : `${hour.shift_2_open_time}:00`) : null,
      shift_2_close_time: hour.shift_2_close_time ? 
        (hour.shift_2_close_time.includes(':00') ? hour.shift_2_close_time : `${hour.shift_2_close_time}:00`) : null
    }));

    const result = await upsertOperatingHours(userId, formattedHours);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error in editOperatingHours:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { fetchOperatingHours, editOperatingHours };