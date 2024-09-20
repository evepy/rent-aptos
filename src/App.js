import { Account, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET}))
const CONTRACT ="0xcb8b57d6f98f4295fc261eddca12af69988e5a2a02e0359e5f2ab71e57277de4"

function App() {
    const [loading, setLoading] = useState(true);
    //guardar las transacciones de la API(lista de versiones)
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);
    //metodos de useWallet
    const { connect, account, connected, disconnect, signAndSubmitTransaction } = useWallet();
    const [isOpen, setIsOpen] = useState(false);
    //Contador de listas
    const [todoListCounter, setTodoListCounter] = useState(0); 
    //Listas del to-do
    const [todoLists, setTodoLists] = useState([]); 
    //Tareas de las listas del to-do
    const [newTasks, setNewTasks] = useState('');
    const connectWallet = async () => {
        if(connected) {
          await disconnect()
        } else {
          await connect("Petra")
        }
    }
    //Crear lista
    const create_todo_list = async () => {
        if (!account || !account.address) {
            alert("Conecta tu wallet primero.");
            return null;
        }

        try {
            //firmar transaccion
            const create = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${CONTRACT}::advanced_todo_list::create_todo_list`,
                    typeArguments: [],
                    functionArguments: []
                }
            });
            //esperar respuesta
            const response = await aptos.waitForTransaction({
                transactionHash: create.hash
            });
            return response;

        } catch (e) {
            console.error("Transacción fallida al crear lista:", e);
            alert("Transacción no realizada");
            return null;
        }
    };
    //Crear tarea
    const create_todo = async (listIndex, content) => {
        try {
            const create = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${CONTRACT}::advanced_todo_list::create_todo`,
                    typeArguments: [],
                    functionArguments: [listIndex, content]
                }
            });

            const response = await aptos.waitForTransaction({
                transactionHash: create.hash
            });
            
            //actualiza las tareas locales
            setTodoLists(prevLists => {
                const updatedLists = [...prevLists];
                if (!updatedLists[listIndex].tasks) {
                    updatedLists[listIndex].tasks = [];
                }
                updatedLists[listIndex].tasks.push({ content: content, completed: false });
                updatedLists[listIndex].taskCount += 1;
                return updatedLists;
            });

            setNewTasks(prevNewTasks => ({
                ...prevNewTasks,
                [listIndex]: ''
            }));

            return response

        } catch (e) {
            console.error("Error al agregar tarea:", e);
            alert(`No se pudo agregar la tarea: ${e.message || 'Error desconocido'}`);
        }
    };
    //Marcar como completado
    const complete_todo = async (listIndex, taskIndex) => {
        try {
            const create = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${CONTRACT}::advanced_todo_list::complete_todo`,
                    typeArguments: [],
                    functionArguments: [listIndex, taskIndex]
                }
            });

            await aptos.waitForTransaction({
                transactionHash: create.hash
            });
            //Actualizar de forma local
            setTodoLists(prevLists => {
                const updatedLists = [...prevLists];
                if (updatedLists[listIndex].tasks && updatedLists[listIndex].tasks[taskIndex]) {
                    updatedLists[listIndex].tasks[taskIndex].completed = true;
                }
                return updatedLists;
            });

        } catch (e) {
            console.error("Error al completar tarea:", e);
            alert("No se pudo completar la tarea.");
        }
    };
    //Obtener direccion de una lista
    const get_list_obj_addr = async (listIndex) => {
        const payload = {
          function: `${CONTRACT}::advanced_todo_list::get_todo_list_obj_addr`,
          functionArguments: [`${account.address}`, listIndex]
        }
        let result = await aptos.view({ payload })
        return result
    }
    //Buscar el total de listas
    const all_todo_list = async () => {
        const payload = {
          function: `${CONTRACT}::advanced_todo_list::get_todo_list_counter`,
          functionArguments: [`${account.address}`]
        }
    
        let result = await aptos.view({ payload })
        return result
    }
    //Obtener total de listas y sus tareas
    const fetchTodoListCounter = async () => {
        // Generar listas
        const counter = await all_todo_list();
        const listCount = parseInt(counter, 10);
        setTodoListCounter(listCount)
        const generatedLists = [];
        for (let i = 0; i < listCount; i++) {
            //generar tareas
            const listData = await get_all_todo(i);
            const taskCount = parseInt(listData[1], 10)
            const tasks = [];
            //buscar contenido de cada tarea y su estado
            for (let j = 0; j < taskCount; j++){
                const taskData = await get_all_content(i, j);
                tasks.push({
                    content: taskData[0],
                    completed: taskData[1]
                })
            }
                generatedLists.push({ index: i, taskCount: taskCount, tasks: tasks });
        }
        
        setTodoLists(generatedLists);
    }
    //Lista de Versiones
    const fetchTransactions = async () => {
        setLoading(true);
        try {
          const response = await fetch('https://api.testnet.aptoslabs.com/v1/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `query MyQuery {
                account_transactions(
                  where: {account_address: {_eq: "0x985c4b72b8aef5d03bb975999acb30283dc1858c0081a781cc2c3813667f6a56"}, 
                  user_transaction: {entry_function_id_str: {_eq: "0xcb8b57d6f98f4295fc261eddca12af69988e5a2a02e0359e5f2ab71e57277de4::advanced_todo_list::create_todo_list"}}}
                ) {
                  user_transaction {
                    entry_function_id_str
                    version
                  }
                }
              }`,
            }),
          });
          const result = await response.json();
    
          if (result.data && result.data.account_transactions) {
            setTransactions(result.data.account_transactions);
          } else {
            setTransactions([]);
          }
        } catch (err) {
          setError('Error al obtener las transacciones.');
        } finally {
          setLoading(false);
        }
      };
    
      //actualizando
      useEffect(() => {
        fetchTransactions();
      }, []);
    
      // Mostrar mensaje de carga mientras se obtienen los datos
      if (loading) {
        return <div>Cargando transacciones...</div>;
      }
    
      // Mostrar mensaje de error si ocurrió un error
      if (error) {
        return <div>{error}</div>;
      }
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    const handleCopyAddress = async (listIndex) => {
        try {
            const address = await get_list_obj_addr(listIndex);
            navigator.clipboard.writeText(address);
            alert("Dirección de la lista copiada al portapapeles");
        } catch (e) {
            console.error("Error al copiar la dirección:", e);
            alert("No se pudo copiar la dirección de la lista.");
        }
    }
    //obtener todas las listas por indice
    const get_all_todo = async (todoListIndex) => {
        const payload = {
          function: `${CONTRACT}::advanced_todo_list::get_todo_list`,
          functionArguments: [`${account.address}`,todoListIndex]
        }
    
        let result = await aptos.view({ payload })
        return result
    }
    //obtener todas las tareas por indice de lista e indice de tarea
    const get_all_content = async (todoListIndex, todoI) => {
        const payload = {
          function: `${CONTRACT}::advanced_todo_list::get_todo`,
          functionArguments: [`${account.address}`,todoListIndex, todoI]
        }
    
        let result = await aptos.view({ payload })
        return result
    }
    
    const handleNewTaskChange = (listIndex, value) => {
        setNewTasks(prevNewTasks => ({
            ...prevNewTasks,
            [listIndex]: value
        }));
    }
    //Enter llama a la funcion crear una tarea
    const handleNewTaskKeyPress = (event, listIndex) => {
        if (event.key === 'Enter') {
            create_todo(listIndex, newTasks[listIndex]);
        }
    }
   
    return (
        <div className="todoapp">
        <p>{connected ? `Cuenta conectada: ${account?.address}` : "No hay ninguna cuenta conectada"}</p>
        <button type="button" onClick={connectWallet}>{connected ? "Desconectar" : "Conectar"}</button>
            <br></br><br></br>
            <h1>TO-DO</h1>
            {connected ? (
                <>
            <a href="https://explorer.aptoslabs.com/object/0xcb8b57d6f98f4295fc261eddca12af69988e5a2a02e0359e5f2ab71e57277de4/modules/view/advanced_todo_list/get_todo_list_by_todo_list_obj_addr?network=testnet" target="_blank">Buscar mi lista en Aptos</a>
            <br></br>
            <button hidden={!connected} onClick={create_todo_list}>Crear To Do List</button><br></br>
            <button hidden={!connected} onClick={fetchTodoListCounter}>Cargar listas</button>
            <p>Listas #{todoListCounter}</p>
        <br></br>

        {todoListCounter === 0 && connected && <p>No hay listas</p>}

        {/* Mostrar las listas si hay alguna */}
        {todoListCounter > 0 && (
                        <ul>
                            {todoLists.map((list) => (
                                <li key={list.index}>
                                    <p>Lista #{list.index+1}: {list.taskCount} tareas</p>
                                    <button onClick={() => handleCopyAddress(list.index)}>Copiar dirección</button>
                                    <input placeholder="Crear nueva tarea"
                                        value={newTasks[list.index] || ''}
                                        onChange={(e) => handleNewTaskChange(list.index, e.target.value)}
                                        onKeyPress={(e)=> handleNewTaskKeyPress(e, list.index)}
                                    ></input>
                                    {list.taskCount === 0 ? (
                                        
                                        <p>No hay tareas creadas</p>
                                        
                                    ) : (
                                        <ul>
                                        {list.tasks.map((task, index) => (
                                            <li key={index}>
                                                <input
                                                    type="checkbox"
                                                    class="nes-checkbox"
                                                    checked={task.completed}
                                                    onChange={()=> !task.completed && complete_todo(list.index, index)}
                                                    readOnly
                                                />
                                                {task.content}
                                            </li>
                                        ))}
                                    </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
        <h2 >Versiones de mis listas</h2>
        {transactions.length > 0 ? (
        <div>
          {/* Botón para alternar el dropdown */}
          <button onClick={toggleDropdown}>
            {isOpen ? 'Ocultar Transacciones' : 'Mostrar Transacciones'}
          </button>
          
          {/* Lista desplegable de transacciones */}
          {isOpen && (
            <ul>
              {transactions.map((transaction, index) => (
                <li key={index}>
                  <p>Versión de la transacción: {transaction.user_transaction.version}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>No se encontraron transacciones para este usuario.</div>
                    )}
                    </>
            ):(
                    <>
                        <h2>Advanced Todo List</h2>
                        <p>Overview

                            Difference from simple todo list user can own multiple todo list contract.
                            <br></br>
                            Aptos Specific Things

                            Each user can have multiple todo lists, each todo list is stored under an object owned by the user, this is similar to PDA on Solana.

                        </p>
                    </>
            )}
        </div>
        
    )
}

export default App;
