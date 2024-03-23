// Contains stuff which are not related to express
// DB config, error handling, env variables
// Acts as an entrypoint
// Run this file to start the app
const { PORT } = require('./constants');
const app = require('./app');
// Start the server
// Simply attach an event listener for incoming requests
app.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});
