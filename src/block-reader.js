module.exports = (options) => {

const path = require('path');
const createDebug = require('debug');
const fs = require('fs');
const debug = createDebug('blockreader');
const dbgContract = createDebug('contract:created');
const dbgTransfer = createDebug('token:transfer');
const erc20abi = JSON.parse(fs.readFileSync(__dirname + '/erc20.abi.json'));
const { connectToDatabase, disconnectFromDatabase, dropTable, installTable } = require('./drivers/index')(options);

const tmp = require('tmp');
const tmpPath = tmp.dirSync();
debug(`created temp path ${tmpPath}`);

let fpBlocks = null;
let fpContract = null;
let fpTxlist = null;
let fpTokenTx = null;
let fpLogs = null;
const tokenContracts = {};
const flushDebug = true;

const finishQueue = async ({ options }) => {
  const dbgFinish = createDebug('queue:finished');
  dbgFinish('Closing Generated CSV Files');
  fs.closeSync(fpBlocks);
  fs.closeSync(fpContract);
  fs.closeSync(fpTxlist);
  fs.closeSync(fpTokenTx);
  fs.closeSync(fpLogs);

  // (re-) install MYSQL tables
  const csvDir = tmpPath.name;
  dbgFinish(`CSV folder: ${csvDir}`);

  const { dbconn } = await connectToDatabase(options);
  const tables = [
    { filepath: csvDir + '/db_blocks.csv', table: 'blocks' },
    { filepath: csvDir + '/db_contract.csv', table: 'contract' },
    { filepath: csvDir + '/db_txlist.csv', table: 'txlist' },
    { filepath: csvDir + '/db_tokentx.csv', table: 'tokentx' },
    { filepath: csvDir + '/db_logs.csv', table: 'logs' }
  ];

  for (const { filepath, table } of tables) {
    if (options.replay) {
      dbgFinish(`resetting ${table} table`);
      await dropTable({ dbconn, table });
    }
    if (fs.statSync(filepath).size) {
      dbgFinish(`updating ${table} table`);
      await installTable({ dbconn, filepath, table, separator: ';' });
    }
    fs.unlinkSync(filepath);
  }

  if (!flushDebug) {
    dbgFinish(`Removing temp path ${tmpPath.name}`);
    tmpPath.removeCallback();
  }
  dbgFinish('Disconnecting from database');
  return disconnectFromDatabase({ dbconn });
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
  fs.writeSync(fpBlocks, `${number};${timestamp};${hash}\n`);
  // append every tx from block.transactions
  if (flushDebug) fs.writeFileSync(`${tmpPath.name}/block_${number}.json`, JSON.stringify(block, null, 2));

  for (const trans of transactions) {
    const { hash, nonce, transactionIndex, from, to, value, gas, gasPrice, input } = trans;
    const receipt = await getReceipt({ web3, hash });
    if (flushDebug) fs.writeFileSync(`${tmpPath.name}/receipt_${hash}.json`, JSON.stringify(receipt, null, 2));
    const { status, logs, gasUsed, contractAddress } = receipt;
    const statusValue = parseInt( status.replace('0x', ''), 16 ) ? 1 : '';
    const isError = statusValue ? 0 : 1;
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
      tokenContracts[contractAddress] = { symbol, name, decimals, contractAddress };
    }

    fs.writeSync(fpTxlist,
      `${number};${hash};${transactionIndex};${nonce};${from};${contractAddress || ''};${to};${value};${gas};${gasPrice};${gasUsed};${input};${statusValue};${isError}\n`);

    if (logs) {
      const sha3Transfer = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      for (const log of logs) {
        const { logIndex, transactionIndex, transactionHash, data, type, topics } = log;
        if (tokenContracts[to] && topics[0] === sha3Transfer) {
          // that was an ERC20 payment to contract, might lead to some actions
          const removePad = x => x.replace('0x000000000000000000000000', '0x');
          const tokenFrom = removePad(topics[1]);
          const tokenTo = removePad(topics[2]);
          const tokenQty = parseInt(data, 16);
          dbgTransfer(`#${number}: from ${tokenFrom} to ${tokenTo}`);
          fs.writeSync(fpTokenTx,
            `${number};${hash};${transactionIndex};${nonce};${tokenFrom};${to};${tokenTo};${tokenQty};${gas};${gasPrice};${gasUsed};${input}\n`);
        }
      }
    }
  }
};

const processQueue = ({ web3, startBlock, endBlock }) => {
  fpBlocks   = fs.openSync(`${tmpPath.name}/db_blocks.csv`, 'w');
  fpContract = fs.openSync(`${tmpPath.name}/db_contract.csv`, 'w');
  fpTxlist   = fs.openSync(`${tmpPath.name}/db_txlist.csv`, 'w');
  fpTokenTx  = fs.openSync(`${tmpPath.name}/db_tokentx.csv`, 'w');
  fpLogs     = fs.openSync(`${tmpPath.name}/db_logs.csv`, 'w');

  const queue = [];
  for (let k = startBlock; k <= endBlock; k++) { queue.push(k); }
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

return { processQueue, finishQueue };

};
