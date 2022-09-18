import React, { useState, useContext, useEffect } from 'react';
import * as _ from 'lodash';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import web3 from './web3';
import BN from 'bn.js';
import factory from './factory';
import getTestament from './getTestament';
import { MetamaskContext } from './ConnectWallet';

interface ContractData {
  name: string;
  volume: number;
  isValid: boolean;
  share?: number;
  dateOfLastClame?: number;
  totalClaimed?: number;
}

function Successor() {
  const account = useContext(MetamaskContext);

  const [testamentAddress, setTestamentAddress] = useState('');
  const [allContracts, setAllContracts] = useState<ContractData[]>([]);

  const onTestamentAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTestamentAddress(event.target.value);
  }

  const registerInTestament = async () => {
    const testament = getTestament(testamentAddress);

    await testament.methods.registerSuccessorApplicant().send({
      from: account
    });
  }

  const getContracts = async () => {
    const numberOfContracts = await factory.methods.successorToContractsNumber(account).call();
    const contractsList = await Promise.all(
      Array.from({ length: numberOfContracts })
        .fill(0)
        .map((_, number) => factory.methods.successorToContracts(account, number).call())
    );

    const getKey = async (address: string, wallet: string) => {
      const successorsListVersion = await getTestament(address).methods.successorsListVersion().call();
      const key = web3.utils.soliditySha3(
          {t: 'uint32', v: new BN(successorsListVersion)},
          {t: 'address', v: wallet},
      );      
      return key;
    }

    const contracts = await Promise.all(
      _.uniq(contractsList).map(async (address) => ({
          name: await factory.methods.contractNames(address).call(),
          volume: await getTestament(address).methods.totalVolume().call(),
          isValid: await getTestament(address).methods
            .successors(
              await getKey(address, account || '')
            ).call()
              .then((data: any) => {
                return new BN(data.wallet).eq(new BN(account || ''));
              })
        })
      )
    );

    return contracts.filter(contract => contract.isValid);
  }

  useEffect(() => {
    getContracts().then(contracts => setAllContracts(contracts));
  }, []);


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
        {allContracts.map(contract => (
          <Grid item xs={12}>
            <Card sx={{ minWidth: 275 }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  { contract.name }
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  volume: { contract.volume }
                </Typography>

              </CardContent>
              <CardActions>
                <Button size="small">Claim share</Button>
              </CardActions>
            </Card>
          </Grid>
        ))} 
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
