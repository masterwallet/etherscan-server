module.exports = (options) => {

  const debug = require('debug')('block-indexer');
  const { processQueue, finishQueue } = require('./block-reader')(options);
  const { connectToDatabase, disconnectFromDatabase } = require('./drivers/index')(options);

  const fatal = x => { debug(x); console.error(x); process.exit(1); }
  const Web3 = require('web3');
  const web3 = new Web3(new Web3.providers.HttpProvider(options.url));

  // INITIAL syncing of the database
  const sync = () => {
    return connectToDatabase(options).then(({ dbconn, maxBlockNumber }) => {

      debug(`Connected to database ${maxBlockNumber}`);
      debug(`Connecting... to ${options.url}`);
      if (!web3.isConnected()) {
        fatal(`FATAL ERROR: Cannot connect to ${options.url}.\nPlease ensure Ganache-CLI daemon is running`);
      }

      const startBlock = options.replay ? 0 : maxBlockNumber + 1; // whould query mysql first
      const endBlock = web3.eth.blockNumber;
      debug(`Connected... to ${options.url}. Last Block is ${endBlock}`);
      debug("Missing blocks=", startBlock, '...', endBlock );

      if (startBlock <= endBlock) {
        return processQueue({ web3, startBlock, endBlock })
          .then(async ({ fileDescriptors, processId }) => (finishQueue({ options, reset: options.replay, fileDescriptors, processId })))
          .then(() => { debug('Indexing Finished'); })
          .catch(pe => { fatal(pe); });
      } else {
        debug('Nothing to download');
        return disconnectFromDatabase({ dbconn });
      }
    }).catch(dbe => { fatal(dbe); });
  }; // end of sync

  // WATCHER: to sync block chain with local database
  const watch = () => {
    debug(`Connecting... to ${options.url}`);
    if (!web3.isConnected()) {
      fatal(`FATAL ERROR: Cannot connect to ${options.url}.\nPlease ensure Ganache-CLI daemon is running`);
    }
    web3.eth.filter('latest').watch((error, blockHash) => {
      if (error) {
        debug('watching next block', error);
      } else {
        const block = web3.eth.getBlock(blockHash);
        const { number } = block;
        connectToDatabase(options).then(({ dbconn, maxBlockNumber }) => {
          if (number > maxBlockNumber) {
            debug('Block Notification: ', blockHash);
            debug(JSON.stringify(block));

            processQueue({ web3, startBlock: number, endBlock: number })
              .then(async ({ fileDescriptors, processId }) => (finishQueue({ options, reset: false, fileDescriptors, processId })))
              .catch(pe => { fatal(pe); });

          } else {
            debug(`Skipping block ${number}, max in DB: ${maxBlockNumber}`);
          }
        });
      }
    });
  }; // end of watch

  return { sync, watch };
}

