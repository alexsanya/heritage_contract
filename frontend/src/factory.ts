import { AbiItem } from 'web3-utils';

import web3 from './web3';
import FactoryABI from './abi/factory.json';

const instance = web3 && new web3.eth.Contract(
  FactoryABI.abi as AbiItem[],
  '0x4b2fFA096f28674B8E4f73D6F94c7b8AFD39b494' // polygon mainnet
  // '0xa0408524444aB165296D6B0D8BC21c0eD693ee51' - ganache
);

export default instance;
