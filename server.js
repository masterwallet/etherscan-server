const http = require("http");
const express = require("express");
const bodyParser = require('body-parser');
const options = require('./options');

const app = express();
app.use(bodyParser.json());

if (options.cors) {
  app.use(require('cors')());
}
app.get('/api', require('./modules/account')(options));
app.get('/api', require('./modules/logs')(options));

// Dummy page for the api
app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/index.html');
});

if (require.main === module) {
  const { host, port } = options;
  console.log("app listening on %s:%d ", host, port);
  app.listen(port, host);
} else {
  module.exports = app;
}
