const createDebug = require('debug');
const options = require('./options');
const { processQueue, finishQueue } = require('./block-reader.js');

if (require.main === module) {
  const debug = createDebug('indexer');
  const fatal = x => { debug(x); console.error(x); process.exit(1); }
  const Web3 = require('web3');
  const web3 = new Web3(new Web3.providers.HttpProvider(options.url));

  const mysql = require('mysql2/promise');
 // create the connection to database
  const connection = await mysql.createConnection({
     host: options.mysqlUser || '127.0.0.1',
     port: options.mysqlPort || 3306,
     user: options.mysqlUser || 'root',
     password: options.mysqlPassword || '',
     database: options.mysqlDatabase || 'etherscan'
  });
console.log(connection);

  debug(`Connecting... to ${options.url}`);
  if (!web3.isConnected()) { 
    fatal(`FATAL ERROR: Cannot connect to ${options.url}.\nPlease ensure Ganache-CLI daemon is running`); 
  }

  const startBlock = 0; // whould query mysql first 
  const endBlock = web3.eth.blockNumber;
  debug(`Connected... to ${options.url}. Last Block is ${endBlock}`);

  debug("Reading blocks=", startBlock, '...', endBlock );
  processQueue({ web3, startBlock, endBlock }).then(() => {
    debug('Finished');
    finishQueue();
  });

} else {
  module.exports = {};
}
