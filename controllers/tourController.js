const Tour = require('../models/tourModel');

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
}

// 2) Route handlers
exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);
    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((field) => delete queryObj[field]);

    // const validatedQueryObj = Object.entries(queryObj).filter((entry) =>
    //   !excludedFields.includes(entry[0])
    // );

    // Default way for filtering with an object
    // const tours = await Tour.find({ duration: 5});

    // 2) Advanced filtering
    // const updatedQueryObj = {};
    // Object.entries(queryObj).forEach(([key, value]) => {
    //   const oldOperatorKey = Object.keys(value)[0];
    //   const newOperatorKey = `$${oldOperatorKey}`;
    //   updatedQueryObj[key] = {
    //     [newOperatorKey]: value[oldOperatorKey],
    //   };
    // });
    // console.log(updatedQueryObj);
    // console.log(queryObj);
    let queryStr = JSON.stringify(queryObj);
    // Replace gt, gte, lt, lte with $gt ...
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    // Query with operator which is different than equal
    // How to write the operator in MongoDB
    // { difficulty: 'easy', duration: { $gte: 5 } }
    // How do we get the query object from the URL
    // { duration: { gte: '5' } }

    // Use "sort=-price" to sort in descending order
    // 3) Sorting
    if (req.query.sort) {
      // Sort by multiple criterias
      // In mongoose the query would be written in this way
      // sort('price ratingsAverage')
      // But in browser it will be price,ratingsAverage with ,
      const sortingCriterias = req.query.sort.split(',').join(' ');
      query = query.sort(sortingCriterias);
    } else {
      // query.sort('-createdAt');
    }

    // 4) Field limiting, aka "projecting"
    // How to include fields
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }
    // How to exclude fields
    else {
      query = query.select('-__v');
    }

    // 5) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // page=2&limit=10
    // 1-10 is page 1, 11-20 is page 2
    // skip requires to pass the number of results to be skipped before
    // starting to return results
    // We skip 10 results to start from page 2 (because page 1 = 1-10)
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      // Returns the total number of documents in the collection
      const totalTours = await Tour.countDocuments();
      if (skip >= totalTours) {
        throw new Error('This page does not exist');
      }
    }

    const tours = await query;
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong',
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tourId = req.params.id;
    const tour = await Tour.findById(tourId);
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Not Found',
    });
  }
};

exports.createTour = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Tour not found!',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Tour not found!',
    });
  }
};
