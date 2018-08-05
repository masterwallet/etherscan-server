/*

Get a list of 'Normal' Transactions By Address
[Optional Parameters] startblock: starting blockNo to retrieve results, endblock: ending blockNo to retrieve results
http://api.etherscan.io/api?module=account&action=txlist&address=0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken
([BETA] Returned 'isError' values: 0=No Error, 1=Got Error)
(Returns up to a maximum of the last 10000 transactions only)


[BETA] Get a list of 'Internal' Transactions by Address
[Optional Parameters] startblock: starting blockNo to retrieve results, endblock: ending blockNo to retrieve results
http://api.etherscan.io/api?module=account&action=txlistinternal&address=0x2c1ba59d6f58433fb1eaee7d20b26ed83bda51a3&startblock=0&endblock=2702578&sort=asc&apikey=YourApiKeyToken
(Returned 'isError' values: 0=No Error, 1=Got Error)
(Returns up to a maximum of the last 10000 transactions only)

[BETA] Get a list of "ERC20 - Token Transfer Events" by Address
[Optional Parameters] startblock: starting blockNo to retrieve results, endblock: ending blockNo to retrieve results
http://api.etherscan.io/api?module=account&action=tokentx&address=0x4e83362442b8d1bec281594cea3050c8eb01311c&startblock=0&endblock=999999999&sort=asc&apikey=YourApiKeyToken
(Returns up to a maximum of the last 10000 transactions only)

http://api.etherscan.io/api?module=account&action=txlist&address=0xf72c8b922cfee4d14c0e9d84ab43747c70d13e5a&startblock=2240910&endblock=2240920&sort=asc&apikey=YourApiKeyToken

https://api.etherscan.io/api?module=logs&action=getLogs
&fromBlock=379224
&toBlock=400000
&address=0x33990122638b9132ca29c723bdf037f1a891a70c
&topic0=0xf63780e752c6a54a94fc52715dbc5518a3b4c3c2833d301a204226548a2a8545
&topic0_1_opr=and
&topic1=0x72657075746174696f6e00000000000000000000000000000000000000000000
*/

const debug = require('debug')('module=account');
const { ok, error } = require('./express-util')('account');

module.exports = (options) => {
  const { connectToDatabase, getTxList, getTokenTx, getLogs } = require('./drivers/index')(options);
  return (req, res, next) => {
    const { module, action } = req.query;
    debug('module=', module, 'action=', action, 'req.query=', req.query);


    try {

      if (module === 'account') {
        if (action === 'txlist') {

          const { hash, from, to, address, startblock, endblock, sort = 'asc' } = req.query;
          const conditions = { hash, startblock, endblock, address, from, to };
          debug('conditions', JSON.stringify(conditions) );

          return connectToDatabase(options).then(({ dbconn }) => {
            getTxList({ dbconn, conditions, sort }).then(rows => {
              return ok(res, rows);
            }).catch(mysqle => { error(res, mysqle.toString()); });
          }).catch(me => { error(res, me.toString()); });

        } else if (action === 'tokentx') {

          const { hash, from, to, address, startblock, endblock, sort = 'asc' } = req.query;
          const conditions = { hash, startblock, endblock, address, from, to };
          debug('conditions', JSON.stringify(conditions) );

          return connectToDatabase(options).then(({ dbconn }) => {
            getTokenTx({ dbconn, conditions, sort }).then(rows => {
              return ok(res, rows);
            }).catch(mysqle => { error(res, mysqle.toString()); });
          }).catch(me => { error(res, me.toString()); });

        } else {
          return error(res, 'Error! Invalid action (module=account)');
        }
      } else if (module === 'logs') {
        if (action === 'getLogs') {

          const { hash, from, to, address, fromBlock, toBlock, value, topic0, topic1, topic2, topic3, sort = 'asc' } = req.query;
          const conditions = { hash, from, to, address, fromBlock, toBlock, value, topic0, topic1, topic2, topic3 };
          debug('conditions', JSON.stringify(conditions) );

          return connectToDatabase(options).then(({ dbconn }) => {
            getLogs({ dbconn, conditions, sort }).then(rows => {
              return ok(res, rows);
            }).catch(mysqle => { error(res, mysqle.toString()); });
          }).catch(me => { error(res, me.toString()); });

        } else {
          return error(res, 'Error! Invalid action (module=logs)');
        }
      } else {
        return error(res, 'Error! Invalid module');
      }

   } catch (e) {
     return error(res, e.toString());
   }
   next();
  };
};

