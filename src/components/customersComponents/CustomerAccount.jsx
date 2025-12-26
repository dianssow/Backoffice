import { useState, useEffect } from "react" 
import api from "../../api"
import Invoice from "../salesComponents/Invoice"
import VersementInvoice from "../salesComponents/VersementInvoice"  
import Pagination from "../Pagination"

function CustomerAccount({ customer, onClose }) {
  const [sales, setSales] = useState([]) 
  const [balance, setBalance] = useState(0) 
  const [selectedSale, setSelectedSale] = useState(null) 
  const [selectedVersement, setSelectedVersement] = useState(null) 
  const [activeTab, setActiveTab] = useState("sales")
  const [versements, setVersements] = useState([])
  const [salesPage, setSalesPage] = useState(1)
  const [versementsPage, setVersementsPage] = useState(1)
  const [limit, setLimit] = useState(8)


 const formatDate = (dateString) => {
  if (!dateString) return ""
  const date = new Date(dateString)

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()

  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

const totalPagesSales = Math.ceil(sales.length / limit)
const totalPagesVersements = Math.ceil(versements.length / limit)

      const currentSales = sales
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice((salesPage - 1) * limit, salesPage * limit)

  const currentVersements = versements
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice((versementsPage - 1) * limit, versementsPage * limit)

  // Reset page on tab switch
  useEffect(() => {
    if (activeTab === "sales") setSalesPage(1)
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

  useEffect(() => {
    if (!customer) return 

    const fetchData = async () => {
      try {
        const salesResponse = await api.get(`/api/sale/customer/${customer.id}`) 
          const customerSales = salesResponse.data.sales || [] 
          setSales(customerSales) 

          const versementsResponse = await api.get(`/api/versement/customer/${customer.id}`)
          const customerVersements = versementsResponse.data.versements || []
          setVersements(customerVersements)
          const customerBalanceResponse = await api.get(`/api/versement/balance/${customer.id}`)   
                setBalance(customerBalanceResponse.data.balance)     
        } catch (error) {
          console.error("Erreur de recuperation du versement :", error)
              
        }
    
        }
       
        fetchData()
     }, [customer]) 

     
   

    



  if(selectedSale) {
        return (
        <Invoice
         sale={selectedSale} 
         customer={customer}
         onClose={() => setSelectedSale(null)} />
      )}
  if(selectedVersement) {
        return (
        <VersementInvoice
         versement={selectedVersement} 
         customer={customer}

         onClose={() => setSelectedVersement(null)} />
      )}


  return (
   <>
    <div className="p-6 bg-white rounded shadow  ">
      
      <button
        onClick={onClose}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 mb-4"
      >
        ← Retour
      </button>

      <h2 className="text-2xl font-bold mb-2">{customer.name}</h2>
      <p className="mb-1"><strong>Adresse:</strong> {customer.address || "-"}</p>
      <p className="mb-1"><strong>Numéro:</strong> {customer.number || "-"}</p>
      <p className="mb-4  text-green-600 font-bold">
        <strong>Balance du compte :</strong> {balance.toLocaleString('fr-FR')}
      </p>
      </div>

      <div>
        <div className="flex gap-4 border-b pb-2">
          <button 
          onClick={() => setActiveTab("sales")}
           className={`px-3 py-2 rounded ${
              activeTab === "sales"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
           Ventes
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

     
     {activeTab === "sales" && (
      <div>
       <h3 className="text-xl font-semibold mb-2">Historique des factures :</h3>
      <table className="w-full border-collapse border border-gray-300">
       <thead>
         <tr className="bg-gray-200">
           <th className="border p-2">Date</th>
           <th className="border p-2">Paiement</th>
           <th className="border p-2">Total</th>
           <th className="border p-2">Avance</th>
           <th className="border p-2">Reste</th>
           <th className="border p-2">Action</th>
         </tr>
       </thead>
       <tbody>
         {currentSales.map((sale) => (
            <tr key={sale.id}>
              <td className="border p-2">{formatDate(sale.createdAt)}</td>
              <td className="border p-2">{sale.paymentType}</td>
              <td className="border p-2">{sale.totalAmount.toLocaleString('fr-FR')}</td>
              <td className="border p-2">{sale.givenAmount.toLocaleString('fr-FR')}</td>
              <td className="border p-2">{sale.reste.toLocaleString('fr-FR')}</td>
              <td className="border p-2">
                <div className="flex flex-wrap gap-3 justify-center">
                <button 
                onClick={() => setSelectedSale(sale)}
                  className="px-3 py-1 justify-center items-center bg-green-500 rounded hover:bg-green-600"
                >
                  Afficher                
                </button>
                </div>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
  currentPage={salesPage}
  totalPages={ totalPagesSales}
  onPageChange={(newPage) => setSalesPage(newPage)}
/>
      </div>
      )}

     {activeTab === "versements" && (
      <div>
       <h3 className="text-xl font-semibold mb-2">Historique des Versements:</h3>
          <table className=" w-full border-collapse border border-gray-300 ">
                <thead>
                    <tr className="bg-gray-200">
                        <th  className="w-2 border  p-2">N°</th>
                        <th className=" border  p-2">Date</th>
                        <th className=" border  p-2">Montant</th>
                        <th className="  border  p-2">Motif</th>
                        <th className="  border  p-2">Action</th>
                    </tr>
                </thead>
                
                <tbody>
                { currentVersements.map((versement) => (
                    <tr  key={versement.id}>
                        <td className="border items-center justify-center p-1">{versement.versementNumber} </td>
                        <td className="border p-2">{formatDate(versement.createdAt)}</td>
                        <td className="border p-2 ">{versement.amount.toLocaleString('fr-FR')}</td>
                        <td className="border p-2 text-center">{versement.motif}</td>
                        <td className="border p-2" >
                            <div className="flex flex-wrap gap-3 justify-center">
                            <button
                            onClick={() => setSelectedVersement(versement)}
                            className="px-3 py-1  bg-green-500 rounded  hover:bg-green-600">Afficher</button>
                           </div>
                        </td>
                    </tr>
                    ))}
                    

              
                </tbody>
                
                
            </table>
            <Pagination
             currentPage={versementsPage}
             totalPages={ totalPagesVersements}
             onPageChange={setVersementsPage}
            />
      </div>
     ) }


    
    
    
    </>
    
  )
}

export default CustomerAccount 