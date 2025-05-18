/**
 * Calculate the standard deviation of an array of numbers
 * @param {Array<number>} values - Array of numeric values
 * @returns {number} - Standard deviation
 */
const calculateStandardDeviation = (values) => {
  // Check if array is empty
  if (values.length === 0) {
    return 0;
  }
  
  // Calculate mean
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  
  // Calculate sum of squared differences from mean
  const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
  const sumOfSquaredDifferences = squaredDifferences.reduce((sum, value) => sum + value, 0);
  
  // Calculate variance (mean of squared differences)
  const variance = sumOfSquaredDifferences / values.length;
  
  // Standard deviation is square root of variance
  const stdDeviation = Math.sqrt(variance);
  
  // Round to 2 decimal places
  return parseFloat(stdDeviation.toFixed(2));
};

module.exports = { calculateStandardDeviation };