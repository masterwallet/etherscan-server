const mysql = require('mysql2');
const debug = require('debug')('mysql');

const connectToDatabase = async (options) => {
 // create the connection to database
  const dbconn = await mysql.createPool({
     connectionLimit : 5,
     waitForConnections: true,
     queueLimit: 0,
     insecureAuth: true,

     host: options.mysqlUser || '127.0.0.1',
     port: options.mysqlPort || 3306,
     user: options.mysqlUser || 'root',
     password: options.mysqlPassword || '',
     database: options.mysqlDatabase || 'etherscan'
  }).promise();

  // ignore what is in database in full replay mode
  if (options.replay) return { dbconn, maxBlockNumber: -1 };

  const res = await dbconn.query('SELECT MAX(blockNumber) as bn FROM blocks');
  const maxBlockNumber = res[0][0].bn || -1;
  return { dbconn, maxBlockNumber };
};

const disconnectFromDatabase = ({ dbconn }) => (dbconn.end());

const dropTable = ({ dbconn, table }) => {
  const sql = `DELETE FROM ${table}`;
  debug(sql);
  return dbconn.execute(sql);
};

const installTable = ({ dbconn, filepath, table, separator = ';' }) => {
  const path = filepath.replace(/\\/g, '/');
  const sql = `LOAD DATA LOCAL INFILE '${path}' INTO TABLE ${table} COLUMNS TERMINATED BY '${separator}' OPTIONALLY ENCLOSED BY '"' ESCAPED BY '"' LINES TERMINATED BY '\\n'`;
  debug(sql);
  return dbconn.query(sql);
};

const getTxList = async ({ dbconn, sort, limit = 100, conditions }) => {
  const arrWhere = [];
  const arrParam = [];
  const { hash, startblock, endblock, address, from, to } = conditions;
  if (hash) { arrWhere.push( '(`hash` = ?)'); arrParam.push(hash); }
  if (from) { arrWhere.push( '(`from` = ?)'); arrParam.push(from); }
  if (to) { arrWhere.push( '(`to` = ?)'); arrParam.push(to); }
  if (startblock) { arrWhere.push( '(txlist.`blockNumber` >= ?)'); arrParam.push(startblock); }
  if (endblock) { arrWhere.push( '(txlist.`blockNumber` <= ?)'); arrParam.push(endblock); }
  if (address) { arrWhere.push( '(`from` = ? OR `to` = ?)'); arrParam.push(address); arrParam.push(address); }

  let sql = `SELECT blocks.timeStamp, blocks.blockHash, txlist.*\nFROM txlist JOIN blocks ON txlist.blockNumber = blocks.blockNumber`
  if (arrWhere.length) sql += `\nWHERE ${arrWhere.join('\nAND ')}`;
  sql += `\nLIMIT ${limit}`;
  debug(sql);
  const rows = await dbconn.query(sql, arrParam);
  return rows[0];
};

const getTokenTx = async ({ dbconn, sort, limit = 100, conditions }) => {
  const arrWhere = [];
  const arrParam = [];
  const { hash, startblock, endblock, address, from, to } = conditions;
  if (hash) { arrWhere.push( '(`hash` = ?)'); arrParam.push(hash); }
  if (from) { arrWhere.push( '(`from` = ?)'); arrParam.push(from); }
  if (to) { arrWhere.push( '(`to` = ?)'); arrParam.push(to); }
  if (startblock) { arrWhere.push( '(tokentx.`blockNumber` >= ?)'); arrParam.push(startblock); }
  if (endblock) { arrWhere.push( '(tokentx.`blockNumber` <= ?)'); arrParam.push(endblock); }
  if (address) { arrWhere.push( '(`from` = ? OR `to` = ?)'); arrParam.push(address); arrParam.push(address); }

  let sql = `SELECT blocks.timeStamp, blocks.blockHash, tokenName, tokenSymbol, tokenDecimal, tokentx.*\nFROM tokentx JOIN blocks ON tokentx.blockNumber = blocks.blockNumber JOIN contract on contract.contractAddress = tokentx.contractAddress`;
  if (arrWhere.length) sql += `\nWHERE ${arrWhere.join('\nAND ')}`;
  sql += `\nLIMIT ${limit}`;
  debug(sql);
  const rows = await dbconn.query(sql, arrParam);
  return rows[0];
};

const getLogs = async ({ dbconn, sort, limit = 100, conditions }) => {
  const arrWhere = [];
  const arrParam = [];

  const { hash, from, to, address, fromBlock, toBlock, value, topic0, topic1, topic2, topic3 } = conditions;

  if (topic0) { arrWhere.push( '(`topic0` = ?)'); arrParam.push(topic0); }
  if (topic1) { arrWhere.push( '(`topic1` = ?)'); arrParam.push(topic1); }
  if (topic2) { arrWhere.push( '(`topic2` = ?)'); arrParam.push(topic2); }
  if (topic3) { arrWhere.push( '(`topic3` = ?)'); arrParam.push(topic3); }
  if (hash) { arrWhere.push( '(`hash` = ?)'); arrParam.push(hash); }
  if (from) { arrWhere.push( '(`from` = ?)'); arrParam.push(from); }
  if (to) { arrWhere.push( '(`to` = ?)'); arrParam.push(to); }
  if (value) { arrWhere.push( '(`value` = ?)'); arrParam.push(value); }
  if (fromBlock) { arrWhere.push( '(logs.`blockNumber` >= ?)'); arrParam.push(fromBlock); }
  if (toBlock) { arrWhere.push( '(logs.`blockNumber` <= ?)'); arrParam.push(toBlock); }
  if (address) { arrWhere.push( '(`address` = ?)'); arrParam.push(address); }

  let sql = `SELECT blocks.timeStamp, logs.* FROM logs JOIN blocks ON logs.blockNumber = blocks.blockNumber `;
  if (arrWhere.length) sql += `\nWHERE ${arrWhere.join('\nAND ')}`;
  sql += `\nLIMIT ${limit}`;
  debug(sql);
  const rows = await dbconn.query(sql, arrParam);
  return rows[0].map(r => {
    const res = r;
    res.topics = [];
    if (res.topic0) res.topics.push(res.topic0);
    if (res.topic1) res.topics.push(res.topic1);
    if (res.topic2) res.topics.push(res.topic2);
    if (res.topic3) res.topics.push(res.topic3);
    delete res.topic0;
    delete res.topic1;
    delete res.topic2;
    delete res.topic3;
    return res;
  })
};

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  dropTable,
  installTable,
  getTxList,
  getTokenTx,
  getLogs
};
