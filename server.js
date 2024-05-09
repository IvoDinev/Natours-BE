// Contains stuff which are not related to express
// DB config, error handling, env variables
// Acts as an entrypoint
// Run this file to start the app

// Mongodb driver for connecting to the DB
const mongoose = require('mongoose');

const dotenv = require('dotenv');
// Reads from the .env file and saves the variables as Nodejs env varialbles
dotenv.config({ path: './config.env' });

const app = require('./app');

// Catching errors in synchronous code
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  // It's absolutely necessary to crash the app in case of uncaught exception
  // The node process is in Unclean state. The process needs to be terminated
  // Many hosting services do that automatically
  // Use this a last resort. Ideally the errors should be caught in the
  // code where they occur.
  // Always put this on top, before any code executes
  process.exit(1);
});

// Access env variables from express through app.get
// console.log(app.get('env'));

// Access env variables from Nodejs
// console.log(process.env);

// Add the DB user PW to the DB connection string
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connect to the DB
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((connection) => {
    console.log('DB connection successful');
    // throw new Error('Failed');
  });

const port = process.env.PORT || 3002;
// Start the server
// Simply attach an event listener for incoming requests
const server = app.listen(port, () => {
  console.log(`App running on ${port}`);
});

// Listen for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  // Shut down gracefully by allowing the server to finish the pending requests
  // In real prod environment there will be some tool which would automatically restart
  // the server
  server.close(() => {
    // Shut down the application
    process.exit(1);
  });
});
