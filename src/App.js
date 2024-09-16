import { Account, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
//npm install @aptos-labs/ts-sdk

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

function App() {
  return (
    <div className="App">
      Hola Mundo
    </div>
  );
}

export default App;
