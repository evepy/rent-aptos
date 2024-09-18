import { Account, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
//npm install @aptos-labs/ts-sdk
import { useEffect, useState } from "react";

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

const APTOS_COIN = "0x1::aptos_coin::AptosCoin";
const COIN_STORE = `0x1::coin::CoinStore<${APTOS_COIN}>`;
//interaccion con un contrato creado publicamente
const CONTRACT = "0xb77c85141a538ca35c8d1bda03c7a3b34fa7102bc574b2642454d04124e9291d";
const CONTRACT_APTOGOTCHI_TESTNET="0xb686acdc6c166f92aa2090f005acc275b258c5d91653df9b3b8af21e7c104773"
const CONTRACT_TODO_TESTNET="0xcb8b57d6f98f4295fc261eddca12af69988e5a2a02e0359e5f2ab71e57277de4"
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
//Clase 4 : contrato aptogochi,metodos de escritura(antes View, ahora RUN) y SURF
function App3() {
  //Probando modulo si registra Aptogochi
  const hasAptogotchi = async () => {
    const payload = {
      function: `${CONTRACT_APTOGOTCHI_TESTNET}::main::has_aptogotchi`,
      //argumentos que necesita el modulo(direccion de wallet)
      functionArguments: ["0x985c4b72b8ae18...."]
    }
    let result = await aptos.view({ payload });
    alert(result);
  }
  return (
    <div>
      <button onClick={hasAptogotchi}>Tiene Aptogochi?</button>
    </div>
  )
}

function App4() {
  const [cuenta, setCuenta] = useState()
  useEffect(() => {
    setCuenta(Account.generate())
  });

  useEffect(() => {
    console.log(`${cuenta?.accountAddress}`)
  }, [cuenta]);
  
  const createTodoList = async () => {
    //crear transaccion que se comunica con aptos
    const transaction = await aptos.transaction.build.simple({
      sender: cuenta.accountAddress,
      data: {
        function: `${CONTRACT_TODO_TESTNET}::advanced_todo_list::create_todo_list`,
        //se manda a pesar de que sea vacio
        functionArguments: []
      }
    })
    //firmar transaccion(quien)
    const pending = await aptos.signAndSubmitTransaction({
      signer: cuenta,
      transaction
    })
    //Enviar transaccion en red Aptos
    const execute = await aptos.waitForTransaction({
      transactionHash: pending.hash
    })
    console.log(execute)
  }
  return (
    <div >
      <button onClick={createTodoList}>
        Crear todo
      </button>
    </div>
  )

}


export default App;
