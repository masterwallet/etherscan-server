const axios = require('axios');
const ethereumUtil = require('ethereumjs-util');
const BigNumber = require('bignumber.js');

const genRpcId = () => (new Date().getTime()) + '.' + Math.random();

const query = ({ method, params, endpoint }) => (
  axios({
    url: '/',
    baseURL: endpoint,
    method: 'post',
    headers: { 'content-type': 'text/plain' },
    data: JSON.stringify({ id: genRpcId(), jsonrpc: '2.0', method, params })
  }).then(response => {
    if (response.data && response.data.result) {
      return response.data.result;
    } else if (response.data.error) {
      throw new Error(response.data.error.message);
    }else {
      throw new Error('Unexpected response');
    }
  }).catch(error => {
    throw new Error(error.message);
  })
);

const isRPCAccessible = async ({ endpoint }) => {
  try {
    return await query({ method: 'web3_clientVersion', endpoint });
  } catch (error) {
    return false;
  }
};

const callContract = async ({ 
  address,
  contractAddress,
  abi,
  contractMethod,
  contractParams, // array
  endpoint 
}) => {

  // Get contract method specification from ABI
  const methodSpec = abi.find(spec => {
    if (spec.name === contractMethod) return spec;
  });
  const paramTypesStr = methodSpec.inputs.map(input => input.type).join(',');
  const methodHash = ethereumUtil.sha3(`${contractMethod}(${paramTypesStr})`).slice(0, 4).toString('hex');
  contractParams = contractParams || [];
  // Encode params
  const encodedParams = methodSpec.inputs.map((input, i) => {
    const { type } = input;
    const value = contractParams[i];
    // TODO: handle other param types
    switch (type) {
      case 'address': {
        return value.substring(2).padStart(64, '0');
      }
    }
  });
  const data = `0x${methodHash}${encodedParams.join('')}`;

  const response = await query({ method: 'eth_call', params: [
    { 
      to: contractAddress,
      from: address,
      data 
    }
  ], endpoint });

  // Get output type and decode response according to type
  const outputType = methodSpec.outputs.map(output => output.type).pop();
  switch (outputType) {
    case 'uint256':  // e.g. balance
    case 'uint8' : { // e.g. decimals
      return parseInt(response, 16);
    }
    case 'string': { // e.g. name, symbol
      return decodeString(response);
    }
  }
};

const decodeString = (response) => {
  // web3/lib/solidity/type.js: remove 0x, substr starting from 64 length 64*2
  const param = response.substr(64 + 2, 64 * 2);
  const length = (new BigNumber(param.slice(0, 64), 16)).toNumber() * 2;
  const activePart = param.substr(64, length);

  let string = '';
  for (let i = 0; i < activePart.length; i += 2) {
    string += String.fromCharCode(parseInt(activePart.substr(i, 2), 16));
  }
  return string;
};

module.exports = {
  query,
  isRPCAccessible,
  callContract
};