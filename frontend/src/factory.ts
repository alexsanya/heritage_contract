import { AbiItem } from 'web3-utils';

import web3 from './web3';
import { factoryAddress } from './config';
import FactoryABI from './abi/factory.json';

const instance = web3 && new web3.eth.Contract(
  FactoryABI.abi as AbiItem[],
  factoryAddress
);

export default instance;
