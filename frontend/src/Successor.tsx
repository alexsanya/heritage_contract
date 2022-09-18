import React, { useState, useContext } from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import getTestament from './getTestament';
import { MetamaskContext } from './ConnectWallet';

function Successor() {
  const account = useContext(MetamaskContext);

  const [testamentAddress, setTestamentAddress] = useState('');

  const onTestamentAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTestamentAddress(event.target.value);
  }

  const registerInTestament = async () => {
    const testament = getTestament(testamentAddress);

    await testament.methods.registerSuccessorApplicant().send({
      from: account
    });
  }

  return (
    <>
      <h1>Successor's interface</h1>
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="center"
        rowSpacing={1}
      >
        <Grid item xs={12}>
          <h1>Register in testament</h1>
        </Grid>
        <Grid item xs={12}>
          <TextField id="testament-address" label="contract address" variant="standard" value={testamentAddress} onChange={onTestamentAddressChange} />
        </Grid>
        <Grid item xs={12}>
          <Button variant="outlined" onClick={registerInTestament}>Apply</Button>
        </Grid>
      </Grid>
    </>
  );
}

export default Successor;
