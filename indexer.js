const createDebug = require('debug');
const options = require('./options');
const fs = require('fs');

const fpBlocks   = fs.openSync('./db_blocks.csv', 'w');
const fpContract = fs.openSync('./db_contract.csv', 'w');
const fpTxlist   = fs.openSync('./db_txlist.csv', 'w');

const finish = () => {
  fs.closeSync(fpBlocks);
  fs.closeSync(fpContract);
  fs.closeSync(fpTxlist);
  // (re-) install MYSQL tables and remove files
};

const blockHandler = (block) => {
  console.log(block.number, JSON.stringify(Object.keys(block)));
  // append block
  const { number, hash, timestamp } = block;
  fs.writeSync(fpBlocks, `${number};${hash};${timestamp}\n`);
  // append every tx from block.transactions
};


if (require.main === module) {
  const debug = createDebug('etherscan-indexer');
  const Web3 = require('web3');
  const web3 = new Web3(new Web3.providers.HttpProvider(options.url));
  const Getter = require('./getter');
  const getter = new Getter(web3);

  const handleQueue = (startBlock, endBlock) => {
    const queue = [];
    for (let k = endBlock; k >= startBlock; k --) { queue.push(k); }

    return new Promise(resolve => {
      const pick = () => {
        if (queue.length === 0) return resolve();
        const num = queue.shift();
        getter.requestBlock(num, (n, block) => {
	   blockHandler(block);
           pick();
        });
      };
      pick();
    });
  };

  const startBlock = 0; // whould query mysql first 
  const endBlock = web3.eth.blockNumber;
  console.log("blocks=", startBlock, '...', endBlock );

  handleQueue(startBlock, endBlock).then( () => {
    console.log('finished');
    finish();
  });

} else {
  module.exports = {};
}
