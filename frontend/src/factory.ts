import { AbiItem } from 'web3-utils';

import web3 from './web3';
import FactoryABI from './abi/factory.json';

const instance = new web3.eth.Contract(
  FactoryABI.abi as AbiItem[],
  '0x83D48E55Eae010cAaBC972182B7ee2e6Dd6e404D'
);

export default instance;
