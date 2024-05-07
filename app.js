const express = require('express');
const morgan = require('morgan');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const { API_BASE_URL, ENDPOINTS } = require('./constants');

const app = express();

// 1) Middlewares - this file is used to declare the middlewares that will be used
// Middleware - a function which can modify incoming request
// It stands in the middle of a request and response
// It adds request body to the request
// Custom middleware for loging of requests
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
// Middleware for serving static files
// The public is set as the root folder for the URL by default
// Opening localhost:3000/overview.html will open the specified file from the public folder
app.use(express.static(`${__dirname}/public`));

// Creating own middleware, it gets applied to any request
// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   // Never forget to call next otherwise the middleware stack would get stuck
//   next();
// });

// Modify a request with middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// This is called "mounting" the Router - mounting a Router on a Route
// The router middleware gets called when a request hits the specified URL
app.use(`${API_BASE_URL}/${ENDPOINTS.TOURS}`, tourRouter);
app.use(`${API_BASE_URL}/${ENDPOINTS.USERS}`, userRouter);

// Middleware which runs for all HTTP methods
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;

// Everything is middleware
// Middleware Stack - order as defined in the code
// The req, res obj go through each middleware that is defined
// Request-Response Cycle
