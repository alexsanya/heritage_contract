import WithTooltip from './withTooltip';

const ContractAddress: React.FC<{address: string}> = ({ address }) => {
    return (<>
      <div className="flex flex-row">
        <WithTooltip title={address} Widget={({ anchor }) => (
          <div
            className="rounded-lg bg-yellow-100 text-ellipsis my-1 px-2 overflow-hidden max-w-[15ch] cursor-pointer"
            ref={anchor}
          >
            {address}
          </div>
        )} />

        <WithTooltip title="copy address" Widget={({ anchor }) => (
          <img
            className="inline w-6 cursor-pointer"
            src="/copy.svg"
            ref={anchor}
            onClick={() => { navigator.clipboard.writeText(address); alert(`${address} copied to clipboard`); }}
          />
        )} />
        <WithTooltip title="see in explorer" Widget={({ anchor }) => (
          <img className="inline w-6 cursor-pointer" src="/link.svg" ref={anchor} />
        )} />
      </div>
    </>);
}

export default ContractAddress;
