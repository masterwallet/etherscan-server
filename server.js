const http = require("http");
const express = require("express");
// const bodyParser = require('body-parser');
const options = require('./src/options');
const { error } = require('./src/express-util')('etherscan-server');
const { connectToDatabase, disconnectFromDatabase } = require('./src/drivers/index')(options);

const app = express();
// app.use(bodyParser.json()); 
if (options.cors) { app.use(require('cors')()); }

app.get('/api', require('./src/api')(options));

app.use((req, res, next) => {
  if (req.path !== '/api') error(res, 'Please use /api endpoint');
  else next();
});


if (require.main === module) {
  const indexer = require('./src/block-indexer')(options);
  indexer.sync()
    // .then(indexer.watch)
    .then(() => {
      const { host, port } = options;
      console.log("app listening on %s:%d ", host, port);
      app.listen(port, host);
    }).catch(e => {
      console.error("ERROR: ", e.toString());
    });
} else {
  module.exports = app;
}
