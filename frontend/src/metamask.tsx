import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';

import { chainId } from './config';
import { ConnectWallet } from './ConnectWallet';
import NoMetamaskPage from './NoMetamaskPage';

type Props = { children: React.ReactNode };

export const Metamask: React.FC<Props> = ({ children }) => {

  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    detectEthereumProvider().then(async (ethProvider: any) => {
      console.log('Provider: ', ethProvider);
      if (ethProvider) {
        setProvider(ethProvider);
      }

    })
  }, []);

  return provider ? (<ConnectWallet>{children}</ConnectWallet>) : (<NoMetamaskPage />);
}
