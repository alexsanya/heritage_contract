import { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as _ from 'lodash';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import web3 from './web3';
import BN from 'bn.js';
import { MetamaskContext } from './ConnectWallet';
import { SuccessorsList, SuccessorConstraints } from './SuccessorsList';

import getTestament from './getTestament';
import factory from './factory';
import getERC20 from './getERC20';
import { SECONDS_IN_DAY } from './contract-card';


function EditContract() {
  const account = useContext(MetamaskContext);
  const { address } = useParams();
  const [amount, setAmount] = useState('0');

  const [testament, setTestament] = useState<any>();
  const [token, setToken] = useState<any>();
  const [lockingPeriod, setLockingPeriod] = useState(0);
  const [decimals, setDecimals] =  useState(0);
  const [contractName, setContractName] = useState('');
  const [contractTotalValue, setContractTotalValue] = useState(0);
  const [succesorAddress, setSuccesorAddress] = useState('');
  const [successorName, setSuccessorName] = useState('');
  const [showAddressFoundLabel, setShowAddressFoundLabel] = useState(false);
  const [showNotFoundLabel, setShowNotFoundLabel] = useState(false);
  const [successors, setSuccessors] = useState<{ [name: string]: SuccessorConstraints }>({});

  useEffect(() => {
    (async () => {
      if (!address) {
        return;
      }
      const testament = getTestament(address);
      const contractName = await factory.methods.contractNames(address).call();
      const tokenMint = await testament.methods.token().call();
      const releasePeriod = await testament.methods.maxPeriodOfSilense().call({from: account });
      const token = getERC20(tokenMint);
      const decimals = await token.methods.decimals().call();
      const totalValue = await token.methods.balanceOf(address).call();

      setToken(token);
      setTestament(testament);
      setContractTotalValue(new BN(totalValue).div(new BN(10**decimals)).toNumber());
      setLockingPeriod(releasePeriod /SECONDS_IN_DAY);
      setDecimals(decimals);
      setContractName(contractName);

      const successorsListVersion = await testament.methods.successorsListVersion().call();
      const successorsNumber = await testament.methods.numberOfSuccessors().call();
      console.log(`Successors number: ${successorsNumber}`);
      console.log(`successorsListVersion: ${successorsListVersion}`);
      let successorsData = {}
      for (let i=0; i < successorsNumber; i++) {
        const wallet = await testament.methods.listOfSuccessors(i).call();
        console.log(`Wallet: ${wallet}`);
        const key = web3.utils.soliditySha3(
          {t: 'uint32', v: new BN(successorsListVersion)},
          {t: 'address', v: wallet},
        );      
        console.log('Key:', key);
        const successor = await testament.methods.successors(key).call();
        console.log(successor);
        successorsData = {
          ...successorsData,
          [successor.name]: {
            limit: new BN(successor.maxPerMonth).div(new BN(10**decimals)).toNumber(),
            share: +successor.share,
            wallet: successor.wallet
          }
        }
      }
      console.log(successorsData);
      setSuccessors(successorsData);
      

      console.log({ testament, tokenMint, token, decimals });
    })();
  }, []);

  
  const onFundsAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  }

  const addFunds = async () => {
    console.log('token', token);

    const value = parseFloat(amount) * 10**decimals;
    await token.methods.approve(address, value).send({ from: account });
    await testament.methods.depositTokens(value).send({ from: account });
  }

  const withdrawFunds = async () => {
    const value = parseFloat(amount) * 10**decimals;
    await testament.methods.withdrawTokens(value).send({ from: account });
  }

  const onSuccessorAddressChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowAddressFoundLabel(false);
    setShowNotFoundLabel(false);
    setSuccesorAddress(event.target.value);
  }

  const onSuccessorNameChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSuccessorName(event.target.value);
  }

  const updateSuccessors = (name: string, share: number, limit: number) => {
  console.log(`Limit is ${limit}`);
    const successorsNames =  Object.keys(successors);
    const absorber = successorsNames[successorsNames.length - 1];
    console.log(`Absorber: ${absorber}`);
    const preUpdatedValues = { 
      ...successors, 
      [name]: {
        ...successors[name],
        share: Math.min(share, successors[name].share+successors[absorber].share)
      },
    }
    const updatedValues = {
      ...preUpdatedValues,
      [absorber]: {
        ...successors[absorber],
        share: 100 - successorsNames.filter(name => name != absorber).reduce((acc, name) => acc+preUpdatedValues[name].share, 0),
      },
    }
    console.log(name, share, limit);
    console.log(updatedValues);
    setSuccessors({
      ...updatedValues,
      [name]: {
        ...updatedValues[name],
        limit
      }
    });
  }

  const checkIfAddressRegistered = async () => {
    setShowAddressFoundLabel(false);
    setShowNotFoundLabel(false);
    const isRegistered = await testament.methods.potentialSuccessors(succesorAddress).call();
    if (isRegistered) {
      setShowAddressFoundLabel(true);
    } else {
      setShowNotFoundLabel(true);
    }
  }
  
  const addSuccessor = async () => {
    const share = (Object.keys(successors).length) > 0 ? 0 : 100;
    setSuccessors({
      ...successors,
      [successorName]: {
        wallet: succesorAddress,
        limit: 1e10,
        share    
      }
    });
    setSuccessorName('');
    setSuccesorAddress('');
    setShowAddressFoundLabel(false);
    setShowNotFoundLabel(false);
  }

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  const updateShares = async () => {
    const successorsData = Object.keys(successors).map(name => ({
      name,
      share: successors[name].share.toString(),
      wallet: successors[name].wallet,
      dispenser: ZERO_ADDRESS,
      fundsBeenReleased: false,
      maxPerMonth: new BN(successors[name].limit).mul(new BN(10**decimals)).toString()
    }));
    console.log(successorsData);
    await testament.methods.setSuccessors(successorsData).send({
      from: account
    });
  }
  
  const onRemove = (nameToRemove: string) => {
    const share = successors[nameToRemove].share;
    
    const names = Object.keys(successors).filter(name => name !== nameToRemove);
    const absorber = _.last(names);

    setSuccessors(names.reduce((acc, name) => ({
      ...acc,
      [name]: name === absorber ? { ...successors[name], share: successors[name].share + share } : successors[name]
    }), {}));
  }

  return (
    <>
      <div className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-2 max-w-fit">
        <img src="/back.svg" className="w-10" />
        <div className="text-xl">Back</div>
      </div>
      <div className="flex flex-col h-full font-sans text-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="rounded-lg m-3 p-3">
              <div className="flex flex-row justify-between items-center">
                <div className="text-left mr-5 flex flex-col gap-y-5 italic">
                  <div>Volume</div>
                  <div>Locking period</div>
                </div>
                <div className="text-right flex flex-col gap-y-5">
                  <div>{ contractTotalValue }</div>
                  <div>{ lockingPeriod } days</div>
                </div>
                <div className="flex flex-col">
                  <div className="flex flex-row px-1 items-center">
                    <img src="/topup.png" className="w-10 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-1 m-1" />
                    <img src="/withdraw.png" className="w-10 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-1 m-1" />
                  </div>
                  <img src="/edit.svg" className="w-10 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-1 m-1" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="basis-1/2">

              <div className="flex flex-col gap-y-4">
                <SuccessorsList
                  successors={successors}
                  onChange={updateSuccessors}
                  onRemove={onRemove}
                />
              </div>

              <div className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-2 max-w-fit">
                <img src="/person.svg" className="w-4" />
                <div className="text-base">add...</div>
              </div>

              <div className="grid justify-items-center">
                <div className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-2 max-w-fit">
                  <img src="/pen.svg" className="w-10" />
                  <div className="text-xl">Sign</div>
                </div>
              </div>
            </div>
            <div className="basis-1/2 grid justify-items-center">
            </div>
          </div>
      </div>
    </>
  );
}

export default EditContract;
