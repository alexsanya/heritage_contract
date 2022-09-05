import React, { useState, useEffect, createContext } from 'react';

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
    <button onClick={connect}>Connect metamask</button>
  )

}

export default ConnectWallet;
