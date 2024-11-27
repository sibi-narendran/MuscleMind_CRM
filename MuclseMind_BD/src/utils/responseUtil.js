const createResponse = (success, message, data = null, error = null, status = null) => {
  return {
    success,
    message,
    data,
    error,
    status,
  };
};

module.exports = { createResponse }; 