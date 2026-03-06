/**
 * Wrapper function to catch async errors and pass them to error handling middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
const wrapAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = wrapAsync;
