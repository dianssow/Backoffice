import { useState, useEffect } from "react" 
import api from "../../api"
import { useSelector } from "react-redux"
import Pagination from "../Pagination"

function SupplierAccount({ supplier, onClose }) {
  const [invoices, setInvoices] = useState([]) 
  const [balance, setBalance] = useState(0) 
  const [selectedInvoice, setSelectedInvoice] = useState(null) 
  const [selectedVersement, setSelectedVersement] = useState(null) 
  const [activeTab, setActiveTab] = useState("invoices")
  const [versements, setVersements] = useState([])
  const [invoicesPage, setInvoicesPage] = useState(1)
  const [versementsPage, setVersementsPage] = useState(1)
  const [addInvoiceModal, setAddInvoiceModal] = useState(false)
  const [addVersementModal, setAddVersementModal] = useState(false)
  const [limit, setLimit] = useState(8)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("success")
  const [editInvoiceModal, setEditInvoiceModal] = useState(false)
  const [editVersementModal, setEditVersementModal] = useState(false)
  const [selectedInvoiceEdit, setSelectedInvoiceEdit] = useState(null)
  const [selectedVersementEdit, setSelectedVersementEdit] = useState(null)
  const [confirmDeleteInvoice, setConfirmDeleteInvoice] = useState(false)
  const [confirmDeleteVersement, setConfirmDeleteVersement] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const token = useSelector((state) => state.loginPage.token)

  const [invoiceFormData, setInvoiceFormData] = useState({
    invoiceAmount: "",
    invoiceDate: "",
    dueDate: "",
    depositAmount: ""
  })

  const [versementFormData, setVersementFormData] = useState({
    versementAmount: "",
    versementDate: "",
    payerName: "",
    motif: "",
    versementType: ""
  })

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")
    return `${day}/${month}/${year}`
  }

  const totalPagesInvoices = Math.ceil(invoices.length / limit)
  const totalPagesVersements = Math.ceil(versements.length / limit)

  const currentInvoices = invoices
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((invoicesPage - 1) * limit, invoicesPage * limit)

  const currentVersements = versements
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((versementsPage - 1) * limit, versementsPage * limit)

  // Reset page on tab switch
  useEffect(() => {
    if (activeTab === "invoices") setInvoicesPage(1)
    else if (activeTab === "versements") setVersementsPage(1)
  }, [activeTab])

  useEffect(() => {
    const handleResize = () => {
      if(window.innerWidth >= 1536) {
        setLimit(11)
      } else if (window.innerWidth >= 1024) {
        setLimit(8)
      } else if (window.innerWidth >= 650) {
        setLimit(6)
      } else {
        setLimit(4)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return() => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const fetchData = async () => {
    if (!supplier) return 

    try {
      const invoicesResponse = await api.get(`/api/supplier/${supplier.id}/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const supplierInvoices = invoicesResponse.data.invoices || [] 
      setInvoices(supplierInvoices) 

      const versementsResponse = await api.get(`/api/supplier/${supplier.id}/versements`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const supplierVersements = versementsResponse.data.versements || []
      setVersements(supplierVersements)
      
      const balanceResponse = await api.get(`/api/supplier/${supplier.id}/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      })   
      setBalance(balanceResponse.data.balance)     
    } catch (error) {
      console.error("Erreur de récupération des données:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [supplier])

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target
    setInvoiceFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault()

    if (!invoiceFormData.invoiceAmount || !invoiceFormData.invoiceDate) {
      setMessage("Montant et date requis")
      setMessageType("error")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    try {
      const response = await api.post(
        `/api/supplier/${supplier.id}/invoice/add`,
        {
          invoiceAmount: Number(invoiceFormData.invoiceAmount),
          invoiceDate: invoiceFormData.invoiceDate,
          dueDate: invoiceFormData.dueDate || null,
          depositAmount: Number(invoiceFormData.depositAmount) || 0
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        setMessage("Facture ajoutée avec succès")
        setMessageType("success")
        fetchData() 
        setAddInvoiceModal(false)
        setInvoiceFormData({
          invoiceAmount: "",
          invoiceDate: "",
          dueDate: "",
          depositAmount: ""
        })
      }

      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Erreur ajout facture:", error)
      setMessage(error.response?.data?.message || "Erreur serveur")
      setMessageType("error")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleVersementChange = (e) => {
    const { name, value } = e.target
    setVersementFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleVersementSubmit = async (e) => {
    e.preventDefault()

    if (!versementFormData.versementAmount || !versementFormData.versementDate) {
      setMessage("Montant et date requis")
      setMessageType("error")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    try {
      const response = await api.post(
        `/api/supplier/${supplier.id}/versement/add`,
        {
          versementAmount: Number(versementFormData.versementAmount),
          versementDate: versementFormData.versementDate,
          payerName: versementFormData.payerName || null,
          motif: versementFormData.motif || null,
          versementType:versementFormData.versementType || null

        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        setMessage("Versement enregistré avec succès")
        setMessageType("success")
        fetchData() 
        setAddVersementModal(false)
        setVersementFormData({
          versementAmount: "",
          versementDate: "",
          payerName: "",
          motif: "", 
          versementType:""
        })
      }

      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Erreur ajout versement:", error)
      setMessage(error.response?.data?.message || "Erreur serveur")
      setMessageType("error")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  //Edit,delete(Versesments und Invoices)

  const handleEditInvoice = (invoice) => {
  setSelectedInvoiceEdit(invoice)
  setInvoiceFormData({
    invoiceAmount: invoice.invoiceAmount,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate || "",
    depositAmount: invoice.depositAmount || ""
  })
  setEditInvoiceModal(true)
}

const handleEditInvoiceSubmit = async (e) => {
  e.preventDefault()
  try {
    const response = await api.put(
      `/api/supplier/${supplier.id}/invoice/${selectedInvoiceEdit.id}`,
      {
        invoiceAmount: Number(invoiceFormData.invoiceAmount),
        invoiceDate: invoiceFormData.invoiceDate,
        dueDate: invoiceFormData.dueDate || null,
        depositAmount: Number(invoiceFormData.depositAmount) || 0
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (response.data.success) {
      setMessage("Facture modifiée avec succès")
      setMessageType("success")
      fetchData()
      setEditInvoiceModal(false)
      setSelectedInvoiceEdit(null)
    }
    setTimeout(() => setMessage(""), 3000)
  } catch (error) {
    setMessage(error.response?.data?.message || "Erreur serveur")
    setMessageType("error")
    setTimeout(() => setMessage(""), 3000)
  }
}

const handleDeleteInvoice = async () => {
  try {
    const response = await api.delete(
      `/api/supplier/${supplier.id}/invoice/${itemToDelete.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (response.data.success) {
      setMessage("Facture supprimée avec succès")
      setMessageType("success")
      fetchData()
    }
    setTimeout(() => setMessage(""), 3000)
  } catch (error) {
    setMessage("Erreur serveur")
    setMessageType("error")
    setTimeout(() => setMessage(""), 3000)
  } finally {
    setConfirmDeleteInvoice(false)
    setItemToDelete(null)
  }
}

const handleEditVersement = (versement) => {
  setSelectedVersementEdit(versement)
  setVersementFormData({
    versementAmount: versement.versementAmount,
    versementDate: versement.versementDate,
    payerName: versement.payerName || "",
    motif: versement.motif || "",
    versementType: versement.versementType || "" 
  })
  setEditVersementModal(true)
}

const handleEditVersementSubmit = async (e) => {
  e.preventDefault()
  try {

    const response = await api.put(
      `/api/supplier/${supplier.id}/versement/${selectedVersementEdit.id}`,
      {
        versementAmount: Number(versementFormData.versementAmount),
        versementDate: versementFormData.versementDate,
        payerName: versementFormData.payerName || null,
        motif: versementFormData.motif || null,
        versementType: versementFormData.versementType || null
      },
      { headers: {
          Authorization: `Bearer ${token}` 
        } 
      }
    )
    
    if (response.data.success) {
      setMessage("Versement modifié avec succès")
      setMessageType("success")
      fetchData()
      setEditVersementModal(false)
      setSelectedVersementEdit(null)
    }
    setTimeout(() => setMessage(""), 3000)
  } catch (error) {
    setMessage(error.response?.data?.message || "Erreur serveur")
    setMessageType("error")
    setTimeout(() => setMessage(""), 3000)
  }
}

const handleDeleteVersement = async () => {
  try {
    const response = await api.delete(
      `/api/supplier/${supplier.id}/versement/${itemToDelete.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (response.data.success) {
      setMessage("Versement supprimé avec succès")
      setMessageType("success")
      fetchData()
    }
    setTimeout(() => setMessage(""), 3000)
  } catch (error) {
    setMessage("Erreur serveur")
    setMessageType("error")
    setTimeout(() => setMessage(""), 3000)
  } finally {
    setConfirmDeleteVersement(false)
    setItemToDelete(null)
  }
}

const closeAddVersementModal = () => {
  setAddVersementModal(false)
  setVersementFormData({
    versementAmount: "",
    versementDate: "",
    payerName: "",
    motif: "",
    versementType: ""
  })
}

const closeAddInvoiceModal = () => {
  setAddInvoiceModal(false)
  setInvoiceFormData({
    invoiceAmount: "",
    invoiceDate: "",
    dueDate: "",
    depositAmount: ""
  })
}

const closeEditVersementModal = () => {
  setEditVersementModal(false)
  setSelectedVersementEdit(null)
  setVersementFormData({
    versementAmount: "",
    versementDate: "",
    payerName: "",
    motif: "",
    versementType: ""
  })
}

const closeEditInvoiceModal = () => {
  setEditInvoiceModal(false)
  setSelectedInvoiceEdit(null)
  setInvoiceFormData({
    invoiceAmount: "",
    invoiceDate: "",
    dueDate: "",
    depositAmount: ""
  })
}

  return (
    <>
      <div className="p-6 bg-white rounded shadow">
        <button
          onClick={onClose}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 mb-4"
        >
          ← Retour
        </button>
         <div className="flex justify-between">
          <div className="flex  gap-2">
        <h2 className="text-2xl font-bold mb-2">{supplier.name}</h2>
       
        <p className="mb-1"> {supplier.address || "-"}</p>
        </div>
        <p className="mb-1"><strong>Numéro:</strong> {supplier.number || "-"}</p> 
        </div>
        <p className={`mb-4 font-bold text-xl ${balance > 100000000 ? 'text-red-600' : balance > 50000000 ? 'text-orange-400' : 'text-green-600'}`}>
          <strong>Balance du compte :</strong> {balance?.toLocaleString('fr-FR') || "0"} GNF
        </p>
      </div>

      {message && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className={`p-6 rounded-xl text-xl ${
            messageType === "success" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
          }`}>
            {message}
          </div>
        </div>
      )}

      <div>
        <div className="flex gap-4 border-b pb-2 mb-4">
          <button 
            onClick={() => setActiveTab("invoices")}
            className={`px-3 py-2 rounded ${
              activeTab === "invoices"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Factures
          </button>
          <button 
            onClick={() => setActiveTab("versements")}
            className={`px-3 py-2 rounded ${
              activeTab === "versements"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Versements
          </button>
        </div>
      </div>

      {activeTab === "invoices" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Historique des factures</h3>
            <button
              onClick={() => setAddInvoiceModal(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              + Ajouter une facture
            </button>
          </div>

          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">N° Facture</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Montant</th>
                <th className="border p-2">Avance</th>
                <th className="border p-2">Reste</th>
                <th className="border p-2">Échéance</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.map((invoice) => {
                const reste = invoice.invoiceAmount - (invoice.depositAmount || 0)
                return (
                  <tr key={invoice.id}>
                    <td className="border p-2">{invoice.invoiceNumber}</td>
                    <td className="border p-2">{formatDate(invoice.invoiceDate)}</td>
                    <td className="border p-2">{invoice.invoiceAmount?.toLocaleString('fr-FR')} GNF</td>
                    <td className="border p-2">{invoice.depositAmount?.toLocaleString('fr-FR') || 0} GNF</td>
                    <td className="border p-2 font-bold text-red-600">
                      {reste.toLocaleString('fr-FR')} GNF
                    </td>
                    <td className="border p-2">{formatDate(invoice.dueDate) || "-"}</td>
                    <td className="border p-2">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >Modifier</button>
                        <button
                          onClick={() => { setItemToDelete(invoice); setConfirmDeleteInvoice(true) }}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >Supprimer</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <Pagination
            currentPage={invoicesPage}
            totalPages={totalPagesInvoices}
            onPageChange={(newPage) => setInvoicesPage(newPage)}
          />
        </div>
      )}

      {activeTab === "versements" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Historique des versements</h3>
            <button
             onClick={() => {
                setVersementFormData({
                  versementAmount: "",
                  versementDate: "",
                  payerName: "",
                  motif: "",
                  versementType: ""
                })
                setAddVersementModal(true)
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              + Ajouter un versement
            </button>
          </div>

          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="w-2 border p-2">N°</th> 
                <th className="border p-2">Date</th>
                <th className="border p-2">Montant</th>
                <th className="border p-2">Type </th>
                <th className="border p-2">Deposé par</th>
                <th className="border p-2">Motif</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            
            <tbody>
              {currentVersements.map((versement) => (
                <tr key={versement.id}>
                  <td className="border p-1 text-center">{versement.versementNumber}</td>
                  <td className="border p-2">{formatDate(versement.createdAt)}</td>
                  <td className="border p-2 font-bold text-green-600">
                    {versement.versementAmount?.toLocaleString('fr-FR')} GNF
                  </td>
                  <td className="border p-2">{versement.versementType || "-"}</td>
                  <td className="border p-2">{versement.payerName || "-"}</td>


                  <td className="border p-2">{versement.motif || "-"}</td>
                  <td className="border p-2">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEditVersement(versement)}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >Modifier</button>
                      <button
                        onClick={() => { setItemToDelete(versement); setConfirmDeleteVersement(true) }}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={versementsPage}
            totalPages={totalPagesVersements}
            onPageChange={setVersementsPage}
          />
        </div>
      )}

       {/* Ajout,Modifications Invoices,Versements */}
      {addInvoiceModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-slate-700/40 flex justify-center items-center z-50">
          <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-800 p-6 text-white rounded-lg w-1/3 relative"
          >
            <h1 className="text-xl uppercase text-center text-white font-bold mb-4">
              Ajouter une Facture
            </h1>
            
            <form className="flex flex-col gap-4" onSubmit={handleInvoiceSubmit}>
              <button
                type="button"
                onClick={closeAddInvoiceModal}
                className="text-red-500 font-bold absolute top-4 right-4 text-lg cursor-pointer"
              >
                X
              </button>
              
              <input
                name="invoiceAmount"
                value={invoiceFormData.invoiceAmount}
                onChange={handleInvoiceChange}
                type="number"
                step="0.01"
                placeholder="Montant de la facture *"
                className=" border p-2 rounded px-4 focus:outline-none focus:ring-0"
                required
              />
          <div className="flex flex-col gap-1 ">
                        <label className="text-green-600 text-sm font-semibold">Date de la Facture </label>
              <input
                name="invoiceDate"
                value={invoiceFormData.invoiceDate}
                onChange={handleInvoiceChange}
                type="date"
                placeholder="Date de la facture *"
                className=" border p-2 rounded px-4 focus:outline-none focus:ring-0"
                required
              />
              <label className="text-red-500 text-sm font-semibold">Date d'Echéance </label>
              <input
                name="dueDate"
                value={invoiceFormData.dueDate}
                onChange={handleInvoiceChange}
                type="date"
                placeholder="Date d'échéance"
                className=" border p-2 rounded px-4 focus:outline-none focus:ring-0"
              />
              </div>
              <input
                name="depositAmount"
                value={invoiceFormData.depositAmount}
                onChange={handleInvoiceChange}
                type="number"
                step="0.01"
                placeholder="Montant de l'avance (optionnel)"
                className=" border p-2 rounded px-4 focus:outline-none focus:ring-0"
              />
              
              <div className="flex justify-end space-x-2 mt-4">
                <button 
                  type="button"
                 onClick={closeAddInvoiceModal}
                  className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addVersementModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-slate-700/40 flex justify-center items-center z-50">
          <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-800 text-white p-6 rounded-lg w-1/3 relative"
          >
            <h1 className="text-xl uppercase text-center text-white font-bold mb-4">
              Ajouter un Versement
            </h1>
            
            <form className="flex flex-col gap-4" onSubmit={handleVersementSubmit}>
              <button
                type="button"
                onClick={closeAddVersementModal}
                className="text-red-500 font-bold absolute top-4 right-4 text-lg cursor-pointer"
              >
                X
              </button>
              
              <input
                name="versementAmount"
                value={versementFormData.versementAmount}
                onChange={handleVersementChange}
                type="number"
                placeholder="Montant du versement "
                className=" border p-2 rounded px-4 focus:outline-none focus:ring-0"
                required
              />
              
              <input
                name="versementDate"
                value={versementFormData.versementDate}
                onChange={handleVersementChange}
                type="date"
                placeholder="Date du versement "
                className=" border p-2 rounded px-4 focus:outline-none focus:ring-0"
                required
              />
              
              <input
                name="payerName"
                value={versementFormData.payerName}
                onChange={handleVersementChange}
                type="text"
                placeholder="Nom du dépositeur "
                className=" border p-2 rounded px-4 focus:outline-none focus:ring-0"
              />
              <select
                  name="versementType"
                  value={versementFormData.versementType}
                  onChange={handleVersementChange}
                  className=" border p-2 rounded px-4 focus:outline-none focus:ring-0"
                >
                  <option value=""> Type de paiement </option>
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="orangemoney">Orange Money</option>
                  <option value="devise">Devise</option>
              </select>
              
              <textarea
                name="motif"
                value={versementFormData.motif}
                onChange={handleVersementChange}
                placeholder="Motif du versement (optionnel)"
                rows={3}
                className="border p-2 rounded px-4 resize-none focus:outline-none focus:ring-0"
              />
              
              <div className="flex justify-end space-x-2 mt-4">
                <button 
                  type="button"
                  onClick={closeAddVersementModal}
                  className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation suppression facture */}
{confirmDeleteInvoice && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
    <div className="bg-slate-800 p-6 rounded-lg text-center">
      <p className="text-white text-xl mb-4">Supprimer cette facture ?</p>
      <div className="flex gap-4 justify-center">
        <button onClick={handleDeleteInvoice} className="px-4 py-2 bg-red-600 text-white rounded">Oui</button>
        <button onClick={() => { setConfirmDeleteInvoice(false); setItemToDelete(null) }} className="px-4 py-2 bg-gray-300 rounded">Non</button>
      </div>
    </div>
  </div>
)}

{/* Confirmation suppression versement */}
{confirmDeleteVersement && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
    <div className="bg-slate-800 p-6 rounded-lg text-center">
      <p className="text-white text-xl mb-4">Supprimer ce versement ?</p>
      <div className="flex gap-4 justify-center">
        <button onClick={handleDeleteVersement} className="px-4 py-2 bg-red-600 text-white rounded">Oui</button>
        <button onClick={() => { setConfirmDeleteVersement(false); setItemToDelete(null) }} className="px-4 py-2 bg-gray-300 rounded">Non</button>
      </div>
    </div>
  </div>
)}

{editInvoiceModal && (
  <div className="fixed top-0 left-0 w-full h-full bg-slate-700/40 flex justify-center items-center z-50">
    <div className="bg-slate-800 text-white p-6 rounded-lg w-1/3 relative">
      <h1 className="text-xl uppercase text-center text-white font-bold mb-4">Modifier la Facture</h1>
      <button type="button" onClick={closeEditInvoiceModal} 
        className="text-red-500 font-bold absolute top-4 right-4 text-lg">X</button>
      <form className="flex  flex-col gap-4" onSubmit={handleEditInvoiceSubmit}>
        <input name="invoiceAmount" value={invoiceFormData.invoiceAmount} onChange={handleInvoiceChange}
          type="number" placeholder="Montant *" className="border p-2 rounded px-4" required />
          <div className="flex flex-col gap-1 ">
          <label className="text-green-600 text-sm font-semibold">Date de la Facture </label>
        <input name="invoiceDate" value={invoiceFormData.invoiceDate} onChange={handleInvoiceChange}
          type="date" className=" border p-2 rounded px-4" required />
          <label className="text-red-500 text-sm font-semibold">Date d'Echéance </label>
        <input name="dueDate" value={invoiceFormData.dueDate} onChange={handleInvoiceChange}
          type="date" placeholder="Date d'échéance" className=" border p-2 rounded px-4" />
          </div>
        <input name="depositAmount" value={invoiceFormData.depositAmount} onChange={handleInvoiceChange}
          type="number" placeholder="Avance" className=" border p-2 rounded px-4" />
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={closeEditInvoiceModal}
            className="px-4 py-2 bg-gray-300  rounded">Annuler</button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Confirmer</button>
        </div>
      </form>
    </div>
  </div>
)}

{editVersementModal && (
  <div className="fixed top-0 left-0 w-full h-full bg-slate-700/40  flex justify-center items-center z-50">
    <div className="bg-slate-800 text-white p-6 rounded-lg w-1/3 relative">
      <h1 className="text-xl uppercase text-center text-white font-bold mb-4">Modifier le Versement</h1>
      <button type="button" onClick={closeEditVersementModal}
        className="text-red-500 font-bold absolute top-4 right-4 text-lg">X</button>
      <form className="flex flex-col gap-4" onSubmit={handleEditVersementSubmit}>
        <input 
        name="versementAmount" 
        value={versementFormData.versementAmount}
        onChange={handleVersementChange}
        type="number" placeholder="Montant " 
        className=" border p-2 rounded px-4" required />
        <input name="versementDate" value={versementFormData.versementDate} onChange={handleVersementChange}
          type="date" className="text-white border p-2 rounded px-4" required />
        <input 
        name="payerName"
        value={versementFormData.payerName} 
        onChange={handleVersementChange}
        type="text"
        placeholder="Nom du payeur" 
        className="text-white border p-2 rounded px-4" />
          <select
                  name="versementType"
                  value={versementFormData.versementType}
                  onChange={handleVersementChange}
                  className="border p-2 rounded px-4 focus:outline-none focus:ring-0"
                >
                  <option value="">Type de paiement</option>
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="orangemoney">Orange Money</option>
                  <option value="devise">Devise</option>
              </select> 
        <textarea name="motif" value={versementFormData.motif} onChange={handleVersementChange}
          placeholder="Motif" rows={3} className="text-white border p-2 rounded px-4 resize-none" />
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={closeEditVersementModal}
            className="px-4 py-2 bg-gray-300 text-black rounded">Annuler</button>
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Confirmer</button>
        </div>
      </form>
    </div>
  </div>
)}
    </>
  )
}

export default SupplierAccount