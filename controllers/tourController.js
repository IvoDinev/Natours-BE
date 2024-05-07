const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

// Aliasing commonly used request
// In essence what it's happening is that a middleware gets executed
// before the route handler. The middleware prefills the query.
// The user will not need to add query params to the URL.
// On calling the endpoint the alias will automatically add the params
// to the request
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// 2) Route handlers
exports.getAllTours = catchAsync(async (req, res, next) => {
  //  Returns the total number of documents in the collection
  //  const totalTours = await Tour.countDocuments();

  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tourId = req.params.id;
  const tour = await Tour.findById(tourId);
  // Tour.findOne({ _id: req.params.id })

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // const newTour = new Tour(req.body);
  // newTour.save()

  // Same as expressions on the upper lines
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Aggregation pipeline, find min, max, avg
// It runs all documents in a collection through
// functions which could perform different calculations
exports.getTourStats = catchAsync(async (req, res, next) => {
  // The aggregation pipeline receives an array of stages. Every document will go
  // through each stage
  const stats = await Tour.aggregate([
    // First stage - match. Performs filtering based on some condition
    {
      $match: {
        // Field by which the match should be performed
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      // Allows to group documents together using accumulators.
      $group: {
        // We always need to specify id in order to specify by what we want to group
        // difficulty is the field by which we will group
        _id: { $toUpper: '$difficulty' },
        // Fields which would contain the results of the aggregations
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      // Here we need to use the field names from the previous stage
      $sort: {
        avgPrice: 1,
      },
    },
    // We can repeat stages
    // {
    //   $match: {
    //     _id: { $ne: 'EASY' },
    //   },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);

  const plan = await Tour.aggregate([
    {
      // takes out the elements of an array field in the document (deconstructs the array)
      // and creates separate documents for every element in the array field
      // Create separate documents for every start date on which a tour starts
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          // Match all tours which start in the current year
          // start date to be between the first and last date of the year
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        toursCount: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      // Show or hide specific fields
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        toursCount: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
