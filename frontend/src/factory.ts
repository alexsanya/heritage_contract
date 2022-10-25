import { AbiItem } from 'web3-utils';

import web3 from './web3';
import FactoryABI from './abi/factory.json';

const instance = new web3.eth.Contract(
  FactoryABI.abi as AbiItem[],
  '0x0Aa3105d86268465195dB0F672EE47F41cDc9b6c'
);

export default instance;
