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

*/

const debug = require('debug')('module=account');
const { ok, body, error } = require('./express-util')('account');

module.exports = (options) => {
  const { connectToDatabase, getTxList } = require('./../drivers/mysql-driver');
  return (req, res, next) => {
    const { module, action } = req.query;
    try {

      if (module === 'account') {
        if (action === 'txlist') {
          const { address, startblock, endblock, sort } = req.query;
          debug(JSON.stringify(req.query));
          const conditions = [];

          connectToDatabase(options).then(({ dbconn }) => {
            getTxList({ dbconn, conditions }).then(rows => {
              return ok(res, rows);
            }).catch(mysqle => { error(res, mysqle.toString()); })
          });
      
        } else if (action == 'tokentx') {
          return error(res, 'Error!');
        } else next();
      } else next();

   } catch (e) {
     error(res, e.toString());
   }
    
  };
};
 