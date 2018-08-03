const createDebug = require('debug');
const options = require('./options');

const addBlock = ({ number, timestamp, hash }) => {
  
};


const blockHandler = (n, block) => {
  console.log(block.number, JSON.stringify(Object.keys(block)));
  // append block
  // append every tx from block.transactions
};

if (require.main === module) {
  const debug = createDebug('etherscan-indexer');
  const Web3 = require('web3');
  const web3 = new Web3(new Web3.providers.HttpProvider(options.url));
  const Getter = require('./getter');
  const getter = new Getter(web3);

  const startBlock = 0; // whould query mysql first 
  const endBlock = web3.eth.blockNumber;
  console.log("blocks=", startBlock, '...', endBlock );
  getter.requestBlockRange(startBlock, endBlock, blockHandler);
  console.log('finished');

} else {
  module.exports = {};
}
