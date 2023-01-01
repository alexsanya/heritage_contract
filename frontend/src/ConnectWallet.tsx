import React, { useState, useEffect, createContext } from 'react';
import MainTemplate from './main-template';

type Props = { children: React.ReactNode };

export const MetamaskContext = createContext(null);

export const ConnectWallet: React.FC<Props> = ({ children }) => {
  const [account, setAccount] = useState(null);

  useEffect(() => { 
    const wrapper = async () => {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    }

    wrapper();
  });

  const connect = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
  }

  console.log(`[ConnectWallet] Account is ${account}`);

  return account ? (
    <MetamaskContext.Provider value={account}>
      { children }
    </MetamaskContext.Provider>
  ) : (
    <MainTemplate>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-col sm:flex-row justify-center">
          <div
            className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md bg-slate-800 p-2 max-w-fit"
            onClick={connect}
          >
            <img src="/metamask-white.png" className="w-10" />
            <div className="text-xl font-medium text-white">Connect metamask</div>
          </div>
        </div>
      </div>
    </MainTemplate>
  )

}

export default ConnectWallet;
