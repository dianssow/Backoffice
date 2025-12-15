import { useState, useEffect } from "react"
import {useSelector} from "react-redux"
import api from "../../api"

function CashManagement() {  
  const [summary, setSummary] = useState(null)
  const [movements, setMovements] = useState([])
  const [shifts, setShifts] = useState([])
  const [openingAmount, setOpeningAmount] = useState("")
  const [closingAmount, setClosingAmount] = useState("")
  const [activeTab, setActiveTab] = useState("movements") 
  const [dailyReport, setDailyReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


const token = useSelector((state) => state.loginPage.token)
const currentUser = useSelector((state) => state.loginPage.user)

   const fetchCashSummary = async () => {

    try {

        const response = await api.get("/api/cash/summary", {
             headers: {
            Authorization: `Bearer ${token}`
              } 
        })
        setSummary(response.data)
        
    } catch (error) {
        console.error("Erreur de la recuperation du resume de la caisse:", error)
        setError("Impossible de charger le resumé de la Caisse")
        
    }
   }

   const handleOpenSession = async () => {
        try {
           const response = await api.post("/api/cash/shifts/open", {userId: currentUser.id, openingAmount: Number(openingAmount)},
            {headers: { Authorization: `Bearer ${token}` } 
        }) 
        setOpeningAmount("")
        await fetchCashSummary()
        await fetchCashShifts()
    }
    catch(error) {
        console.error("Erreur OOuverture Session", error)
        
    }
    }
   const handleCloseSession = async () => {
        try {
           const response = await api.post("/api/cash/shifts/close", {userId: currentUser.id, closingAmount: Number(closingAmount)},
            {headers: { Authorization: `Bearer ${token}` } 
        }) 
        setClosingAmount("")
        await fetchCashSummary()
        await fetchCashShifts()
    }
    catch(error) {
        console.error("Erreur de fermeture de la  Session", error)
        
    }
    }

   const fetchCashMovements = async () => {

    try {

        const response = await api.get("/api/cash/movements", {
             headers: {
            Authorization: `Bearer ${token}`
              } 
        })
        setMovements(response.data)
        
    } catch (error) {
        console.error("Erreur de la recuperation du resume de la caisse:", error)
        setError("Impossible de charger le mouvement de caisse")
        
    }
   
   }
   const fetchCashShifts = async () => {

    try {

        const response = await api.get("/api/cash/shifts", {
             headers: {
            Authorization: `Bearer ${token}`
              } 
        })
        setShifts(response.data)
        
    } catch (error) {
        console.error("Erreur de la recuperation du resume de la caisse:", error)
        setError("Impossible de charger les sessions")
        
    }
   
   }
   
   
   
   
   const fetchDailyReport = async () => {

    try {
        
        const response = await api.get("/api/cash/reports/daily", {
             headers: {
            Authorization: `Bearer ${token}`
              } 
        })
        setDailyReport(response.data)
        
    } catch (error) {
        console.error("Erreur de la recuperation du rapport jourmnalier:", error)
        setError("Impossible de charger du rapport jourmnalier")
        
    }
   
   }

  useEffect(() => {
   setLoading(true)
    Promise.all([fetchCashSummary(), fetchCashMovements(), fetchCashShifts(),fetchDailyReport(),])
      .finally(() => setLoading(false))
}, [])
     
    const [expandedId, setExpandedId] = useState(null)
const [expandedDetails, setExpandedDetails] = useState(null)

const toggleDetails = async (shiftId) => {
  if (expandedId === shiftId) {
    setExpandedId(null)
    setExpandedDetails(null)
  } else {
    setExpandedId(shiftId)
    try {
      const response = await api.get(`/api/cash/reports/daily?shiftId=${shiftId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
     setExpandedDetails(response.data[0] || null)
    } catch (err) {
      console.error("Erreur chargement détails de la session", err)
    }
  }
}


  return (
      <div className="p-6 space-y-6">
      {/* Résumé caisse */}
      <div className="bg-white rounded-2xl shadow p-4 grid grid-cols-3 gap-6">
        <div>
          <p className="ttext-xl font-bold  text-slate-800">Solde actuel</p>
          <p className="text-xl font-bold">
            {loading? "Chargement..." : summary ? `${summary.currentBalance.toLocaleString("fr-FR")} GNF` : "--"}
          </p>
        </div>
        <div>
          <p className="text-xl font-bold  text-blue-950">SESSION: <span className="text-lg text-black ">{summary?.shift?.status === "OPEN" ? "Ouverte" : "Fermée"}</span></p>

          {summary?.shift?.status !== "OPEN" && (
            <>
          <input
          type="number"
          value={openingAmount}
          onChange={(e) => setOpeningAmount(e.target.value)}
          placeholder="Montant d'ouverture"
          className="border rounded p-2   mt-1 focus:outline-none focus:ring-0"
          />
          <button
           onClick={handleOpenSession}
           className="bg-green-500 text-white mb-1 mt-1 px-4 py-2 rounded"
          >Ouvrir la Sesssion</button>
          </>
          ) }

          {summary?.shift?.status === "OPEN"&& ( <>
          <input
          type="number"
          value={closingAmount}
          onChange={(e) => setClosingAmount(e.target.value)}
          placeholder="Montant de Fermeture"
          className="border rounded mb-1 p-2  mt-1 focus:outline-none focus:ring-0" 
          />
          <button
           onClick={handleCloseSession}
           className="bg-red-500 text-white px-4 py-2 rounded"
          >Fermer la Sesssion</button>
          </>) }

        </div>
        <div>
          <p className="text-lg font-bold  text-blue-950 text-end">CAISSIER: <span className="text-lg text-black ">{summary?.shift?.userId?.name || "--"}</span></p>
          
        </div>
      </div>

      {/* Onglets */}
      <div>
        <div className="flex gap-4 border-b pb-2">
          <button
            onClick={() => setActiveTab("movements")}
            className={`px-3 py-2 rounded ${
              activeTab === "movements"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Mouvements
          </button>
          <button
            onClick={() => setActiveTab("shifts")}
            className={`px-3 py-2 rounded ${
              activeTab === "shifts"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-3 py-2 rounded ${
              activeTab === "reports"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Rapports
          </button>
        </div>


        {/* Contenu des onglets */}
        <div className="mt-4">
          {error && <p className="text-red-500 mb-2">{error}</p>}
          {loading && <p className="text-gray-500 mb-2">Chargement...</p>}

          {activeTab === "movements" && (
            <div className="bg-white rounded-2xl shadow p-4 overflow-auto" >
              <h2 className="text-lg text-center uppercase text-blue-950 font-semibold mb-3">
                Mouvements de caisse
              </h2>
              <table 
              onClick={toggleDetails}
              className="min-w-full border">
                <thead >
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Type</th>
                    <th className="border px-2 py-1">Client</th>
                    <th className="border px-2 py-1">Montant recu</th>
                    <th className="border px-2 py-1">Montant facture</th>
                    <th className="border px-2 py-1">Méthode</th>
                    <th className="border px-2 py-1">Caissier</th>
                    <th className="border px-2 py-1">Date</th>
                  </tr>
                </thead>

                <tbody>
                    {movements.map((m) => ( 
                        <tr key={m.id}>
                        <td className="border px-2 py-1">{m.type} </td>
                        <td className="border px-2 py-1">{ m.customerId?.name || m.relatedSaleId?.customer?.name || "Non Specifié" } </td>
                        <td className="border px-2 py-1">{ m.relatedSaleId?.givenAmount?.toLocaleString("fr-FR") || m.amount?.toLocaleString("fr-FR") || 0} </td>
                        <td className="border px-2 py-1">{m.relatedSaleId?.totalAmount?.toLocaleString("fr-FR") || 0} </td>
                        <td className="border px-2 py-1">{m.method} </td>
                        <td className="border px-2 py-1">{m.userId?.name}</td>
                        <td className="border px-2 py-1">{m.createdAt?  new Date(m.createdAt).toLocaleString("fr-FR") : "-"} </td>
                        </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          

          {activeTab === "shifts" && (
            <div className="bg-white rounded-2xl shadow p-4 overflow-y-auto">
              <h2 className="text-lg font-semibold text-center uppercase text-blue-950 mb-3">Sessions de caisse</h2>
              <table className="min-w-full border">
                <thead >
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Caissier</th>
                    <th className="border px-2 py-1">Fond Intitial</th>
                    <th className="border px-2 py-1">Solde Fin</th>
                    <th className="border px-2 py-1">Statut</th>
                    <th className="border px-2 py-1">Dates</th>
                  </tr>
                </thead>

                <tbody>
                    {shifts.map((s) => (
                        <tr key={s.id}>
                        <td className="border px-2 py-1">{s.userId?.name || s.userId} </td>
                        <td className="border px-2 py-1">{s.openingAmount.toLocaleString("fr-FR")} </td>
                        <td className="border px-2 py-1">{s.closingAmount.toLocaleString("fr-FR") || "-"} </td>
                        <td className="border px-2 py-1">{s.status} </td>
                        <td className="border px-2 py-1">
                          {s.openedAt ? new Date(s.openedAt).toLocaleString("fr-FR") : "--"}
                                                         {" - "}
                          {s.closedAt ? new Date(s.closedAt).toLocaleString("fr-FR") : "En cours..."}
                        </td>
                        </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}



 {activeTab === "reports" && (
  <div className="bg-white rounded-2xl shadow p-4 overflow-auto">
    <h2 className="text-xl text-center uppercase text-blue-900 font-semibold mb-3">Rapports de sessions</h2>
    {loading && <p className="text-gray-500">Chargement...</p>}
    {dailyReport && dailyReport.map((report) => (
      <div key={report.shiftId} className="border-b-8 border-b-blue-500  py-2">
        <table className="min-w-full border overflow-x-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Date </th>
              <th className="border px-2 py-1">Caissier </th>
              <th className="border px-2 py-1">Cash</th>
              <th className="border px-2 py-1">Crédit</th>
              <th className="border px-2 py-1">Chèque </th>
              <th className="border px-2 py-1">Retour</th>
              <th className="border px-2 py-1">Total Enc</th>
              <th className="border px-2 py-1">Total Déc</th>
              <th className="border px-2 py-1">Solde théorique</th>
              <th className="border px-2 py-1">Solde réel</th>
              <th className="border px-2 py-1">Écart</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">{new Date(report.date).toLocaleString("fr-FR")}</td>
              <td className="border px-2 py-1">{report.cashier?.name}</td>
              <td className="border px-2 py-1">{report.totalEspeces?.toLocaleString("fr-FR")}</td>
              <td className="border px-2 py-1">{report.totalCredit?.toLocaleString("fr-FR")}</td>
              <td className="border px-2 py-1">{report.totalCheque?.toLocaleString("fr-FR")}</td>
              <td className="border px-2 py-1">{`-${Math.abs(report.totalRetour).toLocaleString("fr-FR")}` }</td>
              <td className="border px-2 py-1">{report.totalEncaissements?.toLocaleString("fr-FR")}</td>
              <td className="border px-2 py-1">{report.totalDecaissements?.toLocaleString("fr-FR")}</td>
              <td className="border px-2 py-1">{report.soldeTheorique?.toLocaleString("fr-FR")}</td>
              <td className="border px-2 py-1">{report.soldeReel?.toLocaleString("fr-FR")}</td>
              <td className="border px-2 py-1">{report.ecart?.toLocaleString("fr-FR")}</td>
              <td className="border px-2 py-1 text-center">
                <button
                  onClick={() => toggleDetails(report.shiftId)}
                  className="bg-green-500  rounded-lg py-1 px-3 "
                >
                  {expandedId === report.shiftId ? "Masquer" : "Détails"}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {expandedId === report.shiftId && expandedDetails && (
          <div className="mt-2 space-y-1 bg-gray-50 p-2 rounded">
            <p><strong>Fond initial :</strong> {expandedDetails.openingAmount}</p>
          <div>
              <strong>Mouvements :</strong>
              <table className="min-w-full border mt-1">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Type</th>
                    <th className="border px-2 py-1">Client</th>
                    <th className="border px-2 py-1">Montant Recu</th>
                    <th className="border px-2 py-1">Montant</th>
                    <th className="border px-2 py-1">Méthode</th>
                    <th className="border px-2 py-1">Caissier</th>
                    <th className="border px-2 py-1">Date</th>
                  </tr>
                </thead>
                <tbody>
                  { expandedDetails?.movements?.length > 0 ? (
                  expandedDetails.movements.map(m => (
                    <tr key={m.id}>
                      <td className="border px-2 py-1">{m.type}</td>
                      <td className="border px-2 py-1">{ m.customerId?.name || m.relatedSaleId?.customer?.name || "Non Specifié" } </td>
                      <td className="border px-2 py-1">{m.givenAmount?.toLocaleString("fr-FR") || m.amount?.toLocaleString("fr-Fr") || 0}</td>
                      <td className="border px-2 py-1">{m.totalAmount?.toLocaleString("fr-FR") || 0}</td>
                      <td className="border px-2 py-1">{m.method}</td>
                      <td className="border px-2 py-1">{m.userId?.name}</td>
                      <td className="border px-2 py-1">{new Date(m.createdAt).toLocaleString("fr-FR")}</td>

                    </tr>
                  ))) : (
                    <tr>
                     <td colSpan={5} className="text-center text-gray-500">Aucun mouvement</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
)}
        </div>
      </div>
    </div>
  )

}

export default  CashManagement