function CustomerStatement({ statement, customer, onClose }) {
  if (!statement || !customer) return null

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    })
  }

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("fr-FR")

  return (
    <div className="fixed inset-0 bg-slate-700 bg-opacity-40 flex items-center justify-center print:static print:bg-white print:shadow-none print:overflow-visible z-50">
      <div className="bg-white w-[900px] max-h-screen overflow-y-auto p-10 rounded-lg shadow-lg print-area print:shadow-none print:p-10 print:w-full print:h-auto print:rounded-none print:max-h-none print:overflow-visible">
        
        <div className="flex justify-between items-start mb-12 border-b border-gray-400 pb-4">
          <div>
            <h1 className="text-4xl text-slate-800 font-serif">GAP DISTRIBUTION</h1>
            <p className="font-medium">Cosa <br /> COMMUNE DE LAMBANYI</p>
            <p>00224 621 60 77 83</p>
          </div>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold uppercase">RELEVÉ DE COMPTE</h2>
            <p className="text-gray-600 mt-2">
              Période : {formatDateTime(statement.period?.from)} - {formatDateTime(statement.period?.to)}
            </p>
          </div>

          <div className="border border-gray-300 rounded-md p-4 w-1/2 bg-gray-50">
            <p className="text-2xl font-extrabold">{customer?.name || "-"}</p>
            <p><strong>Adresse :</strong> {customer?.address || "-"}</p>
            <p><strong>Téléphone :</strong> {customer?.number || "-"}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-gray-400 mb-10 text-sm statement-table">
          <thead>
            <tr>
              <th className="border-b border-r border-gray-400 p-2 text-left">DATE</th>
              <th className="border-b border-r border-gray-400 p-2 text-left">TYPE</th>
              <th className="border-b border-r border-gray-400 p-2 text-left">RÉFÉRENCE</th>
              <th className="border-b border-r border-gray-400 p-2 text-right">Total</th>
              <th className="border-b border-r border-gray-400 p-2 text-right">Verser</th>
              <th className="border-b border-gray-400 p-2 text-right">SOLDE</th>
            </tr>
          </thead>

          <tbody>
            {statement.movements?.map((mvt) => (
              <tr key={mvt.id}>
                <td className="border-r border-b border-gray-300 p-2">
                  {formatDateTime(mvt.date)}
                </td>
                <td className="border-r border-b border-gray-300 p-2">
                  {mvt.type}
                </td>
                <td className="border-r border-b border-gray-300 p-2">
                  {mvt.reference}
                </td>
                <td className="border-r border-b border-gray-300 p-2 text-right">
                  {mvt.debit ? formatAmount(mvt.debit) : "-"}
                </td>
                <td className="border-r border-b border-gray-300 p-2 text-right">
                  {mvt.credit ? formatAmount(mvt.credit) : "0"}
                </td>
                <td className="border-b border-gray-300 p-2 text-right font-medium">
                  {formatAmount(mvt.runningBalance)}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={5} className="border-t border-gray-400 p-2 text-right font-bold">
                SOLDE FINAL
              </td>
              <td className="border border-gray-400 p-2 text-right font-bold">
                {formatAmount(statement.finalBalance)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="flex bg-white justify-between mt-6 bottom-0 py-4 no-print">
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
            Imprimer / Enregistrer PDF
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerStatement