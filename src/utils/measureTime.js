/**
 * High resolution timer utility for measuring execution duration.
 * @returns {function(): number} Function returning elapsed time in milliseconds.
 */
function startTimer() {
  const start = process.hrtime();
  return function stopTimer() {
    const diff = process.hrtime(start);
    // Convert to milliseconds
    return Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
  };
}

module.exports = { startTimer };
