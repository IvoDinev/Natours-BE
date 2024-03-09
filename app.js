// Filesystem API
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// 1) Middlewares

// Middleware - a function which can modify incoming request
// It stands in the middle of a request and response
// It adds request body to the request
// Custom middleware for loging of requests
app.use(morgan('dev'));

app.use(express.json());

// Creating own middleware, it gets applied to any request
app.use((req, res, next) => {
  console.log('Hello from the middleware');
  // Never forget to call next otherwise the middleware stack would get stuck
  next();
});

// Modify a request with middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const PORT = 3002;
const API_BASE_URL = '/api/v1';
const ENDPOINTS = {
  TOURS: 'tours',
  USERS: 'users',
};
const TOURS_FILE_PATH = `${__dirname}/dev-data/data/tours-simple.json`;

// We need to get the JSON data from somewhere before we can return it
const tours = JSON.parse(fs.readFileSync(TOURS_FILE_PATH));
// const users = JSON.parse(fs.r)

// 2) Route handlers
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

const getTour = (req, res) => {
  const tourId = Number(req.params.id);
  const tour = tours.find((tour) => tour.id === tourId);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'No tour found for the supplied ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

const createTour = (req, res) => {
  // console.log(req.body);
  // create the new tour object and add it to the tours array
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  // Overwrite the json file which contains the tours
  // Always use non-sync writeFile method inside callback fn
  // to not block the event loop
  // The body of a callback fn is executed in the event loop
  fs.writeFile(TOURS_FILE_PATH, JSON.stringify(tours), (err) => {
    // Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
    // error when trying to send more than one response, this is not allowed
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  });
};

const updateTour = (req, res) => {
  const tourId = Number(req.params.id);
  const tour = tours.find((tour) => tour.id === tourId);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'No tour found for the supplied ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Updated tour placeholder',
    },
  });
};

const deleteTour = (req, res) => {
  const tourId = Number(req.params.id);
  const tour = tours.find((tour) => tour.id === tourId);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'No tour found for the supplied ID',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented',
  });
};
``;

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented',
  });
};
// app.get(`${API_BASE_URL}/${ENDPOINTS.TOURS}`, getAllTours);

// `${API_BASE_URL}/${ENDPOINTS.TOURS}/:id/:name?`
// Adding ? after the parameter makes it optional
// app.get(`${API_BASE_URL}/${ENDPOINTS.TOURS}/:id`, getTour);

// app.post(`${API_BASE_URL}/${ENDPOINTS.TOURS}`, createTour);

// app.patch(`${API_BASE_URL}/${ENDPOINTS.TOURS}/:id`, updateTour);

// app.delete(`${API_BASE_URL}/${ENDPOINTS.TOURS}/:id`, deleteTour);

// 3) Routes
app
  .route(`${API_BASE_URL}/${ENDPOINTS.TOURS}`)
  .get(getAllTours)
  .post(createTour);
app
  .route(`${API_BASE_URL}/${ENDPOINTS.TOURS}/:id`)
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app
  .route(`${API_BASE_URL}/${ENDPOINTS.USERS}`)
  .get(getAllUsers)
  .post(createUser);

app
  .route(`${API_BASE_URL}/${ENDPOINTS.USERS}/:id`)
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// Start the server
// Simply attach an event listener for incoming requests
app.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});

// Everything is middleware
// Middleware Stack - order as defined in the code
// The req, res obj go through each middleware that is defined
// Request-Response Cycle
