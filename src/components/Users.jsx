import { useState,useEffect } from "react"
import { useSelector} from "react-redux"
import Pagination from "./Pagination"
import api from "../api"
import  {jwtDecode} from "jwt-decode"

function Users() {

    const [addEditModal, setAddEditModal] = useState(false)
    const [users, setUsers] = useState([])
    const [editUser, setEditUser] = useState(null)
    const[confirmDelete, setConfirmDelete]  = useState(false)
    const[selectedUser, setSelectedUser] = useState(null)
    const[inputError, setInputError] = useState("")
    const[message, setMessage]  = useState(false)
    const[messageType, setMessageType]  = useState("success")
    const [filteredUsers, setFilteredUsers] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [limit, setLimit] = useState(2)
    const [formData, setFormData] = useState({
        name: "",
        email:"",
        password:"",
        address:"",
        role:""
    })
    const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const startIndex = (currentPage - 1) * limit
    const currentUsers = filteredUsers.slice(startIndex, startIndex + limit)
    const totalPages = Math.ceil(filteredUsers.length / limit)




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

const token = useSelector((state) => state.loginPage.token);
const decodedToken = token ? jwtDecode(token) : null
const userRole = decodedToken?.role
    const fetchUsers = async () => {
        try {
             const response = await api.get("/api/user", {
        headers: {
            Authorization: `Bearer ${token}`
              } 
            })
        setUsers(response.data.users)
        setFilteredUsers(response.data.users)
        } catch (error) {
        console.error("Erreur de creation de l'utilisateur :", error);
            
        }

    }
    useEffect (() => {
    fetchUsers()
 }, [])
    

    const handleSubmit = async (e) => {
  e.preventDefault()
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;
     if (userRole !== "admin") {
    setInputError("Accès interdit aux nons admins")
    setTimeout(() => setMessage(""), 3000)
    return;
    }
  try {
    const submitData = {
      ...formData,
      role: formData.role || "cashier"
    }
   

    let response 

    if (editUser) {
      response = await api.put(
        `/api/user/${editUser}`,
        submitData,
        { headers: { Authorization: `Bearer ${token}`} }
      )
    } else {
      response = await api.post(
        "/api/user/add",
        submitData,
        { headers: { Authorization: `Bearer ${token}`} }
      )
    }

    if (response.data.success) {
      fetchUsers()
      setAddEditModal(false)
      setEditUser(null)
      setFormData({ name: "", email: "", password: "", address: "", role: "" })
      setMessage(
        editUser ? "✅ Utilisateur modifié avec succès" : "✅ Utilisateur ajouté avec succès"
      )
      setMessageType("success")
    } else {
      setInputError(response.data.message || "❌ Une erreur est survenue")
    }
  } catch (error) {
    const backendMessage = error.response?.data?.message || "❌ Erreur serveur"
    setInputError(backendMessage)
    console.error("Erreur utilisateur :", error)
  } finally {
    setTimeout(() => setMessage(""), 3000)
  }
}
    
    
    const handleEdit = async(user) => { 
      setFormData({
         name: user.name,
        email:  user.email,
        password:"",
        address: user.address,
        role: user.role
        })
        
        setEditUser(user.id)
        setAddEditModal(true)
    } 

    const closeModal = () => {
        setAddEditModal(false)
         setInputError("")
         setFormData({
       name:"",
       email:"",
       password:"",
       address:"",
       role: ""
         })
         setEditUser(null)

    }

     const askDelete = (user) => {
                setSelectedUser(user)
                setConfirmDelete(true)
            }
    
            //SUPPRESSION CATEGORIE
         const handleDelete = async() => {
            if(selectedUser){
                try {
                 const response = await api.delete(`/api/user/${selectedUser.id}`, {
            headers: {
                Authorization: `Bearer ${token}`
                  } 
                })
                if(response.data.success) {
                    setMessage("Client supprimé avec succès")
                    setMessageType("success")
                    fetchUsers()
                }
                else {
                    setMessage("Erreur lors de la  suppression de l'utilisateur")
                    setMessageType("error")
                    console.error("erreur de suppression de l'utilisateur");
                    
                }
                    
                } catch (error) {
                    console.error("erreur de suppression de l'utilisateur");
                    setMessage("Erreur serveur")
                    setMessageType("error")
                }
                finally {
                    setConfirmDelete(false)
                    setSelectedUser(null)
    
                     setTimeout(() => {
                  setMessage("");
                     }, 3000);
                }
            }
    
         }
     const handleChange = (e) => {
     const {name, value} = e.target
    setFormData((prev) => ({
        ...prev,
        [name]: value
    }))
}


     const handleSearch = (e) => {
        setCurrentPage
        setFilteredUsers(
            users.filter((user) => 
            user.name.toLowerCase().includes(e.target.value.toLowerCase()))
        ) 
     }    

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
            <h1 className="text-2xl font-bold">Gestion Des Employés</h1>
        <div className="flex  justify-between items-center ">
            <input
            onChange={handleSearch}
            className="border p-1 bg-white rounded px-4"
            type="text" placeholder="Rechercher" />
            <button
            onClick={() => setAddEditModal(true)}
            disabled= {userRole !== "admin"}
            className={`px-3 py-2 rounded-lg cursor-pointer transition sm:w-auto  
            ${userRole === "admin" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
            >New Utilisateur</button>
        </div>

            {message && 
        <div className="fixed inset-0  text-2xl flex items-center justify-center ">
         <div className={` rounded-xl ${messageType === "success" ? " bg-green-200 text-green-800" : "bg-red-200 text-red-800"} `} >{message}</div>
        </div>
        }

    
           {confirmDelete && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center ">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
            <p className="text-white text-2xl mb-4">Voulez-vous definitivement supprimer cet Employé <br /> 
            <span className="text-green-400"> {selectedUser.name} ??</span></p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(selectedUser)}
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
    
            <table className=" min-w-full border-collapse border border-gray-300 mt-4 ">
                <thead>
                    <tr className="bg-gray-200">
                        <th  className="w-2 border border-gray-100 p-2">N°</th>
                        <th className=" border border-gray-100 p-2">Nom de l'utilisateur</th>
                        <th className=" border border-gray-100 p-2">Email</th>
                        <th className=" border border-gray-100 p-2">Address</th>
                        <th className=" border border-gray-100 p-2">Rôle</th>
                        <th className=" border border-gray-100 p-2">Action</th>
                    </tr>
                </thead>
                
                <tbody>
                
               {currentUsers.map((user, index) => (
                    <tr  key={user.id || index}>
                        <td className="border items-center justify-center border-gray-200 p-1">{index + 1}</td>
                        <td className="border border-gray-200 p-2 ">{user.name}</td>
                        <td className="border border-gray-200 p-2">{user.email} </td>
                        <td className="border border-gray-200 p-2">{user.address}</td>
                        <td className="border border-gray-200 p-2">{user.role} </td>
                        <td className="border border-gray-200 p-2" >
                          <div className="flex flex-wrap gap-3 justify-end">
                           {userRole === "admin" && (
                            <>
                            <button 
                            onClick={() => handleEdit(user)}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Modifier</button>
                            <button
                            onClick={() => askDelete(user)}
                            className="px-3 py-1 bg-red-500 rounded hover:bg-red-600">Supprimer</button>
                           </>
                          )}
                          <button className="px-3 py-1 bg-green-600 rounded hover:bg-green-700">Visionner</button>
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
            
            <p className="p-4 text-center text-gray-500">
              {filteredUsers.length === 0
             ? (users.length === 0 
             ? "Aucun utilisateur ajouté" 
             : "Aucun utilisateur trouvé")
             : null
             }
           </p>
            
    

     { addEditModal && (
        <div className="fixed inset-0 w-full h-full bg-slate-700/10   flex justify-center items-center px-4 ">
            <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-700 p-4 rounded-lg w-1/3 relative">
                <h1 className="text-xl text-white text-center uppercase font-bold"> {editUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"} </h1>
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
                 placeholder="Nom de l'utilisateur" 
                 className=" text-white border p-1  rounded px-4 focus:outline-none focus:ring-0"
                />
                <input 
                 name="email"
                  value={formData.email}
                  onChange={handleChange}
                 type="text"
                  placeholder="E-mail"
                  className=" text-white border p-1 rounded px-4 focus:outline-none focus:ring-0"
                />
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type="text" 
                 placeholder="Mot de Passe" 
                 className=" text-white border p-1  rounded px-4 focus:outline-none focus:ring-0"
                />
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  type="text" 
                 placeholder="Address" 
                 className=" text-white border p-1  rounded px-4 focus:outline-none focus:ring-0"
                />
                 <div className="w-full ">
                <select 
                name="role"
                value={formData.role}
                onChange={handleChange}
                className=" w-full bg-slate-800 text-white border   rounded p-1 focus:outline-none focus:ring-0"   >
                  <option className="text-white bg-slate-800 " value="">Choisir le role</option>
                  <option className="text-white bg-slate-800 " value="admin">Admin</option>
                  <option className="text-white bg-slate-800 " value="cashier">Caissier</option>
                  
                </select>
                </div>
                
               {inputError && (
        <p className="text-red-600 text-xl mb-4 "> {inputError} </p>
       )}
        <div className="flex justify-end space-x-2">
            
        <button 

         onClick={closeModal}
        className="px-4 py-2 bg-gray-300 text-white rounded hover:bg-gray-400 ">Annulez</button>
        <button 

        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700  "> {editUser ? "Confirmer" : "Ajouter" }</button>
        </div>
             </form>
            </div>
        </div>
     )}

    </div>
  )
}
export default Users