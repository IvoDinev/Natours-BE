const express = require('express');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');

// 3) Routes
// Separate routes by using Router middleware
const router = express.Router();

// Param middleware - gets executed for requests which contain
// the specified req param. The last param in the callback function
// contains the value of the URL param
// We shouldn't forget to call next() to not block the request
// router.param('id', checkID);

// Routes in the specified router receive the base URL and the Resource name
// from the Router middleware to which they belong
// Chaining multiple middlewares for the post request
// router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
