// Mongodb driver for connecting to the DB
// It's the Object Data Model (ODM or ORM for other languages) library for Node
// Express is an abstraction on top of Node, Mongoose is an abstraction on top of Express
// It alllows easier communication with the DB
// Schema - describes the structure of the data, allows to do data modelling
// Model - provides an interface to the DB for CRUD operations
const mongoose = require('mongoose');

// Specify a schema for the data
const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
    },
    rating: { type: Number, default: 4.5 },
    price: {
      type: Number,
      required: [true, 'The tour must have a price'],
    },
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
