const createDebug = require('debug');
const fs = require('fs');
const debug = createDebug('blockreader');
const dbgContract = createDebug('contract:created');
const erc20abi = JSON.parse(fs.readFileSync('./erc20.abi.json'));

let fpBlocks = null;
let fpContract = null;
let fpTxlist = null;

const finishQueue = () => {
  fs.closeSync(fpBlocks);
  fs.closeSync(fpContract);
  fs.closeSync(fpTxlist);
  // (re-) install MYSQL tables and remove files
};

const getReceipt = ({ web3, hash }) => (new Promise((resolve, reject) => {
  web3.eth.getTransactionReceipt(hash, (err, result) => {
    if (err) reject(err);
    else resolve(result);
  });
}));

const blockHandler = async ({ web3, block }) => {
  const { number, hash, timestamp, transactions } = block;
  debug(`reading #${number}, tx:${transactions.length}`);

  // Block has the following properties
  // ["number","hash","parentHash","mixHash","nonce","sha3Uncles","logsBloom","transactionsRoot",
  // "stateRoot","receiptsRoot","miner","difficulty","totalDifficulty","extraData","size",
  // "gasLimit","gasUsed","timestamp","transactions","uncles"]

  // append block
  fs.writeSync(fpBlocks, `${number};${hash};${timestamp}\n`);
  // append every tx from block.transactions
  fs.writeFileSync(`./reader/block_${number}.json`, JSON.stringify(block, null, 2));    

  for (const trans of transactions) {
    const { hash, nonce, transactionIndex, from, to, value, gas, gasPrice, input } = trans;
    const receipt = await getReceipt({ web3, hash });
    fs.writeFileSync(`./reader/receipt_${hash}.json`, JSON.stringify(receipt, null, 2));    
    const { status, logs, contractAddress } = receipt;

    if (to === "0x0" && contractAddress) {
      dbgContract(`${contractAddress} at block ${number}`);

      const contractAbi = web3.eth.contract(erc20abi);
      const theContract = contractAbi.at(contractAddress);

      const symbol = theContract.symbol.call();
      const name = theContract.name.call();
      const decimals = theContract.decimals.call();	
      dbgContract(`SYMBOL="${symbol}" NAME="${name}" DECIMALS="${decimals}"`);

      // that was a contract creation...
      fs.writeSync(fpContract, `${receipt.contractAddress};${number};${name};${symbol};${decimals}\n`);
    }
  }
};

const processQueue = ({ web3, startBlock, endBlock }) => {
  fpBlocks   = fs.openSync('./reader/db_blocks.csv', 'w');
  fpContract = fs.openSync('./reader/db_contract.csv', 'w');
  fpTxlist   = fs.openSync('./reader/db_txlist.csv', 'w');

  const queue = [];
  for (let k = endBlock; k >= startBlock; k --) { queue.push(k); }
  return new Promise(resolve => {
    const pick = () => {
      if (queue.length === 0) return resolve();
      const num = queue.shift();
      const include_transactions = true;
      web3.eth.getBlock(num, include_transactions, async (err, block) => {
        if (err) return reject( "Error on Block#" + num + ": " + err);
        await blockHandler({ web3, block });
        pick();
      });
    };
    pick();
  });
};

module.exports = { processQueue, finishQueue };
