import { Account, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
//npm install @aptos-labs/ts-sdk

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

const APTOS_COIN = "0x1::aptos_coin::AptosCoin";
const COIN_STORE = `0x1::coin::CoinStore<${APTOS_COIN}>`;

function App() {
  //create account on Aptos
  const createAccount = async () => {
    const user = Account.generate();
    console.log(user.accountAddress);

    //fund in network Aptos
    await aptos.fundAccount({
      accountAddress: user.accountAddress,
      amount: 10,
    });
    //get fund user
    const coinUser = await aptos.getAccountResource({
      accountAddress: user.accountAddress,
      //recurso en x direccion del contrato inteligente(Move)
      resourceType: COIN_STORE,
    });

    console.log(`El saldo es: ${coinUser.coin.value}`);
  }

  return (
    <div className="App">
      Aptos Blockchain
      <button onClick={createAccount}>Crear cuenta</button>
    </div>
  );
}

export default App;
