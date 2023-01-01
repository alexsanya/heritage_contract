import { AbiItem } from 'web3-utils';

import web3 from './web3';
import DispenserABI from './abi/dispenser.json';

const getDispenser = (address: string) => new web3.eth.Contract(
  DispenserABI.abi as AbiItem[],
  address
);

export default getDispenser;
