import { AbiItem } from 'web3-utils';

import web3 from './web3';
import FactoryABI from './abi/factory.json';

const instance = new web3.eth.Contract(
  FactoryABI.abi as AbiItem[],
  '0x5388FC9Ac0f0EB04faC9B87c9B26802Baa975e3a'
);

export default instance;
