/**
 * Calculate standard deviation of an array of numbers
 * @param {number[]} values - Array of numeric values
 * @returns {number} - Standard deviation
 */
const calculateStandardDeviation = (values) => {
  if (!values || values.length === 0) {
    return 0;
  }
  
  // Calculate mean
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  
  // Calculate sum of squared differences from mean
  const squaredDifferencesSum = values.reduce((sum, value) => {
    const diff = value - mean;
    return sum + (diff * diff);
  }, 0);
  
  // Calculate variance and standard deviation
  const variance = squaredDifferencesSum / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Round to 2 decimal places
  return parseFloat(stdDev.toFixed(2));
};

module.exports = { calculateStandardDeviation };
