const mysql = require('mysql2');
const debug = require('debug')('mysql');

const connectToDatabase = async (options) => {
 // create the connection to database
  const dbconn = await mysql.createPool({
     connectionLimit : 5,
     waitForConnections: true,
     queueLimit: 0,

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

const getTxList = async ({ dbconn, limit = 100, conditions = []}) => {
  const sql = `SELECT blocks.timeStamp, blocks.blockHash, txlist.* FROM txlist JOIN blocks ON txlist.blockNumber = blocks.blockNumber LIMIT ${limit}`;
  debug(sql);
  const rows = await dbconn.query(sql);
  return rows[0];
};

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  dropTable,
  installTable,
  getTxList
};