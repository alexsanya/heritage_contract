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


export const ContractCard: React.FC<{ contract: ContractData }> = ({ contract }) => {
  const persentage = Math.round((contract.releasePeriod- contract.daysSinceLastPing*SECONDS_IN_DAY) / contract.releasePeriod);

  const chartStyle = {
    "--p": persentage,
    "--b": "10px",
    "--c": "red",
    color: "red"
  };

  return(
    <div className="flex flex-col rounded-lg m-5 p-4 bg-slate-200 drop-shadow-lg">
        <h1 className="text-center text-2xl text-blue-700 font-medium">{contract.name}</h1>
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
                <div className="flex flex-row">
                  <div data-tooltip-target="tooltip-contract-address" data-tooltip-placement="top" className="rounded-lg bg-yellow-100 text-ellipsis my-1 px-2 overflow-hidden max-w-[15ch]">{contract.address}</div>
                  <img className="inline w-6 cursor-pointer" src="/copy.svg" />
                  <img className="inline w-6 cursor-pointer" src="/link.svg" />
                  </div>
                  <div id="tooltip-contract-address" role="tooltip" className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
      {contract.address}
                </div>
                <div className="flex flex-row">
                  <div data-tooltip-target="tooltip-token-address" data-tooltip-placement="top" className="rounded-lg bg-yellow-100 text-ellipsis px-2 overflow-hidden max-w-[15ch]">{contract.token}</div>
                  <img className="inline w-6 cursor-pointer" src="/copy.svg" />
                  <img className="inline w-6 cursor-pointer" src="/link.svg" />
                  </div>
                  <div id="tooltip-token-address" role="tooltip" className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
      {contract.token}
                </div>
                <div>{ contract.balance }</div>
                <div>{ contract.numberOfSuccessors }</div>
                <div>{ Math.round(contract.releasePeriod / SECONDS_IN_DAY - contract.daysSinceLastPing) } days</div>
              </div>
            </div>
            <div className="flex flex-row items-center justify-between pt-3 px-1">
                <img src="/reset.svg" className="w-8 cursor-pointer" data-tooltip-target="tooltip-btn-reset" data-tooltip-placement="top" />
                <img src="/edit.svg" className="w-8 cursor-pointer" data-tooltip-target="tooltip-btn-edit" data-tooltip-placement="top" />
                <img src="/delete.svg" className="w-8 cursor-pointer" data-tooltip-target="tooltip-btn-delete" data-tooltip-placement="top" />
                <div id="tooltip-btn-reset" role="tooltip" className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">Reset timer</div>
                <div id="tooltip-btn-edit" role="tooltip" className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">Edit contract</div>
                <div id="tooltip-btn-delete" role="tooltip" className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">Delete contract</div>
            </div>
          </div>
          <div> 
            <div className="pie" style={chartStyle}>{persentage}%</div>
          </div>
        </div>
      </div>
  );
}
