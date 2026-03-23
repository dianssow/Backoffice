import { useState,useEffect } from "react"
import { useSelector} from "react-redux"
import api from "../../api"
import SupplierAccount from "./SupplierAccount"
import Pagination from "../Pagination"

function Supplier() {   

    const [addEditModal, setAddEditModal] = useState(false)
    const [suppliers, setSuppliers] = useState([])
    const [editSupplier, setEditSupplier] = useState(null)
    const[confirmDelete, setConfirmDelete]  = useState(false)
    const[selectedSupplier, setSelectedSupplier] = useState(null)
    const [totalDue, setTotalDue] = useState(0)
    const[inputError, setInputError] = useState("")
    const[message, setMessage]  = useState(false)
    const[messageType, setMessageType]  = useState("success")
    const [filteredSuppliers, setFilteredSuppliers] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [limit, setLimit] = useState(8)
    const [formData, setFormData] = useState({
      name: "",
      number:"",
      address:"",   
    })   
          //  Pour affichage SupplierAccount(Visionner) 
  const[selectedSupplierAccount, setSelectedSupplierAccount] = useState(null)


    const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`
};

    const startIndex = (currentPage - 1) * limit
    const currentSuppliers = filteredSuppliers.slice(startIndex, startIndex + limit)
    const totalPages = Math.ceil(filteredSuppliers.length / limit)




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
    const fetchSuppliers = async () => {
        try {
             const response = await api.get("/api/supplier", {
        headers: {
            Authorization: `Bearer ${token}`
              } 
            })
        setSuppliers(response.data.suppliers)
        setFilteredSuppliers(response.data.suppliers)
        setTotalDue(response.data.totalDue)
        
       
        } catch (error) {
        console.error("Erreur de creation du Fournisseur :", error);
            
        }

    }
    useEffect (() => {
    fetchSuppliers()
 }, [])
    

    const handleSubmit = async(e) => {
        e.preventDefault()
 
        try {
            if(editSupplier)  {


        const response = await api.put(`/api/supplier/${editSupplier}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        
        })
        if(response.data.success ) {
            fetchSuppliers()
            setAddEditModal(false)
            setEditSupplier(null); 
            setFormData({
            name: "",
            number:"",
            address:"",
         })
    }
    else {
        console.error("Erreur de modification du fournisseur")
    }
    }  
     else {
       const response = await api.post("/api/supplier/add", formData,
         {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    

    if(response.data.success ) {
    fetchSuppliers()
    setAddEditModal(false)
    setFormData({
        name: "",
        number:"",
        address:"",
     })

    }
    else{
    console.error("erreur d'ajout du Fournisseur, reessayez");
    
    }
    }
    
        } catch (error) {
            console.error("Erreur d'ajout du fournisseur", error.message);
            
        }
     
    }
    
    
    const handleEdit = async(supplier) => { setFormData({   
         name: supplier.name,
        number:  supplier.number,
        address: supplier.address,
        })
        setEditSupplier(supplier.id)
        setAddEditModal(true)
    } 

    const closeModal = () => {
        setAddEditModal(false)
         setInputError("")
         setFormData({
        name: "",
        number:"",
        address:"",
         })
         setEditSupplier(null)

    }

     const askDelete = (Supplier) => {
                setSelectedSupplier(Supplier)
                setConfirmDelete(true)
            }
    
            //SUPPRESSION CATEGORIE
         const handleDelete = async() => {
            if(selectedSupplier){
                try {
                 const response = await api.delete(`/api/supplier/${selectedSupplier.id}`, {
            headers: {
                Authorization: `Bearer ${token}`
                  } 
                })
                if(response.data.success) {
                    setMessage("Fournisseur supprimé avec succès")
                    setMessageType("success")
                    fetchSuppliers()
                }
                else {
                    setMessage("Erreur lors de la  suppression du Fournisseur")
                    setMessageType("error")
                    console.error("erreur de suppression du Fournisseur");
                    
                }
                    
                } catch (error) {
                    console.error("erreur de suppression du Fournisseur");
                    setMessage("Erreur serveur")
                    setMessageType("error")
                }
                finally {
                    setConfirmDelete(false)
                    setSelectedSupplier(null)
    
                     setTimeout(() => {
                  setMessage("");
                     }, 3000);
                }
            }
    
         }

     const handleSearch = (e) => {
        setCurrentPage(1)
        setFilteredSuppliers(
            suppliers.filter((supplier) => 
            supplier.name.toLowerCase().includes(e.target.value.toLowerCase()))
        ) 
     }    

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      {!selectedSupplierAccount ? (
        <>
         <div className=" flex font-bold justify-between">
            <h1 className="text-2xl ">Gestion Des Fournisseurs</h1>     
            <h2 className="text-2xl text-orange-600 text-end">{totalDue?.toLocaleString("fr-Fr") || "0"} GNF  </h2> 
         </div>
                    
        <div className="flex justify-between items-center">
            <input
            onChange={handleSearch}
            className="border p-1 bg-white rounded px-4"
            type="text" placeholder="Rechercher" />
            <button
            onClick={() => setAddEditModal(true)}
            className="px-3 py-2 bg-blue-600 text-black rounded-lg cursor-pointer hover:bg-blue-700 transition">New Fournisseur</button>
        </div>

        <div>
        {message && 
        <div className="fixed inset-0 text-3xl flex items-center justify-center ">
         <div className={` rounded-xl ${messageType === "success" ? " bg-green-200 text-green-800" : "bg-red-200 text-red-800"} `} >{message}</div>
        </div>
        }

           {confirmDelete && selectedSupplier && (
        <div className="fixed inset-0 flex items-center justify-center ">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
            <p className="text-white text-2xl mb-4">Voulez-vous definitivement supprimer ce Fournisseur <br /> 
            <span className="text-green-400"> {selectedSupplier.name} ??</span></p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(selectedSupplier)}
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
                        <th className=" border border-gray-100 p-2">Nom du Fournisseur</th>
                        <th className=" border border-gray-100 p-2">Numéro </th>
                        <th className=" border border-gray-100 p-2">Balance</th>
                        <th className=" border border-gray-100 p-2">Echeance</th>
                        <th className="  border border-gray-100 p-2">Action</th>
                    </tr>
                </thead>
                
                <tbody>
                
               {currentSuppliers.map((supplier, index) => (
                    <tr  key={supplier.id || index}>
                        <td className="border items-center justify-center border-gray-200 p-1">{startIndex + index + 1}</td>
                        <td className="border border-gray-200 p-2">{supplier.name}</td>
                        <td className="border border-gray-200 p-2">{supplier.number} </td>
                        <td>{supplier.balance?.toLocaleString("fr-FR") || "0"} GNF </td>
                        <td className="border border-gray-200 p-2 text-center">
                        {supplier.dueDate ? (
                            <span className={`font-semibold ${
                            new Date(supplier.dueDate) < new Date() ? 'text-red-600' : 'text-orange-600'
                            }`}>
                            {formatDate(supplier.dueDate)}
                            </span>
                        ) : (
                            <span className="text-gray-400">-</span>
                        )}
                        </td>
                        <td className="border border-gray-200 p-2" >
                            <div className="flex flex-wrap gap-3 justify-end">
                            <button 
                            onClick={() => handleEdit(supplier)}
                            className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300">Modifier</button>
                            <button
                            onClick={() => setSelectedSupplierAccount(supplier)}
                            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700">Visionner</button>
                            <button
                            onClick={() => askDelete(supplier)}
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
              <SupplierAccount
               supplier={selectedSupplierAccount}
               onClose={() => setSelectedSupplierAccount(null)}
               />
              </>
            )}
            
            <p className="p-4 text-center text-gray-500">
              {filteredSuppliers.length === 0
             ? (suppliers.length === 0 
             ? "Aucun fournisseur ajouté" 
             : "Aucun fournisseur trouvé")
             : null
             }
           </p>
            
    

     { addEditModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-slate-700/10   flex justify-center items-center ">
            <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-800 p-4 rounded-lg w-1/3 relative">
                <h1 className="text-xl uppercase text-center  text-white font-bold"> {editSupplier ? "Modifier le Fournisseur" : "Ajouter un Fournisseur"} </h1>
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
                 placeholder="Nom du Fournisseur" 
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
               {inputError && (
        <p className="text-red-600 text-xl mb-4 "> {inputError} </p>
       )}
        <div className="flex justify-end space-x-2">
            
        <button 

         onClick={closeModal}
        className="px-4 py-2 bg-gray-300 text-white rounded hover:bg-gray-400 ">Annulez</button>
        <button 

        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700  "> {editSupplier ? "Confirmer" : "Ajouter" }</button>
        </div>
             </form>
            </div>
        </div>
     )}

    </div>
  )
}
export default Supplier