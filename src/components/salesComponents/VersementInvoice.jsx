function VersementInvoice({ versement,customer, onClose, }) {

  if (!versement) return null

  const formatDate= (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-700 bg-opacity-40 flex items-center justify-center print:static print:bg-white  print:shadow-none print:overflow-visible z-50">
      <div className="bg-white w-[800px] max-h-screen overflow-y-auto p-10 rounded-lg shadow-lg print-area print:shadow-none print:p-10 print:w-full print:h-auto print:rouded-none print:max-h-none print:overflow-visible">
        
        <div className="flex justify-between items-start mb-12 border-b border-gray-400 pb-4">
          <div>
            <h1 className="text-4xl text-slate-800 font-serif">GAP DISTRIBUTION</h1>
            <p className=" font-medium">COSA <br/> COMMUNE DE LAMBANYI</p>
            <p>00224 623 75 23 44</p>
         </div>      
        </div>
          <div className="flex justify-between  items-start mb-8">
           <div className="text-center">
            <h2 className="text-3xl font-bold uppercase">Versement</h2>
            <p className="text-gray-600 mt-2">
             Date : {formatDate(versement.createdAt)}
            </p>
            <p>N°: {versement.versementNumber} </p>
        </div>
          <div className="border  border-gray-300 rounded-md p-4  w-1/2 bg-gray-50">
            <p className="text-2xl font-extrabold">{versement.customer?.name || "-"}</p>
            <p><strong>Adresse :</strong> {versement.customer?.address || "-"}</p>
            <p><strong>Téléphone :</strong> {versement.customer?.number || "-"}</p>
          </div>
          </div>

          
        <div className="text-center mb-10">
        
        <table className="w-full border-collapse border border-gray-400 mb-10 text-sm">
          <thead>
            <tr>
             <th className=" border-b border-r border-gray-400 p-2 text-center">type</th>
             <th className=" border-b border-r border-gray-400 p-2 text-center" >Montant</th>
             <th className=" border-b border-r border-gray-400 p-2 text-center">Motif</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r border-gray-400 p-2 ">VERSEMENT</td>
              <td className="border-r border-gray-400 p-2 ">{versement.amount.toLocaleString("fr-FR")} GNF</td>
              <td className="border-r border-gray-400 p-2 w-2/4 ">{versement.motif || "--"}</td>
            </tr>
          </tbody>
        </table>
          

          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-700">Nouveau Solde:</h4>
            <p className="text-2xl font-bold text-blue-800 mt-1">
              {versement?.balanceAfter?.toLocaleString("fr-FR")} GNF
            </p>
          </div>
        </div>

        <div className="flex bg-white justify-between mt-6  bottom-0 py-4 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Fermer
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Imprimer
          </button>
        </div>
      </div>
    </div>
  )
}

export default VersementInvoice