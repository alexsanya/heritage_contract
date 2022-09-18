import { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as _ from 'lodash';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import web3 from './web3';
import BN from 'bn.js';
import { MetamaskContext } from './ConnectWallet';
import { SuccessorsList, SuccessorConstraints } from './SuccessorsList';

import getTestament from './getTestament';
import factory from './factory';
import getERC20 from './getERC20';


function EditContract() {
  const account = useContext(MetamaskContext);
  const { address } = useParams();
  const [amount, setAmount] = useState('0');

  const [testament, setTestament] = useState<any>();
  const [token, setToken] = useState<any>();
  const [decimals, setDecimals] =  useState(0);
  const [contractName, setContractName] = useState('');
  const [succesorAddress, setSuccesorAddress] = useState('');
  const [successorName, setSuccessorName] = useState('');
  const [showAddressFoundLabel, setShowAddressFoundLabel] = useState(false);
  const [showNotFoundLabel, setShowNotFoundLabel] = useState(false);
  const [successors, setSuccessors] = useState<{ [name: string]: SuccessorConstraints }>({});

   // 'Alex': {
   //   limit: 1e10,
   //   share: 100
   // },
   // 'Mike': {
   //   limit: 5000,
   //   share: 0
   // },
   // 'Tom': {
   //   limit: 3000,
   //   share: 0
   // }



  useEffect(() => {
    (async () => {
      if (!address) {
        return;
      }
      const testament = getTestament(address);
      const contractName = await factory.methods.contractNames(address).call();
      const tokenMint = await testament.methods.token().call();
      const token = getERC20(tokenMint);
      const decimals = await token.methods.decimals().call();

      setTestament(testament);
      setToken(token);
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
            limit: successor.maxPerMonth,
            share: successor.share,
            wallet: successor.wallet
          }
        }
      }
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
      }
    }
    console.log(name, share, limit);
    console.log(updatedValues);
    setSuccessors(updatedValues);
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
      maxPerMonth: successors[name].limit.toString()
    }));
    console.log(successorsData);
    await testament.methods.setSuccessors(successorsData).send({
      from: account
    });
  }

  return (
    <>
      <h1>Editing contract {contractName}</h1>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SuccessorsList
            successors={successors}
            onChange={updateSuccessors}
          />
        </Grid>
        <Grid item xs={12}>
          <Button onClick={updateShares}>Update shares</Button>
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                id="successor-address"
                label="input address"
                variant="standard"
                value={succesorAddress}
                onChange={onSuccessorAddressChange}
              />
              <Button onClick={checkIfAddressRegistered}>Check</Button>
            </Grid>
            <Grid item xs={12}>
              { showAddressFoundLabel && (<Chip label={succesorAddress} color="success" />) }
              { showNotFoundLabel && (<Chip label="Address is not registered" color="warning" />) }
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="successor-name"
                label="input name"
                variant="standard"
                value={successorName}
                onChange={onSuccessorNameChange}
              />
              <Button disabled={!showAddressFoundLabel || !successorName.length} onClick={addSuccessor}>Add</Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
            <TextField
              id="amount"
              label="amount"
              variant="standard"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              value={amount}
              onChange={onFundsAmountChange}
            />
            <Button onClick={addFunds}>Add funds</Button>
            <Button onClick={withdrawFunds}>Withdraw funds</Button>
        </Grid>
      </Grid>
    </>
  );
}

export default EditContract;
