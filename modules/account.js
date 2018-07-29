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

module.exports = (options) => {
  return (req, res, next) => {

    next();
  };
};
 