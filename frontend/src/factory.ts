import { AbiItem } from 'web3-utils';

import web3 from './web3';
import FactoryABI from './abi/factory.json';

const instance = new web3.eth.Contract(
  FactoryABI.abi as AbiItem[],
  '0xf06B52885F2CD817BD566F3080025a09213BB913'
);

export default instance;
