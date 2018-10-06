module.exports = (options) => {

  return {
    eth_blockNumber: { params: [] },
    eth_getBlockByNumber: { params: [ "tag", "boolean" ] },
    eth_getUncleByBlockNumberAndIndex: { params: [ "tag", "index" ] },
    eth_getBlockTransactionCountByNumber: { params: [ "tag" ] },
    eth_getTransactionByHash: { params: [ "hash" ] },
    eth_getTransactionByBlockNumberAndIndex: { params: [ "tag", "index" ] },
    eth_getTransactionCount: { params: [ "tag" ] },
    eth_sendRawTransaction: { params: [ "hex" ] },
    eth_getTransactionReceipt: { params: [ "txhash" ] },
    eth_call: { params: [ "to", "data", "tag" ] },
    eth_getCode: { params: [ "address", "tag" ] },
    eth_getStorageAt : { params: [ "address", "tag" ] },
    eth_gasPrice: { params: [] },
    eth_estimateGas: { params: [ "to", "value", "gasPrice", "ga" ] }
  };

};
