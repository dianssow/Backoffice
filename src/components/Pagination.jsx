

    const Pagination = ({currentPage, totalPages, onPageChange}) => {
        if(totalPages <= 1) return null
    
  return (
     <div className="flex justify-end gap-2 mt-4">
             <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
               className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Précédent
              </button>

              <span className="px-4 py-1">
                Page {currentPage} sur {totalPages}
              </span>
            
              <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
)
}

export default Pagination