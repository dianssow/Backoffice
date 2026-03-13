function Invoice({ sale,customer, onClose }) {
  if (!sale) return null

  const formatDateTime = (dateString) => {
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
            <p className=" font-medium">Cosa <br/> COMMUNE DE LAMBANYI</p>
            <p>00224 621 60 77 83</p>
         </div>
                       {/* Facture et infos client */}     
        </div>
          <div className="flex justify-between  items-start mb-8">
           <div className="text-center">
            <h2 className="text-3xl font-bold uppercase">FACTURE</h2>
            <p className="text-gray-600 mt-2">
            Type : {sale.paymentType} | Date : {formatDateTime(sale.createdAt)}
            </p>
            <p>N°: {sale.invoiceNumber} </p>
        </div>
          <div className="border  border-gray-300 rounded-md p-4  w-1/2 bg-gray-50">
            <p className="text-2xl font-extrabold">{customer?.name || "-"}</p>
            <p><strong>Adresse :</strong> {customer?.address || "-"}</p>
            <p><strong>Téléphone :</strong> {customer?.number || "-"}</p>
          </div>
          </div>

        

        {/* TABLE PRODUITS */}
        <table className="w-full border-collapse border border-gray-400 mb-10 text-sm">
          <thead>
            <tr>
              <th className=" border-b border-r border-gray-400 p-1 text-left">PRODUIT</th>
              <th className="border-b border-r border-gray-400 p-1 text-center">QTE</th>
              <th className="border-b border-r border-gray-400 p-1 text-center ">PRIX U.</th>
              <th className="border-b  border-gray-400 p-1 text-right">SOUS-TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i}>
                <td className="border-r border-gray-400 ">{item.name}</td>
                <td className="border-r border-gray-400  text-center">{item.quantity}</td>
                <td className=" border-r border-gray-400  text-center">
                  {item.price.toLocaleString("fr-FR")} 
                </td>
                <td className=" border-r  border-gray-400  text-right">
                  {(item.price * item.quantity).toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
           <tfoot>
    <tr>
      <td colSpan={3} className="border-t border-gray-400 p-1 text-right font-semibold">
        TOTAL
      </td>
      <td className="border border-gray-400 p-1 text-right font-semibold">
        {sale.totalAmount.toLocaleString("fr-FR")}
      </td>
    </tr>
    <tr>
      <td colSpan={3} className="p-1 text-right font-semibold">
        AVANCE
      </td>
      <td className="border border-gray-400 p-1 text-right">
        {sale.givenAmount.toLocaleString("fr-FR")}
      </td>
    </tr>
    <tr>
      <td colSpan={3} className="p-1 text-right font-bold">
        NET A PAYER
      </td>
      <td className="border border-gray-400 p-2 text-right font-bold">
        {sale.reste.toLocaleString("fr-FR")}
      </td>
    </tr>
  </tfoot>
        </table>

        {/* Imprimer */}
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

export default Invoice