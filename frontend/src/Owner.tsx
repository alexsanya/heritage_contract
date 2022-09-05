import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Link } from "react-router-dom";
import { MetamaskContext } from "./ConnectWallet";
import React, { useContext, useState, useEffect } from "react";

import factory from './factory';
import getTestament from './getTestament';
import getERC20 from './getERC20';

interface ContractData {
  address: string;
  name: string;
  numberOfSuccessors: number;
  releasePeriod: number;
  lastPingTime: number;
  balance: number;
}

function Owner() {

  const [allContracts, setAllContracts] = useState<ContractData[]>([]);
  const account = useContext(MetamaskContext);


  const getContracts = async () => {
    const numberOfContracts = await factory.methods.ownerToContractsNumber(account).call();
    const contractAddresses = await Promise.all(
      Array.from({ length: numberOfContracts }).fill(0).map((_, index) =>
        factory.methods.ownerToContracts(account, index).call()
      )
    );

    const getContractDetails: (address: string) => Promise<ContractData> = async address => {
      const testament = getTestament(address);
      const tokenMint = await testament.methods.token().call();
      console.log(`token mint: ${tokenMint}`, tokenMint);
      const token = getERC20(tokenMint);
      const [ name, numberOfSuccessors, releasePeriod, lastPingTime, rawBalance, decimals ] = await Promise.all([
        factory.methods.contractNames(address).call(),
        factory.methods.contractToSuccessorNumber(address).call(),
        testament.methods.maxPeriodOfSilense().call(),
        testament.methods.getCountdownValue().call(),
        testament.methods.totalVolume().call(),
        token.methods.decimals().call()
      ]);

      return { address, name, numberOfSuccessors, releasePeriod, lastPingTime, balance: rawBalance / decimals };
    }

    const contractDetails = await Promise.all(
      contractAddresses.map(address =>
        getContractDetails(address)
      )
    );

    return contractDetails;
  }

  useEffect(() => {
    getContracts().then(contracts => setAllContracts(contracts));
  }, []);

  const getDaysSinceLastPing = (lastPing: number): number => {
    return Math.round((Date.now() - lastPing * 1e3) / (24*3600*1e3));
  }


  const ExistingContracts: React.FC<{ contracts: ContractData[] }> = ({ contracts }) => {
    return (
      <>
        {contracts.map(contract => (
          <Grid item xs={12}>
            <Card sx={{ minWidth: 275 }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  { contract.name }
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  address: { contract.address }
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  successors: { contract.numberOfSuccessors }
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  days until release: { contract.releasePeriod- getDaysSinceLastPing(contract.lastPingTime)}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  balance: { contract.balance }
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Edit</Button>
                <Button size="small">Reset timer</Button>
              </CardActions>
            </Card>
          </Grid>
        ))} 
      </>
    );
  }

  return (
    <Grid
      container
      rowSpacing={1}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '100vh' }}
    >
      <ExistingContracts contracts={allContracts}/>
      <Grid item xs={12}>
          <Link to="/newContract"><Button variant="outlined">Create new testament</Button></Link>
      </Grid>
    </Grid>
  );

}

export default Owner;
