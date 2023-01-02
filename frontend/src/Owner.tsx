import web3 from './web3';
import { MetamaskContext } from "./ConnectWallet";
import React, { useContext, useState, useEffect } from "react";

import factory from './factory';
import getTestament from './getTestament';
import getERC20 from './getERC20';
import {ContractData, ContractCard, SECONDS_IN_DAY} from './contract-card';
import BackButton from './backButton';

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

    const getDaysSinceLastPing = async (lastPing: number): Promise<number> => {
      const { timestamp } =  await web3.eth.getBlock("latest") as { timestamp: number };

      return Math.round((timestamp - lastPing) / SECONDS_IN_DAY);
    }

    const getContractDetails: (address: string) => Promise<ContractData> = async address => {
      const testament = getTestament(address);
      const tokenMint = await testament.methods.token().call();
      console.log(`token mint: ${tokenMint}`);
      const token = getERC20(tokenMint);
      const [ name, numberOfSuccessors, releasePeriod, lastPingTime, rawBalance, decimals ] = await Promise.all([
        factory.methods.contractNames(address).call(),
        testament.methods.numberOfSuccessors().call(),
        testament.methods.maxPeriodOfSilense().call(),
        testament.methods.getCountdownValue().call({from: account }),
        testament.methods.totalVolume().call(),
        token.methods.decimals().call()
      ].map((p, index: number) => p.catch((err: any) => console.error(`Error at index ${index}`, err))));

      return { 
        address,
        token: tokenMint,
        name,
        numberOfSuccessors,
        releasePeriod,
        daysSinceLastPing: await getDaysSinceLastPing(lastPingTime),
        balance: rawBalance / 10**decimals 
      };
    }

    const contractDetails = await Promise.all(
      contractAddresses.map(address =>
        getContractDetails(address).catch(() => false)
      )
    ).then(list => list.filter(details => details) as ContractData[]);

    return contractDetails;
  }

  useEffect(() => {
    getContracts().then(contracts => setAllContracts(contracts));
  }, []);




  const ExistingContracts: React.FC<{ contracts: ContractData[] }> = ({ contracts }) => {
    return (
      <div className="flex flex-col items-center justify-center h-full font-sans">
        {contracts.map(contract => (
          <ContractCard contract={contract} />
        ))} 
        <a
          href="/newContract"
          className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md p-2 max-w-fit text-slate-200 bg-slate-800">
          <img src="/newContract-white.png" className="w-10" />
          <div className="text-xl">Create new</div>
        </a>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <BackButton />
      <ExistingContracts contracts={allContracts}/>
    </div>
  );

}

export default Owner;
