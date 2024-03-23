// Filesystem API
const fs = require('fs');

// We need to get the JSON data from somewhere before we can return it
const TOURS_FILE_PATH = `${__dirname}/../dev-data/data/tours-simple.json`;
const tours = JSON.parse(fs.readFileSync(TOURS_FILE_PATH));

exports.checkID = (req, res, next) => {
  if (Number(req.params.id) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'No tour found for the supplied ID',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Bad request',
    });
  }
  next();
};

// 2) Route handlers
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

exports.getTour = (req, res) => {
  const tourId = Number(req.params.id);
  const tour = tours.find((tour) => tour.id === tourId);

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

exports.createTour = (req, res) => {
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

exports.updateTour = (req, res) => {
  const tourId = Number(req.params.id);
  const tour = tours.find((tour) => tour.id === tourId);

  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Updated tour placeholder',
    },
  });
};

exports.deleteTour = (req, res) => {
  const tourId = Number(req.params.id);
  const tour = tours.find((tour) => tour.id === tourId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
