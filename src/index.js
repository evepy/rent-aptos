import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network } from "@aptos-labs/ts-sdk";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AptosWalletAdapterProvider
        autoConnect={true}
        optInWallets={["Petra"]}
        dappConfig={{ network: Network.TESTNET }}
        onError={(error) => console.log(error)}
        >
            <App />
            </AptosWalletAdapterProvider>
  </React.StrictMode>
);
