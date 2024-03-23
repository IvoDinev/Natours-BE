// Contains stuff which are not related to express
// DB config, error handling, env variables
// Acts as an entrypoint
// Run this file to start the app
const dotenv = require('dotenv');
// Reads from the .env file and saves the variables as Nodejs env varialbles
dotenv.config({ path: './config.env' });

const app = require('./app');

// Access env variables from express through app.get
// console.log(app.get('env'));

// Access env variables from Nodejs
// console.log(process.env);

const port = process.env.PORT || 3002;
// Start the server
// Simply attach an event listener for incoming requests
app.listen(port, () => {
  console.log(`App running on ${port}`);
});
