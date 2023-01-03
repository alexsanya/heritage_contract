import { useNavigate } from "react-router-dom";

import factory from './factory';
import BackButton from './backButton';
import { MetamaskContext } from './ConnectWallet';
import {maxPriorityFeePerGas, SECONDS_IN_DAY, IDefaultOption, defaultTokens, defaultPeriods} from  './config';

import React, { useState, useContext } from 'react';


const OptionsSelector: React.FC<{ label: string, items: IDefaultOption[], onChange: (value: string) => void }> = ({ label, items, onChange }) =>  {
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
  const OptionControl: React.FC<{ item: IDefaultOption }> = ({ item }) => {
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
  const [tokenOptions, setTokenOptions]  = useState<IDefaultOption[]>([
    {...defaultTokens[0], active: true}, ...defaultTokens.splice(1)
  ]);

  const [periodOptions, setPeriodOptions] = useState<IDefaultOption[]>([
    {...defaultPeriods[0], active: true}, ...defaultPeriods.splice(1)
  ]);
  const [contractName, setContractName] = useState('');

  const navigate = useNavigate();

  const { account, withLoader } = useContext(MetamaskContext);

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
      period: parseInt(period)*SECONDS_IN_DAY
    });
    await withLoader(() => factory.methods.create(contractName, address, parseInt(period)*SECONDS_IN_DAY).send({
      from: account,
      maxPriorityFeePerGas
    }));
    navigate('/owner');
  }

  const setActiveToken = (address: string) => {
    setTokenOptions(tokenOptions.map(option => ({...option, active: option.value === address})));
  }

  const setActivePeriod = (period: string) => {
    setPeriodOptions(periodOptions.map(option => ({...option, active: option.value === period})));
  }

  return (<>
      <BackButton />
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
