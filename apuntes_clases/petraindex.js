import React from 'react';
import ReactDOM from 'react-dom/client';
import App3 from './App3';
import {AptosWalletAdapterProvider, Network} from '@aptos-labs/wallet-adapter-react'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AptosWalletAdapterProvider
            autoConnect={true}
            optInWallets={["Petra"]}
            dappConfig={{ network: Network.TESTNET }}
            onError={(error) => console.log(error)}
        >
            <App3 />
            </AptosWalletAdapterProvider>
  </React.StrictMode>
);
