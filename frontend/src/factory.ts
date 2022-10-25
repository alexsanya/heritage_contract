import { AbiItem } from 'web3-utils';

import web3 from './web3';
import FactoryABI from './abi/factory.json';

const instance = new web3.eth.Contract(
  FactoryABI.abi as AbiItem[],
  '0xc645c97A2334365cD4A47Bb88B42578B8fDe4986'
);

export default instance;
