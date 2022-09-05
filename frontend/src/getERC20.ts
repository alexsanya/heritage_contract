import { AbiItem } from 'web3-utils';

import web3 from './web3';
import erc20ABI from './abi/ERC20.json';

const getERC20 = (address: string) => new web3.eth.Contract(
  erc20ABI.abi as AbiItem[],
  address
);

export default getERC20;
