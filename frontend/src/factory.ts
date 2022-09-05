import { AbiItem } from 'web3-utils';

import web3 from './web3';
import FactoryABI from './abi/factory.json';

const instance = new web3.eth.Contract(
  FactoryABI.abi as AbiItem[],
  '0xB24FdcB89efAB60228c6773B709C2d0F857626Df'
);

export default instance;
