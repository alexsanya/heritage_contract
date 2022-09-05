import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import factory from './factory';
import { MetamaskContext } from './ConnectWallet';

import React, { useState, useContext } from 'react';

function NewContract() {

  const [contractName, setContractName] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [releasePeriod, setReleasePeriod] = useState('');

  const account = useContext(MetamaskContext);

  console.log(`[NewContract] account: ${account}`);

  const onContractNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContractName(event.target.value);
  }

  const onTokenAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenAddress(event.target.value);
  }

  const onReleasePeriodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReleasePeriod(event.target.value);
  }

  const createContract = async () => {
    const result = await factory.methods.create(contractName, tokenAddress, parseInt(releasePeriod)).send({
      from: account
    });
    console.log(result);
    console.log({ contractName, tokenAddress, releasePeriod });
  }

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="center"
        rowSpacing={1}
      >
        <Grid item xs={12}>
          <h1>New contract form</h1>
        </Grid>
        <Grid item xs={12}>
          <TextField id="contract-name" label="contract name" variant="standard" value={contractName} onChange={onContractNameChange} />
        </Grid>
        <Grid item xs={12}>
          <TextField id="token" label="token mint" variant="standard" value={tokenAddress} onChange={onTokenAddressChange}/>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="release-period"
            label="release period (days)"
            variant="standard"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            value={releasePeriod}
            onChange={onReleasePeriodChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="outlined" onClick={createContract}>Create</Button>
        </Grid>
      </Grid>
    </>
  );
}

export default NewContract;
