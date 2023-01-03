export const maxPriorityFeePerGas = 40000000000;
export const SECONDS_IN_DAY = 24*3600;
export const chainExplorerUrl = 'https://polygonscan.com/address';

export interface IDefaultOption {
  name: string;
  value: string;
  active?: boolean;
  isCustom?: boolean;
}

export const chainId = '0x89'; // polygon mainnet
export const factoryAddress = '0x4b2fFA096f28674B8E4f73D6F94c7b8AFD39b494';
  // '0xa0408524444aB165296D6B0D8BC21c0eD693ee51' - ganache

export const defaultTokens = [
  {
    name: 'USDC',
    value: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  },
  {
    name: 'USDT',
    value: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
  },
  {
    name: 'BUSD',
    value: '0x9C9e5fD8bbc25984B178FdCE6117Defa39d2db39'
  },
  {
    name: 'PAXG',
    value: '0x553d3D295e0f695B9228246232eDF400ed3560B5'
  }
]

export const defaultPeriods = [
  {
    name: '100',
    value: '100'
  },
  {
    name: '90',
    value: '90'
  },
  {
    name: '60',
    value: '60'
  },
  {
    name: '30',
    value: '30'
  }
]
