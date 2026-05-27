import { useState,useEffect } from "react"
import { useSelector} from "react-redux"
import api from "../../api"
import CustomerAccount from "./CustomerAccount"
import Pagination from "../Pagination"

function Customers() {   

    const [addEditModal, setAddEditModal] = useState(false)
    const [customers, setCustomers] = useState([])
    const [editCustomer, setEditCustomer] = useState(null)
    const[confirmDelete, setConfirmDelete]  = useState(false)
    const[selectedCustomer, setSelectedCustomer] = useState(null)
    const[filteredSales, setFilteredSales] = useState([])
    const[inputError, setInputError] = useState("")
    const[message, setMessage]  = useState(false)
    const[messageType, setMessageType]  = useState("success")
    const [filteredCustomers, setFilteredCustomers] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [limit, setLimit] = useState(8)
    const [formData, setFormData] = useState({
      name: "",
      number:"",
      address:"",   
      birth:""
    })   
       const [balancesSummary, setBalancesSummary] = useState({
        totalBalance: 0,
        totalDueOnly: 0
     })
          //  Pour affichage CustomerAccount(Visionner) 
  const[selectedClient, setSelectedClient] = useState(null)


    const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

    const startIndex = (currentPage - 1) * limit
    const currentCustomers = filteredCustomers.slice(startIndex, startIndex + limit)
    const totalPages = Math.ceil(filteredCustomers.length / limit)




    useEffect(() => {
        const handleResize = () => {
            if(window.innerWidth >= 1536) {
                setLimit(11)
            } else if (window.innerWidth >= 1024) {
                setLimit(8)
            } else if (window.innerWidth >= 650) {
                setLimit(6)
            } 
            else {
                setLimit(4)
            }
        }

        handleResize()

        window.addEventListener("resize", handleResize)

        return() => {
        window.removeEventListener("resize", handleResize)
        }
     }, [])



    const handleChange = (e) => {
        const {name, value, type} = e.target
    setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value
    }))
}  

const token = useSelector((state) => state.loginPage.token);

    const fetchCustomers = async () => {
        try {
             const response = await api.get("/api/customer", {
        headers: {
            Authorization: `Bearer ${token}`
              } 
            })
        setCustomers(response.data.customers)
        setFilteredCustomers(response.data.customers)
       
        } catch (error) {
        console.error("Erreur de creation du Client :", error);
            
        }

    }

    const fetchBalancesSummary = async () => {
  try {
    const res = await api.get("/api/customer/balances/summary")
    setBalancesSummary({
      totalBalance: res.data.totalBalance || 0,
      totalDueOnly: res.data.totalDueOnly || 0
    })
    console.log(res);
    
  } catch (error) {
    console.error("Erreur récupération total balances :", error)
  }
}
    useEffect (() => {
    fetchCustomers(),
    fetchBalancesSummary()
 }, [])
    

    const handleSubmit = async(e) => {
        e.preventDefault()
 
        try {
            if(editCustomer)  {


        const response = await api.put(`/api/customer/${editCustomer}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        
        })
        if(response.data.success ) {
            fetchCustomers()
            setAddEditModal(false)
            setEditCustomer(null); 
            setFormData({
            name: "",
            number:"",
            address:"",
            birth:""
         })
    }
    else {
        console.error("Erreur de modification du client")
    }
    }  
     else {
       const response = await api.post("/api/customer/add", formData,
         {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    

    if(response.data.success ) {
    fetchCustomers()
    setAddEditModal(false)
    setFormData({
        name: "",
        number:"",
        address:"",
        birth:""
     })

    }
    else{
    console.error("erreur d'ajout du Client, reessayez");
    
    }
    }
    
        } catch (error) {
            console.error("Erreur d'ajout du client");
            
        }
     
    }
    
    
    const handleEdit = async(customer) => { setFormData({   
         name: customer.name,
        number:  customer.number,
        address: customer.address,
        birth: customer.birth
        })
        setEditCustomer(customer.id)
        setAddEditModal(true)
    } 

    const closeModal = () => {
        setAddEditModal(false)
         setInputError("")
         setFormData({
        name: "",
        number:"",
        address:"",
        birth:""
         })
         setEditCustomer(null)

    }

     const askDelete = (Customer) => {
                setSelectedCustomer(Customer)
                setConfirmDelete(true)
            }
    
            //SUPPRESSION CATEGORIE
         const handleDelete = async() => {
            if(selectedCustomer){
                try {
                 const response = await api.delete(`/api/customer/${selectedCustomer.id}`, {
            headers: {
                Authorization: `Bearer ${token}`
                  } 
                })
                if(response.data.success) {
                    setMessage("Client supprimé avec succès")
                    setMessageType("success")
                    fetchCustomers()
                }
                else {
                    setMessage("Erreur lors de la  suppression du Client")
                    setMessageType("error")
                    console.error("erreur de suppression du Client");
                    
                }
                    
                } catch (error) {
                    console.error("erreur de suppression du Client");
                    setMessage("Erreur serveur")
                    setMessageType("error")
                }
                finally {
                    setConfirmDelete(false)
                    setSelectedCustomer(null)
    
                     setTimeout(() => {
                  setMessage("");
                     }, 3000);
                }
            }
    
         }

     const handleSearch = (e) => {
        setCurrentPage(1)
        setFilteredCustomers(
            customers.filter((customer) => 
            customer.name.toLowerCase().includes(e.target.value.toLowerCase()))
        ) 
     }    


   
  



  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      {!selectedClient ? (
        <>
            <h1 className="text-2xl font-bold">Gestion Des Clients</h1>
        <div className="flex justify-between items-center">
            <input
            onChange={handleSearch}
            className="border p-1 bg-white rounded px-4"
            type="text" placeholder="Rechercher" />
            <div>
            <h3>Total balance clients : {balancesSummary.totalBalance.toLocaleString("fr-FR")} GNF</h3>
            <h4>Total que les clients doivent : <span className="text-green-500">{balancesSummary.totalDueOnly.toLocaleString("fr-FR")} GNF</span></h4>
            </div>
            <button
            onClick={() => setAddEditModal(true)}
            className="px-3 py-2 bg-blue-600 text-black rounded-lg cursor-pointer hover:bg-blue-700 transition">New Client</button>
        </div>

        <div>
        {message && 
        <div className="fixed inset-0 text-3xl flex items-center justify-center ">
         <div className={` rounded-xl ${messageType === "success" ? " bg-green-200 text-green-800" : "bg-red-200 text-red-800"} `} >{message}</div>
        </div>
        }

           {confirmDelete && selectedCustomer && (
        <div className="fixed inset-0 flex items-center justify-center ">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
            <p className="text-white text-2xl mb-4">Voulez-vous definitivement supprimer ce Client <br /> 
            <span className="text-green-400"> {selectedCustomer.name} ??</span></p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(selectedCustomer)}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Oui
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

        
            <table className=" w-full border-collapse border border-gray-300 mt-4">
                <thead>
                    <tr className="bg-gray-200">
                        <th  className="w-2 border border-gray-100 p-2">N°</th>
                        <th className=" border border-gray-100 p-2">Nom du Client</th>
                        <th className=" border border-gray-100 p-2">Numéro </th>
                        <th className=" border border-gray-100 p-2">Address</th>
                        <th className=" border border-gray-100 p-2">Naissance</th>
                        <th className="  border border-gray-100 p-2">Action</th>
                    </tr>
                </thead>
                
                <tbody>
                
               {currentCustomers.map((customer, index) => (
                    <tr  key={customer.id || index}>
                        <td className="border items-center justify-center border-gray-200 p-1">{startIndex + index + 1}</td>
                        <td className="border border-gray-200 p-2">{customer.name}</td>
                        <td className="border border-gray-200 p-2">{customer.number} </td>
                        <td className="border border-gray-200 p-2">{customer.address}</td>
                        <td className="border border-gray-200 p-2">{formatDate(customer.birth)}</td>
                        <td className="border border-gray-200 p-2" >
                            <div className="flex flex-wrap gap-3 justify-end">
                            <button 
                            onClick={() => handleEdit(customer)}
                            className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300">Modifier</button>
                            <button
                            onClick={() => setSelectedClient(customer)}
                            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700">Visionner</button>
                            <button
                            onClick={() => askDelete(customer)}
                            className="px-3 py-1 bg-red-500 rounded hover:bg-red-600">Supprimer</button>
                            </div>
                        </td>
                    </tr>

                 ))}
              
                </tbody>
                
            </table>
                <Pagination
                 currentPage={currentPage}
                 totalPages={ totalPages}
                 onPageChange={setCurrentPage}
                />
            </> ) : (
              <>
              <CustomerAccount
               customer={selectedClient}
               onClose={() => setSelectedClient(null)}
               />
              </>
            )}
            
            <p className="p-4 text-center text-gray-500">
              {filteredCustomers.length === 0
             ? (customers.length === 0 
             ? "Aucun client ajouté" 
             : "Aucun client trouvé")
             : null
             }
           </p>
            
    

     { addEditModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-slate-700/10   flex justify-center items-center ">
            <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-800 p-4 rounded-lg w-1/3 relative">
                <h1 className="text-xl uppercase text-center  text-white font-bold"> {editCustomer ? "Modifier le Client" : "Ajouter un Client"} </h1>
             <form className="flex flex-col gap-4 mt-4" 
             onSubmit={handleSubmit}>
                <button
                onClick={closeModal}
                className="text-red-500 font-bold rouded  absolute top-4 right-4 text-lg cursor-pointer">X</button>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text" 
                 placeholder="Nom du Client" 
                 className=" text-white border p-1  rounded px-4 focus:outline-none focus:ring-0"
                />
                <input 
                 name="number"
                  value={formData.number}    
                  onChange={handleChange}
                 type="Number"
                  placeholder="Numéro de TEL"
                  className=" text-white border p-1 rounded px-4 focus:outline-none focus:ring-0"
                />
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  type="text" 
                 placeholder="Address" 
                 className=" text-white border p-1  rounded px-4 focus:outline-none focus:ring-0"
                />
                <input 
                 name="birth"
                  value={formData.birth}
                  onChange={handleChange}
                type="Date" 
                 placeholder="Date de Naissance" 
                 className=" text-white border p-1 rounded px-4 focus:outline-none focus:ring-0"
                />
               {inputError && (
        <p className="text-red-600 text-xl mb-4 "> {inputError} </p>
       )}
        <div className="flex justify-end space-x-2">
            
        <button 

         onClick={closeModal}
        className="px-4 py-2 bg-gray-300 text-white rounded hover:bg-gray-400 ">Annulez</button>
        <button 

        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700  "> {editCustomer ? "Confirmer" : "Ajouter" }</button>
        </div>
             </form>
            </div>
        </div>
     )}

    </div>
  )
}
export default Customers