import { Account, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useEffect, useState } from "react";
import { ABI } from "./abi.ts"
import { createSurfClient } from "@thalalabs/surf";

export const aptos= new Aptos(new AptosConfig({network: Network.TESTNET}))
export const surfClient = createSurfClient(aptos).useABI(ABI)

//Usando SURF (se debe descargar)
function App5() {
    const [cuenta, setCuenta] = useState()

    useEffect(() => {
      setCuenta(Account.generate())
    },[]);
  
    useEffect(() => {
      console.log(`${cuenta?.accountAddress}`)
    }, [cuenta]);
    
    //entry en surf es lo mismo que metodos de escritura (seccion RUN)
    const crearListaTodo = async () => {
        const result = await surfClient.entry.create_todo_list({
            typeArguments: [],
            functionArguments: [],
            account: cuenta,
        })
    
        console.log(result)
        setListaCreada(true)
    }
    
    const creatTodo = async (e) => {
        e.preventDefault();
        const result = await surfClient.entry.create_todo({
            typeArguments: [],
            functionArguments: [0, `${e.target.elements.todo.value}`],
            account: cuenta,
        })
    }
  
    return (
      <div>
            <button onClick={crearListaTodo}>
                Creat lista TODO
  </button>
      </div>
    )
}
export default App5;