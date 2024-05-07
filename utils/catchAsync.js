// Wrapper function which simply catches an error thrown by rejecting
// the async function which performs the DB operation
// The wrapper function then calls next with the corresponding error and then
// the error handling middleware will run with the provided error
// Since the async DB operation needs to be called by express we return an
// anonymous function which can call the DB operation function
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
