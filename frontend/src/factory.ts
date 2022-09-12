import { AbiItem } from 'web3-utils';

import web3 from './web3';
import FactoryABI from './abi/factory.json';

const instance = new web3.eth.Contract(
  FactoryABI.abi as AbiItem[],
  '0x5A71A0B8e85DBfAa9E3Fcb8FCefDDF3C65173C76'
);

export default instance;
