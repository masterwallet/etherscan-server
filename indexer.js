const createDebug = require('debug');
const options = require('./options');
const { processQueue, finishQueue } = require('./block-reader');
const { connectToDatabase, disconnectFromDatabase } = require('./drivers/mysql-driver');

if (require.main === module) {
  const debug = createDebug('indexer');
  const fatal = x => { debug(x); console.error(x); process.exit(1); }
  const Web3 = require('web3');
  const web3 = new Web3(new Web3.providers.HttpProvider(options.url));

  connectToDatabase(options).then(({ dbconn, maxBlockNumber }) => {

    debug(`Connected to database ${maxBlockNumber}`);
    debug(`Connecting... to ${options.url}`);
    if (!web3.isConnected()) { 
      fatal(`FATAL ERROR: Cannot connect to ${options.url}.\nPlease ensure Ganache-CLI daemon is running`); 
    }
  
    const startBlock = maxBlockNumber + 1; // whould query mysql first 
    const endBlock = web3.eth.blockNumber;
    debug(`Connected... to ${options.url}. Last Block is ${endBlock}`);
    debug("Missing blocks=", startBlock, '...', endBlock );

    if (startBlock <= endBlock) {
      processQueue({ web3, startBlock, endBlock })
        .then(async () => (finishQueue({ options })))
        .then(() => { debug('Indexing Finished'); })
        .catch(pe => { fatal(pe); });
    } else {
      debug('Nothing to download');
      disconnectFromDatabase({ dbconn });
    }
  }).catch(dbe => { fatal(dbe); });

} else {
  module.exports = {};
}
	