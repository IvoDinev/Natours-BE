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
  });

const port = process.env.PORT || 3002;
// Start the server
// Simply attach an event listener for incoming requests
app.listen(port, () => {
  console.log(`App running on ${port}`);
});
