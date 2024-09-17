import { Account, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
//npm install @aptos-labs/ts-sdk

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

const APTOS_COIN = "0x1::aptos_coin::AptosCoin";
const COIN_STORE = `0x1::coin::CoinStore<${APTOS_COIN}>`;
//interaccion con un contrato creado publicamente
const CONTRACT = "0xb77c85141a538ca35c8d1bda03c7a3b34fa7102bc574b2642454d04124e9291d";

//Clase 1 y 2 Conociendo metodos aptos y contratos
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
  //interactucnado con el contrato CONTRACT
  const helloWorld = async() => {
    const payload = {
      //---- direccion contrato::nombre::nombre_funcion
      function: `${CONTRACT}::frontend::hello_aptos`
    }
    //resultado de view
    let result = await aptos.review({ payload });
    alert(result);
  }

  return (
    <div className="App">
      Aptos Blockchain
      <button onClick={createAccount}>Crear cuenta</button>
      <button onClick={helloWorld}>Contract</button>
    </div>
  );
}
//Clase 3 sobre fondeo y uso de contratos de otros
function App2() {
  //setAlicia actualiza el valor de alicia
  const [alicia, setAlicia] = useState();
  const [cuentaCreada, setCuentaCreada] = useState(false);
  const [fondeada, setFondeada] = useState(false);
  //imprime alicia cada vez que cambia de valor
  useEffect(() => {
    console.log(alicia)
  }, [alicia])

  const crearCuenta = async () => {
    const a = Account.generate();
    setAlicia(`${a.accountAddress}`);
    setCuentaCreada(true)
  }

  const fondearCuenta = async () => {
    console.log(alicia.accountAddress)
    await aptos.fundAccount({
      accountAddress: alicia,
      amount: 100,
    });
    setFondeada(true);
  }

  const consultarSaldo = async () => {
    const saldoAlicia = await aptos.getAccountResource({
      accountAddress: alicia,
      resourceType: COIN_STORE,
    });
    
    console.log(`El saldo de alicia es: ${saldoAlicia.coin.value}`);
  }

  return (
    <div className="App">
      <button onClick={crearCuenta}>Crear cuenta</button>
      <button disabled={!cuentaCreada} onClick={fondearCuenta}>Fondear Cuenta</button>
      {/*Este boton se oculta y solo se muestra cuando la cuenta sea fondeada(true) */}
      <button hidden={!fondeada} onClick={consultarSaldo}>Consultar Saldo</button>
    </div>
  );
}

export default App;
