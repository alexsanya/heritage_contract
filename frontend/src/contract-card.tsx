import { useContext } from "react";
import { MetamaskContext } from "./ConnectWallet";
import WithTooltip from './withTooltip';
import getTestament from './getTestament';
import ContractAddress from './contract-address';

export const SECONDS_IN_DAY = 24*3600;

export interface ContractData {
  address: string;
  token: string;
  name: string;
  numberOfSuccessors: number;
  releasePeriod: number;
  daysSinceLastPing: number;
  balance: number;
}

const resetTimer = async (account: any, address: string) => {
  const testament = getTestament(address);

  const result = await testament.methods.resetCountdownTimer().send({
    from: account
  });

  console.log('Reseting timer...');
}


const deleteTestament = async (account: any, address: string) => {
  const testament = getTestament(address);
  
  const result = await testament.methods.kill().send({
    from: account
  });

  console.log('Removing testament...');
} 

export const ContractCard: React.FC<{ contract: ContractData }> = ({ contract }) => {

  const account = useContext(MetamaskContext);


  const persentage = Math.round(100*(contract.releasePeriod- contract.daysSinceLastPing*SECONDS_IN_DAY) / contract.releasePeriod);
  const color =  `hsl(${persentage*1.2}, 100%, 50%)`;

  const chartStyle = {
    "--p": persentage,
    "--b": "10px",
    "--c": color,
    color
  };

  return(
    <div className="flex flex-col rounded-lg m-5 p-4 bg-slate-800 drop-shadow-lg">
        <h1 className="text-center text-2xl text-slate-200 font-medium">{contract.name}</h1>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="rounded-lg bg-slate-100 drop-shadow-lg m-3 p-3 font-mono italic">
            <div className="flex flex-row justify-between">
              <div className="text-left my-2 mr-5 leading-8">
                <div>address</div>
                <div>token</div>
                <div>balance</div>
                <div>successors</div>
                <div>countdown</div>
              </div>
              <div className="text-right leading-8">
                <ContractAddress address={contract.address} />
                <ContractAddress address={contract.token} />
                <div>{ contract.balance }</div>
                <div>{ contract.numberOfSuccessors }</div>
                <div>{ Math.round(contract.releasePeriod / SECONDS_IN_DAY - contract.daysSinceLastPing) } days</div>
              </div>
            </div>
            <div className="flex flex-row items-center justify-between pt-3 px-1">
                <WithTooltip title="reset timer" Widget={({ anchor }) => (
                  <img
                    src="/reset.svg"
                    ref={anchor}
                    className="w-8 cursor-pointer"
                    onClick={() => resetTimer(account, contract.address)}
                  />
                )} />
                <WithTooltip title="edit testament" Widget={({ anchor }) => (
                  <a href={`/edit-contract/${contract.address}`} ref={anchor}>
                    <img src="/edit.svg" className="w-8 cursor-pointer" />
                  </a>
                )} />
                <WithTooltip title="delete testament" Widget={({ anchor }) => (
                  <img
                    src="/delete.svg"
                    className="w-8 cursor-pointer"
                    ref={anchor}
                    onClick={() => deleteTestament(account, contract.address)}
                  />
                )} />
                <div id={`tooltip-btn-reset-${contract.address}`} role="tooltip" className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">Reset timer</div>
                <div id={`tooltip-btn-edit-${contract.address}`} role="tooltip" className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">Edit contract</div>
                <div id={`tooltip-btn-delete-${contract.address}`} role="tooltip" className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">Delete contract</div>
            </div>
          </div>
          <div> 
            <div className="pie" style={chartStyle}>{persentage}%</div>
          </div>
        </div>
      </div>
  );
}
