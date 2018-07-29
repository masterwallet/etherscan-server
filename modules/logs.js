module.exports = (options) => {
  return (req, res, next) => {

/*
https://api.etherscan.io/api?module=logs&action=getLogs
&fromBlock=379224
&toBlock=400000
&address=0x33990122638b9132ca29c723bdf037f1a891a70c
&topic0=0xf63780e752c6a54a94fc52715dbc5518a3b4c3c2833d301a204226548a2a8545
&topic0_1_opr=and
&topic1=0x72657075746174696f6e00000000000000000000000000000000000000000000

*/
    next();
  };
};