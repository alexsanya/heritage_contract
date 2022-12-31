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
import { ValueEdit } from './ValueEdit';
import SharesChart from './SharesChart';
import NewHeirWidget from './NewHeirWidget';
import { SuccessorsList, SuccessorConstraints } from './SuccessorsList';

import getTestament from './getTestament';
import factory from './factory';
import getERC20 from './getERC20';
import { SECONDS_IN_DAY } from './contract-card';


function EditContract() {
  const account = useContext(MetamaskContext);
  const { address } = useParams();

  const [testament, setTestament] = useState<any>();
  const [token, setToken] = useState<any>();
  const [lockingPeriod, setLockingPeriod] = useState(0);
  const [decimals, setDecimals] =  useState(0);
  const [contractName, setContractName] = useState('');
  const [contractTotalValue, setContractTotalValue] = useState(0);
  const [showAddressFoundLabel, setShowAddressFoundLabel] = useState(false);
  const [showNotFoundLabel, setShowNotFoundLabel] = useState(false);
  const [newHeirDialog, setNewHeirDialog] = useState(false);
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

  const addFunds = async (amount: number) => {
    console.log('token', token);

    const value = amount * 10**decimals;
    await token.methods.approve(address, value).send({ from: account });
    await testament.methods.depositTokens(value).send({ from: account });
  }

  const updateMaxPeriodOfSilence = async (period: number) => {
    await testament.methods.updateMaxPeriodOfSilence(period * SECONDS_IN_DAY).send({ from: account });
  }

  const withdrawFunds = async (amount: number) => {
    const value = amount * 10**decimals;
    await testament.methods.withdrawTokens(value).send({ from: account });
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

  
  const addSuccessor = async (name: string, address: string) => {
    const share = (Object.keys(successors).length) > 0 ? 0 : 100;
    setSuccessors({
      ...successors,
      [name]: {
        wallet: address,
        limit: 1e10,
        share    
      }
    });
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

  const TopupButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
      <img
        src="/topup.png"
        className="w-10 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-1 m-1"
        onClick={onClick}
      />
    );
  }

  const WithdrawButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
      <img
        src="/withdraw.png"
        className="w-10 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-1 m-1"
        onClick={onClick}
      />
    );
  }

  const EditButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
      <img
        src="/edit.svg"
        className="w-10 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-1 m-1"
        onClick={onClick}
      />
    );
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
                    <ValueEdit
                      initial={0}
                      commit="Topup"
                      cancel="Cancel"
                      placeholder="Amount"
                      onCommit={value => addFunds(+value)}
                      Trigger={TopupButton}
                    />
                    <ValueEdit
                      initial={0}
                      commit="Withdraw"
                      cancel="Cancel"
                      placeholder="Amount"
                      onCommit={value => withdrawFunds(+value)}
                      Trigger={WithdrawButton}
                    />
                  </div>
                  <ValueEdit
                    initial={ lockingPeriod }
                    placeholder="Days"
                    commit="Change" 
                    cancel="Cancel"
                    onCommit={value => updateMaxPeriodOfSilence(+value)}
                    Trigger={EditButton}
                  />

                </div>
                <div className="flex flex-col">
                </div>

              </div>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <div className="basis-2/3 p-4">

              <div className="flex flex-col gap-y-4">
                <SuccessorsList
                  successors={successors}
                  onChange={updateSuccessors}
                  onRemove={onRemove}
                />
              </div>

              <NewHeirWidget onAdd={addSuccessor}/>

              <div className="grid justify-items-center mt-4">
                <div className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-2 max-w-fit">
                  <img src="/pen.svg" className="w-10" />
                  <div className="text-xl" onClick={updateShares}>Sign</div>
                </div>
              </div>
            </div>
            <div className="basis-1/3 grid justify-items-center">
              <SharesChart successors={successors} />
            </div>
          </div>
      </div>
    </>
  );
}

export default EditContract;
