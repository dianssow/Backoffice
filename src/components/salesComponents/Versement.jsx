import { useEffect, useState } from "react"
import {useSelector} from "react-redux"
import api from "../../api";
import CustomerAccount from "../customersComponents/CustomerAccount";
import Pagination from "../Pagination"

function Versements() {
  
  const token = useSelector(state => state.loginPage.token)
    const[selectedClient, setSelectedClient] = useState(null)
    const [currentSessionVersements, setCurrentSessionVersements] = useState([]);
    const [closedSessions, setClosedSessions] = useState([]);
    const [expandedSessionId, setExpandedSessionId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("")
    const [sessionsLimit, setSessionsLimit] = useState(8)
    const [page, setPage] = useState(1)

      const formatDate = (dateString) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day}/${month}/${year} á ${hours}h${minutes}`
}

  useEffect(() => {
        const handleResize = () => {
            if(window.innerWidth >= 1536) {
                setSessionsLimit(11)
            } else if (window.innerWidth >= 1024) {
                setSessionsLimit(8)
            } else if (window.innerWidth >= 650) {
                setSessionsLimit(6)
            } 
            else {
                setSessionsLimit(4)
            }
        }

        handleResize()

        window.addEventListener("resize", handleResize)

        return() => {
        window.removeEventListener("resize", handleResize)
        }
     }, [])

   

    const fetchVersements = async () => {
      try {
                 const response = await api.get(`/api/versement`, {
            headers: {
                Authorization: `Bearer ${token}`
                  } 
                })

               const versementsData = response.data.versements
               const current = versementsData.filter(versement => versement.shiftId?.status === "OPEN")
               const closed = versementsData
               .filter(versement => versement.shiftId?.status === "CLOSED")
               .reduce((acc, versement) => {
              const sid = versement.shiftId?.id || "Sans Session"
          if (!acc[sid]) acc[sid] = { shift: versement.shiftId, versements: [] }
               acc[sid].versements.push(versement)
            return acc 
           }, {})
        setCurrentSessionVersements(current);
        setClosedSessions(Object.values(closed))
        

            } catch (error) {
            console.error("Erreur de recuperation du versement :", error)
                
            }
    
        }
        useEffect (() => {
        fetchVersements()
     }, [token])          

     const filteredCurrentVersements = currentSessionVersements.filter((versement) =>
  versement.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
)

const filteredClosedSessions = closedSessions
  .map(session => ({
    ...session,
    versements: session.versements.filter(versement =>
      versement.customerId?.name?.toLowerCase().includes(searchTerm)
    )
  }))
  .filter(session => session.versements.length > 0)

    //  const handleSearch = (e) => {
    //   const searchTerm = e.target.value.toLowerCase()
    //   const filtered = versements.map(session => ({
    //     ...session,
    //     versements: session.versements.filter((versement) => versement.customer?.name?.toLowerCase().includes(searchTerm))
    //   })).filter((session) => session.versements.length > 0)
    //  }    

    const sortedClosedSessions = [...filteredClosedSessions].sort((a, b) => {
      const dateA = new Date(a.shift.closedAt || a.shift.openedAt)
      const dateB = new Date(b.shift.closedAt || b.shift.openedAt)
      return dateB - dateA
    })
    const indexOfLastSession = page * sessionsLimit
    const indexOfFirstSession = indexOfLastSession - sessionsLimit
    
    const paginatedClosedSessions = sortedClosedSessions.slice(indexOfFirstSession, indexOfLastSession )
    const totalPages =  Math.ceil(sortedClosedSessions.length / sessionsLimit)
    
    const totalCurrentSession = filteredCurrentVersements.reduce(
     (sum, versement) => sum + versement.amount, 0
    )
     const toggleSession = (shiftId) => {
      setExpandedSessionId(prev => prev === shiftId ? null : shiftId)
     }


  return (
   <div className="w-full h-full flex flex-col gap-4 p-4">
            {!selectedClient ? (
                <>
            <h1 className="text-2xl font-bold">Gestion Des Versements</h1>
        <div className="flex justify-between items-center">
            <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-1 bg-white rounded px-4 focus:outline-none focus:ring-0"
            type="text" placeholder="Rechercher" />

             <p className="text-2xl font-bold uppercase ">Total Session:
              <span className="mx-2 font-medium 2xl">
                {totalCurrentSession.toLocaleString('fr-FR')} GNF
             </span>
             </p>
          
        
        </div>

        {/* <div> */}
        {/* {message && 
        <div className="fixed inset-0 text-3xl flex items-center justify-center ">
         <div className={` rounded-xl ${messageType === "success" ? " bg-green-200 text-green-800" : "bg-red-200 text-red-800"} `} >{message}</div>
        </div>
        } */}

           {/* {confirmDelete && selectedVersement && (
        <div className="fixed inset-0 flex items-center justify-center ">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
            <p className="text-white text-2xl mb-4">Voulez-vous definitivement supprimer ce versement <br /> 
            <span className="text-green-400"> {selectedVersement.name} ??</span></p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(selectedVersement)}
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
        </div> */}

        

        <h2 className="text-xl font-bold mt-6">Session en Cours</h2>
            <table className=" w-full border-collapse border border-gray-300 mt-2">
                <thead>
                    <tr className="bg-gray-200">
                        <th  className="border p-2">N°</th>
                        <th className=" border p-2">Nom du Client</th>
                        <th className=" border p-2">Adress </th>
                        <th className=" border p-2">Date</th>
                        <th className=" border p-2">Caissier</th>
                        <th className=" border p-2">Total</th>
                        <th className=" border p-2">Motif</th>
                        <th className="  border p-2">Action</th>
                    </tr>
                </thead>
                
                <tbody>
                 {filteredCurrentVersements.map((versement ) => (
                    <tr  key={versement.id}>
                        <td className="border items-center justify-center  p-1">{versement.versementNumber} </td>
                        <td className="border p-2">{versement.customerId?.name || "-"}</td>
                        <td className="border p-2">{versement.customerId?.address || "-"} </td>
                        <td className="border p-2">{formatDate(versement.createdAt)}</td>
                        <td className="border p-2">{versement.userId?.name || "-"}</td>
                        <td className="border p-2">{versement.amount.toLocaleString()}</td>
                        <td className="border p-2">{versement.motif}</td>
                        <td className="border p-2" >
                            <div className="flex flex-wrap gap-3 justify-end">
                            <button
                            onClick={() => setSelectedClient(versement.customerId)}
                            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700">Visionner</button>
                            <button
                            // onClick={() => askDelete(versement)}
                            className="px-3 py-1 bg-red-500 rounded hover:bg-red-600">Supprimer</button>
                            </div>
                        </td>
                    </tr>
                    ))}

              
                </tbody>
                
            </table>
           

           <h2 className="text-xl font-bold mt-6">Session Fermées</h2>
           {paginatedClosedSessions.map((session) => {
             const totalSession = session.versements.reduce((sum, s) => sum + s.amount, 0)
             return(
           <div key={session.shift.id} className="mt-4 border p-2 rounded">
              <h3
                className="cursor-pointer font-bold"
                onClick={() => toggleSession(session.shift.id)}
              >
                Session {formatDate(session.shift.openedAt)}
                                                         {" au "}
                          {formatDate(session.shift.closedAt)} par {session.shift.userId?.name} - {session.versements.length} versements - Total: {totalSession.toLocaleString("fr-FR")}
              </h3>
          
        {expandedSessionId === session.shift.id && (
            <table className=" w-full border-collapse border border-gray-300 mt-2">
                <thead>
                    <tr className="bg-gray-200">
                        <th  className="w-2 border p-2">N°</th>
                        <th className=" border p-2">Nom du Client</th>
                        <th className=" border p-2">Adresse </th>
                        <th className=" border p-2">Montant</th>
                        <th className=" border p-2">Caissier</th>
                        <th className=" border p-2">Date</th>
                        <th className="  border p-2">Motif</th>
                        <th className="  border p-2">Action</th>   
                    </tr>
                </thead>  
                
                <tbody>
                 {session.versements.map((versement, index) => (
                    <tr  key={versement.id}>
                        <td className="border items-center justify-center p-1">{versement.versementNumber} </td>
                        <td className="border p-2">{versement.customerId?.name || "-"}</td>
                        <td className="border p-2">{versement.customerId?.address || "-"} </td>
                        <td className="border p-2">{versement.amount}</td>
                        <td className="border p-2">{versement.userId?.name}</td>
                        <td className="border p-2">{formatDate(versement.createdAt)}</td>
                        <td className="border p-2">{versement.motif}</td>
                        <td className="border p-2" >
                            <div className="flex flex-wrap gap-3 justify-end">
                            <button
                            onClick={() => setSelectedClient(versement.customerId)}
                            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700">Visionner</button>
                            <button
                            // onClick={() => askDelete(versement)}
                            className="px-3 py-1 bg-red-500 rounded hover:bg-red-600">Supprimer</button>
                            </div>
                        </td>
                    </tr>
                    ))}

              
                </tbody>
                
            </table>
            )}
            </div>
            )
             })}

<Pagination
  currentPage={page}
  totalPages={ totalPages}
  onPageChange={(newPage) => setPage(newPage)}
/>
            </> 
) : (
    <>
    <CustomerAccount
     customer={selectedClient}
     onClose={() => setSelectedClient(null)}
     />
    </>
)

}

            
            {/* <p className="p-4 text-center text-gray-500">
                {filteredVersements.length === 0
                ? (versements.length === 0 
                ? "Aucun client ajouté" 
                : "Aucun client trouvé")
                : null
                }
                </p> */}

    </div>
)
}
export default Versements