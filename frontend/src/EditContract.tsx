import { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as _ from 'lodash';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import web3 from './web3';
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
  const [successors, setSuccessors] = useState<{ [name: string]: SuccessorConstraints }>({
    'Alex': {
      limit: 1e10,
      share: 100
    },
    'Mike': {
      limit: 5000,
      share: 0
    },
    'Tom': {
      limit: 3000,
      share: 0
    }
  });


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

  const onSuccessorAddressChange = async () => {
  }

  const onSuccessorNameChange = async () => {
  }

  const updateSuccessors = (name: string, share: number, limit: number) => {
    const successorsNames =  Object.keys(successors);
    const absorber = successorsNames[successorsNames.length - 1];
    const preUpdatedValues = { 
      ...successors, 
      [name]: {share: Math.min(share, successors[name].share+successors[absorber].share), limit},
    }
    const updatedValues = {
      ...preUpdatedValues,
      [absorber]: {
        share: 100 - successorsNames.filter(name => name != absorber).reduce((acc, name) => acc+preUpdatedValues[name].share, 0),
        limit: successors[absorber].limit
      }
    }
    console.log(name, share, limit);
    console.log(updatedValues);
    setSuccessors(updatedValues);
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
          <Button>Update shares</Button>
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
              <Button>Check</Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="successor-name"
                label="input name"
                variant="standard"
                value={successorName}
                onChange={onSuccessorNameChange}
              />
              <Button>Add</Button>
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
