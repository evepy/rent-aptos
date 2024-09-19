import { Account, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET}))
const CONTRACT ="0xcb8b57d6f98f4295fc261eddca12af69988e5a2a02e0359e5f2ab71e57277de4"

function App() {
    const [title, setTitle] = useState('');
    const [todoLists, setTodoLists] = useState([]);
    const [content, setContent] = useState('');
    const [selectedListIndex, setSelectedListIndex] = useState(-1);
    const [lastTransactionResponse, setLastTransactionResponse] = useState(null);
    const [allTodoLists, setAllTodoLists] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);
    const { connect, account, connected, disconnect, signAndSubmitTransaction } = useWallet();

    const connectWallet = async () => {
        if(connected) {
          await disconnect()
        } else {
          await connect("Petra")
        }
    }

    const has_todo_list = async () => {
    if (!account || !account.address) {
        console.error("Wallet not connected or account not available");
        return false;
        }

    const query = {
        function: `${CONTRACT}::advanced_todo_list::has_todo_list`,
        functionArguments: [`${account.address}`, 0]
        };

        try {
            let result = await aptos.view({ query });
            return result;
        } catch (e) {
            console.error("Failed to check if todo list exists:", e);
            return false;
        }
    };

    const create_todo_list = async () => {
        if (!account || !account.address) {
            alert("Conecta tu wallet primero.");
            return null;
        }

        try {
            const create = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${CONTRACT}::advanced_todo_list::create_todo_list`,
                    typeArguments: [],
                    functionArguments: []
                }
            });

            const response = await aptos.waitForTransaction({
                transactionHash: create.hash
            });

            // Aquí necesitas extraer la dirección de la lista creada.
            // Esto depende de cómo tu contrato maneja la creación de listas.
            // Supongamos que emite un evento con el tipo de dirección de la lista.

            const todoListAddress = response.version

            if (!todoListAddress) {
                console.error("No se pudo obtener la dirección de la lista creada.");
            }

            return todoListAddress;

        } catch (e) {
            console.error("Transacción fallida al crear lista:", e);
            alert("Transacción no realizada");
            return null;
        }
    };
    
    const create_todo = async () => {
        if (selectedListIndex < 0 || selectedListIndex >= todoLists.length) {
            alert("Por favor, selecciona una lista primero.");
            return;
        }

        const selectedList = todoLists[selectedListIndex];

        if (!selectedList.address) {
            alert("La lista seleccionada no tiene una dirección válida.");
            return;
        }

        try {
            const create = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${CONTRACT}::advanced_todo_list::create_todo`,
                    typeArguments: [],
                    functionArguments: [selectedList.address, content]
                }
            });

            const response = await aptos.waitForTransaction({
                transactionHash: create.hash
            });

            const taskAddress = response.version

            setTodoLists(prevLists => {
                const updatedLists = [...prevLists];
                if (!updatedLists[selectedListIndex].tasks) {
                    updatedLists[selectedListIndex].tasks = [];
                }
                updatedLists[selectedListIndex].tasks.push({ content: content, completed: false });
                return updatedLists;
            });
            setContent('');

        } catch (e) {
            console.error("Error al agregar tarea:", e);
            alert(`No se pudo agregar la tarea: ${e.message || 'Error desconocido'}`);
        }
    };

    const handleCreateTodoList = async () => {
        if (!title) {
            alert("Por favor, ingresa un título para la lista.");
            return;
        }

        const listAddress = await create_todo_list();

        if (listAddress) {
            const newList = { title, address: listAddress, tasks: [] };
            setTodoLists(prevLists => {
                const updatedLists = [...prevLists, newList];
                return updatedLists;
            });
            setTitle('');
            setSelectedListIndex(todoLists.length);
        }
    };

    const complete_todo = async (listIndex, taskIndex) => {
        if (listIndex < 0 || listIndex >= todoLists.length) {
            alert("Índice de lista inválido.");
            return;
        }

        const selectedList = todoLists[listIndex];

        if (!selectedList.address) {
            alert("La lista seleccionada no tiene una dirección válida.");
            return;
        }

        if (!selectedList.tasks || !selectedList.tasks[taskIndex]) {
            alert("Índice de tarea inválido.");
            return;
        }

        try {
            const create = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${CONTRACT}::advanced_todo_list::complete_todo`,
                    typeArguments: [],
                    functionArguments: [selectedList.address, taskIndex]
                }
            });

            await aptos.waitForTransaction({
                transactionHash: create.hash
            });

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
    //consultar todas de get
    const all_todo_list = async () => {
        if (!account || !account.address) {
            console.error("Wallet not connected or account not available");
            return null;
        }

        const query = {
            function: `${CONTRACT}::advanced_todo_list::get_todo_list_counter`,
            functionArguments: [`${account.address}`]
        };

        try {
            let result = await aptos.view({ query });
            return result;
        } catch (e) {
            console.error("Failed to fetch all todo lists:", e);
            return null;
        }
    };

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
                  account_address
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
    
      // Llamamos a la API al montar el componente
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
    //Filtro por listas
    /*
    //por direccion
    const get_todo_list_addr  = async () => {
        const query = {
            function: `${CONTRACT}::advanced_todo_list::get_todo_list_obj_addr`,
            functionArguments:[`${account.address}`, todoListI]
        }
        let result = await aptos.view({ query });
        return result;

    }
    //por indice
    const get_todo_list = async () => {
        const query = {
            function: `${CONTRACT}::advanced_todo_list::get_todo_list`,
            functionArguments:[`${account.address}`, todoListI]
        }
        let result = await aptos.view({ query });
        return result;
    }
    //Filtro por tareas
    //por direccion
    const get_todo_addr = async () => {
        const query = {
            function: `${CONTRACT}::advanced_todo_list::get_todo_list_by_todo_list_obj_addr`,
            functionArguments:[todoAdress]
        }
        let result = await aptos.view({ query });
        return result;
    }
    //por indice
    const get_todo = async () => {
        const query = {
            function: `${CONTRACT}::advanced_todo_list::get_todo`,
            //direccion de cuenta e indice 0 para saber si existe
            functionArguments:[`${account.address}`, todoListI, todoI]
        }
        let result = await aptos.view({ query });
        return result;
    }
    useEffect(() => {
        const fetchTodoLists = async () => {
            if (!connected || !account?.address) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const result = await all_todo_list();
            setAllTodoLists(result);
            setLoading(false);
        };

        fetchTodoLists();
    }, [connected, account]);

    */
    
    // Manejar la selección de una lista
    const handleListSelect = (index) => {
        setSelectedListIndex(index);
    };

    //acciones
    return (
        <div className="todoapp">
        
        <h1>Transacciones</h1>
      {transactions.length > 0 ? (
        <ul>
          {transactions.map((transaction, index) => (
            <li key={index}>
              <p>Dirección de la cuenta: {transaction.account_address}</p>
              <p>Función de la transacción: {transaction.user_transaction.entry_function_id_str}</p>
              <p>Versión de la transacción: {transaction.user_transaction.version}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div>No se encontraron transacciones para este usuario.</div>
      )}
    </div>
    )
}

export default App;
