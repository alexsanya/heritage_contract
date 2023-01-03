import React, { useState, useEffect, createContext } from 'react';
import MainTemplate from './main-template';

type Props = { children: React.ReactNode };

export const MetamaskContext = createContext<{
  account: any,
  awaitingConfirmation: boolean,
  withLoader: (action: () => Promise<void>) => Promise<void>
}>({
  account: null,
  awaitingConfirmation: false,
  withLoader: async (action: () => Promise<void>) => {}
});

export const ConnectWallet: React.FC<Props> = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  useEffect(() => { 
    const wrapper = async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
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

  const withLoader = async (action: () => Promise<void>) => {
    setAwaitingConfirmation(true);
    await action();
    setAwaitingConfirmation(false);
  }

  return account ? (
    <MetamaskContext.Provider value={{account, awaitingConfirmation, withLoader}}>
      { children }
    </MetamaskContext.Provider>
  ) : (
    <MainTemplate>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="font-xl font-medium">
          Connect your Metamask wallet
        </h1>
        <div className="flex flex-col sm:flex-row justify-center my-4">
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
