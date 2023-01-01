const ContractAddress: React.FC<{address: string}> = ({ address }) => {
    return (<>
      <div className="flex flex-row">
        <div data-tooltip-target={`tooltip-address-${address}`} data-tooltip-placement="top" className="rounded-lg bg-yellow-100 text-ellipsis my-1 px-2 overflow-hidden max-w-[15ch]">{address}</div>
        <img className="inline w-6 cursor-pointer" src="/copy.svg" />
        <img className="inline w-6 cursor-pointer" src="/link.svg" />
        </div>
        <div id={`tooltip-address-${address}`} role="tooltip" className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
{address}
      </div>
    </>);
}

export default ContractAddress;
