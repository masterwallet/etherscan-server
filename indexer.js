const options = require('./src/options');
const indexer = require('./src/block-indexer')(options);
indexer.sync().then(() => { process.exit(0); });

