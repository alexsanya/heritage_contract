import { AbiItem } from 'web3-utils';

import web3 from './web3';
import TestamentABI from './abi/testament.json';

const getTestament = (address: string) => new web3.eth.Contract(
  TestamentABI.abi as AbiItem[],
  address
);

export default getTestament;
