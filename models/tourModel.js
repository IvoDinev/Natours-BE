// Mongodb driver for connecting to the DB
// It's the Object Data Model (ODM or ORM for other languages) library for Node
// Express is an abstraction on top of Node, Mongoose is an abstraction on top of Express
// It alllows easier communication with the DB
// Schema - describes the structure of the data, allows to do data modelling
// Model - provides an interface to the DB for CRUD operations
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// Specify a schema for the data
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      // Built-in validator only for strings
      maxlength: [40, 'A tour must have a name of maximum 40 characters'],
      minLength: [5, 'A tour must have a name of minimum 5 characters']
      // validate: [validator.isAlpha, 'name should contain only characters'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty size'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'A rating must be below 5.0'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, 'The tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // Custom validator, {VALUE} has access to val
      validate: {
        message: 'Discount price ({VALUE}) should be below the regulart price',
        validator: function (val) {
          return val < this.price;
        },
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      trim: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // Excludes the field from the response
      // Allows to hide fields from the client
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Specify that virtual properties should be added to the response when the
    // response is JSON or Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create virtual properties which are not persisted into the DB
// We call get() on the virtual field to be able to create it on every GET request
// Virtual fields cannot be used in queries because they don't exist in the DB
tourSchema.virtual('durationWeeks').get(function () {
  // Calculate the value of the virtual field from a real field in the document
  return this.duration / 7;
});

// Document pre-middleware, runs before save() and create()
// It doesn't work for insertMany()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

// Runs after all "pre" middleware functions have completed and has access to the
// newly saved document
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query middleware, runs before find(), this keyword will point to the query
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// Aggregation middleware, aalows to add or change stages of an aggregation pipeline
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// Create a model which uses the Schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

// Create a document out of the Model
// const testTour = new Tour({
//   name: 'The Forest Hiker',
//   rating: 4.7,
//   price: 497,
// });

// // Saves the document to the Tours collection
// testTour
//   .save()
//   .then((doc) => {
//     // Final version of the document in the DB
//     console.log(doc);
//   })
//   .catch((err) => console.log('ERROR: ', err));

// Mongoose Middleware - allows to perform some logic when an event in the DB
// is about to happen - like saving a new document. With middleware we can hook in
// between triggering the DB event and actually performing the event or we can hook in
// after performing the event.
