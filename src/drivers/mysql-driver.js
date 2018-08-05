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
  let sql = `SELECT * FROM logs`;
  if (arrWhere.length) sql += `\nWHERE ${arrWhere.join('\nAND ')}`;
  sql += `\nLIMIT ${limit}`;
  debug(sql);
  const rows = await dbconn.query(sql, arrParam);
  return rows[0];
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
