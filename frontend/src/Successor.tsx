import React, { useState, useContext, useEffect } from 'react';
import * as _ from 'lodash';

import web3 from './web3';
import BN from 'bn.js';
import factory from './factory';
import getERC20 from './getERC20';
import ContractAddress from './contract-address';
import getTestament from './getTestament';
import getDispenser from './getDispenser';
import { MetamaskContext } from './ConnectWallet';
import { ValueEdit } from './ValueEdit';
import { SECONDS_IN_DAY } from './contract-card';

interface ContractData {
  name: string;
  address: string;
  token: string;
  decimals: number;
  volume: number;
  isValid: boolean;
  share?: number;
  dateOfLastClaim: number;
  totalClaimed: number;
  isReleaseAvailible: boolean;
}


function Successor() {
  const account = useContext(MetamaskContext);
  const [allContracts, setAllContracts] = useState<ContractData[]>([]);

  const registerInTestament = async (testamentAddress: string) => {
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

    const getDecimals = async (address: string) => {
      const testament = getTestament(address);
      const tokenMint = await testament.methods.token().call();
      const token = getERC20(tokenMint);
      const decimals = await token.methods.decimals().call();
      return decimals;
    }


    const getContract = async (address: string) => {
      const testament = getTestament(address);
      const successor = await testament.methods.successors(await getKey(address, account || '')).call();
      const dispenser = getDispenser(successor.dispenser);
      console.log(`Dispenser for testament ${address} is ${successor.dispenser}`);
      const decimals = await getDecimals(address);

      return {
          address,
          token: await testament.methods.token().call(),
          decimals,
          name: await factory.methods.contractNames(address).call(),
          volume: await testament.methods.totalVolume().call() / 10**decimals,
          isReleaseAvailible: await testament.methods.isFundsReleaseAvailible().call(),
          dateOfLastClaim: await dispenser.methods.lastWithdrawalTime().call(),
          totalClaimed: await dispenser.methods.totalWithdrawed().call(),
          isValid: await testament.methods
            .successors(
              await getKey(address, account || '')
            ).call()
              .then((data: any) => {
                return new BN(data.wallet).eq(new BN(account || ''));
              })
      };
    } 

    const contracts = await Promise.all(
      _.uniq(contractsList).map(async (address) => getContract(address))
        .map(promise => promise.catch(() => false))
    )

    return contracts.filter(contract => contract && (contract as ContractData).isValid) as ContractData[];
  }

  const claimShare = async (address: string) => {
    const testament = getTestament(address);

    await testament.methods.claimHeritage().send({
      from: account
    });
  }

  useEffect(() => {
    getContracts().then(contracts => setAllContracts(contracts));

  }, []);

  const ReleaseNotAvailible = () => (
    <div className="text-red-700 font-semibold">You cannot claim funds yet</div>
  );

  const ClaimFunds: React.FC<{contract: ContractData}> = ({ contract }) => {
    return (
      <div className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-2 max-w-fit">
        <img src="/claim.svg" className="w-10" />
        <div className="text-xl" onClick={() => claimShare(contract.address)}>Claim</div>
      </div>
    );
  }

  const getDaysSinceWithdraw = async (lastClaimTimestamp: number) => {
    
    const { timestamp } =  await web3.eth.getBlock("latest") as { timestamp: number };

    return Math.trunc((timestamp - lastClaimTimestamp) / SECONDS_IN_DAY);
  }

  const ActionsPanel: React.FC<{contract: ContractData}> = ({ contract }) => {
    const [daysSinceWithdraw, setDaysSinceWithdraw] = useState(0);

    useEffect(() => {
      (async () => {
        setDaysSinceWithdraw(await getDaysSinceWithdraw(contract.dateOfLastClaim));
      })();
    }, []);

    return (<div className="m-auto">
      { (contract.isReleaseAvailible && (daysSinceWithdraw >= 30)) ?
        <ClaimFunds contract={contract} /> :
        <ReleaseNotAvailible />
      }
    </div>);
  }


  const ContractCard: React.FC<{contract: ContractData}> = ({contract}) => {
    return (
      <div className="flex flex-col rounded-lg m-5 p-4 bg-slate-200 drop-shadow-lg">
          <h1 className="text-center text-2xl text-blue-700 font-medium">{contract.name}</h1>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="rounded-lg bg-slate-100 drop-shadow-lg m-3 p-3 font-mono italic">
              <div className="flex flex-row justify-between">
                <div className="text-left my-2 mr-5 leading-8">
                  <div>address</div>
                  <div>token</div>
                  <div>date of last claim</div>
                  <div>total claimed</div>
                </div>
                <div className="text-right leading-8">
                  <ContractAddress address={contract.address} />
                  <ContractAddress address={contract.token} />
                  <div>
                    { contract.dateOfLastClaim > 0 ? new Date(contract.dateOfLastClaim*1000).toLocaleDateString("en-US") : '-' }
                  </div>
                  <div>{ contract.totalClaimed > 0 ? contract.totalClaimed / 10**contract.decimals : '-' }</div>
                </div>
              </div>
            </div>
          </div>
          <ActionsPanel contract={contract}/>
      </div>
    );
  }

  const RegisterButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
      <div
        className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-2 max-w-fit"
        onClick={onClick}
      >
        <img src="/plus.svg" className="w-10" />
        <div className="text-xl">Register new</div>
      </div>
    );
  }

  const RegisteredContracts: React.FC<{ contracts: ContractData[] }> = ({ contracts }) => {
    return (
      <div className="flex flex-col items-center justify-center h-full font-sans">
        {contracts.map(contract => (
          <ContractCard contract={contract} />
        ))} 
        <ValueEdit
          initial={0}
          commit="Register"
          cancel="Cancel"
          placeholder="Contract address"
          onCommit={address => registerInTestament(address as string)}
          Trigger={RegisterButton}
        />
      </div>
    );
  }



  return (
    <div className="mb-4">
      <div className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-2 max-w-fit">
        <img src="/back.svg" className="w-10" />
        <div className="text-xl">Back</div>
      </div>
      <RegisteredContracts contracts={allContracts}/>
    </div>
  );


}

export default Successor;
