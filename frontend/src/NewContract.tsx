import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useNavigate } from "react-router-dom";

import factory from './factory';
import { MetamaskContext } from './ConnectWallet';

import React, { useState, useContext } from 'react';

const SECONDS_IN_HOUR = 24*3600;

interface TokenOption {
  name: string;
  value: string;
  active?: boolean;
  isCustom?: boolean;
}

const OptionsSelector: React.FC<{ label: string, items: TokenOption[], onChange: (value: string) => void }> = ({ label, items, onChange }) =>  {
  const [tokenAddress, setTokenAddress] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [displayCustomInput, setDisplayCustomInput] = useState(false);
  const setActive = (value: string) => {
    console.log('Setting token: ', value);
    setDisplayCustomInput(false);
    onChange(value);
  };
  const onCustomValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomValue(event.target.value);
  };
  const OptionControl: React.FC<{ item: TokenOption }> = ({ item }) => {
    const getClassName = (isActive: boolean) => isActive ?
      "cursor-pointer rounded-full bg-yellow-100 drop-shadow-md mx-2 px-3 py-1 border-2 border-yellow-500" :
      "cursor-pointer rounded-full bg-slate-100 drop-shadow-md mx-2 px-3 py-1"
    return (
      <div className={getClassName(!!item.active)} onClick={() => setActive(item.value)}>{ item.name }</div>
    );
  }
  const addCustomValue = () => {
    
    console.log('Set button click');

    items.forEach(item => {
      item.active = false;
    });
    const customItem = items.find(item => item.isCustom); 
    if (!customItem) {
      items.push({
        name: customValue,
        value: customValue,
        active: true,
        isCustom: true
      });
    } else {
      customItem.active = true;
      customItem.name = customValue;
      customItem.value = customValue;
    }
    setDisplayCustomInput(false);
  }
  return (
    <div className="flex flex-row items-center">
      <div className="w-40">{ label }</div>
      {
        items.map(item => (<OptionControl item={item} />))
      }
      {
        !displayCustomInput && <>
          <div className="rounded-full bg-slate-100 drop-shadow-md mx-2 p-2 cursor-pointer" onClick={() => setDisplayCustomInput(true)}>
            Custom...
          </div>
        </>
      }
      {
        displayCustomInput && <div className="flex flex-row">
          <input
            type="text" 
            className="border border-solid divide-slate-300 p-1 rounded-md" 
            placeholder="enter token address"
            value={customValue}
            onChange={onCustomValueChange} 
          />
          <div className="cursor-pointer rounded-md bg-slate-100 drop-shadow-md mx-1 px-3 py-1" onClick={addCustomValue}>Set</div>
          <div className="cursor-pointer rounded-md bg-slate-100 drop-shadow-md mx-1 px-3 py-1" onClick={() => setDisplayCustomInput(false)}>Cancel</div>
        </div>
      }
    </div>
  );
}

function NewContract() {
  const [periodOptions, setPeriodOptions] = useState([
    {
      name: '100',
      value: '100',
      active: true
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
  ]);

  const [tokenOptions, setTokenOptions] = useState([
    {
      name: 'USDC',
      value: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      active: true
    },
    {
      name: 'USDT',
      value: '0x55d398326f99059ff775485246999027b3197955'
    },
    {
      name: 'BUSD',
      value: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
    },
    {
      name: 'PAXG',
      value: '0x7950865a9140cB519342433146Ed5b40c6F210f7'
    }
  ]);
  const [contractName, setContractName] = useState('');

  const navigate = useNavigate();

  const account = useContext(MetamaskContext);

  console.log(`[NewContract] account: ${account}`);

  const onContractNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContractName(event.target.value);
  }

  const createContract = async () => {
    const { value: address } = tokenOptions.find(item => item.active) || tokenOptions[0];
    const { value: period } = periodOptions.find(item => item.active) || periodOptions[0];
    console.log({
      contractName,
      address,
      period: parseInt(period)*SECONDS_IN_HOUR
    });
    const result = await factory.methods.create(contractName, address, parseInt(period)*SECONDS_IN_HOUR).send({
      from: account
    });
    navigate('/owner');
  }

  const setActiveToken = (address: string) => {
    setTokenOptions(tokenOptions.map(option => ({...option, active: option.value === address})));
  }

  const setActivePeriod = (period: string) => {
    setPeriodOptions(periodOptions.map(option => ({...option, active: option.value === period})));
  }

  return (<>
      <div className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-2 max-w-fit">
        <img src="/back.svg" className="w-10" />
        <div className="text-xl">Back</div>
      </div>
      <div className="flex flex-col h-full mt-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row">
            <div className="w-40">Contract name: </div>
            <input
              type="text" 
              className="border border-solid divide-slate-300 p-1 rounded-md" 
              placeholder="enter contact name"
              value={contractName}
              onChange={onContractNameChange} 
            />
          </div>
          <OptionsSelector label="Select token:" items={tokenOptions} onChange={setActiveToken}/>
          <OptionsSelector label="SelectPeriod:" items={periodOptions} onChange={setActivePeriod}/>
          <div className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-2 max-w-fit">
            <img src="/save.svg" className="w-8" />
            <div className="text-l" onClick={createContract}>Create</div>
          </div>
        </div>
      </div>
  </>);
}

export default NewContract;
