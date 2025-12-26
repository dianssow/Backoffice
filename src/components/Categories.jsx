import { useEffect, useState } from "react"
import { useSelector} from 'react-redux'
import Pagination from "./Pagination"
import api from '../api'
function Categories() {

    const[categories, setCategories] = useState([])
    const[categoryName, setCategoryName] = useState("")
    const[open, setOpen] = useState(false)
    const[editCategory, setEditCategory] = useState(null)
    const[confirmDelete, setConfirmDelete]  = useState(false)
    const[message, setMessage]  = useState(false)
    const[messageType, setMessageType]  = useState("success")
    const[selectedCat, setSelectedCat]  = useState(null)
    const[inputError, setInputError] = useState("")
    const [filteredCategories , setFilteredCategories ] = useState([])
    const [viewCategory , setViewCategory ] = useState(null)
    const [limit, setLimit] = useState(8)
    const [currentPage, setCurrentPage] = useState(1)
    const[productsByCategory, setProductsByCategory] = useState([])
    const [productPage, setProductPage] = useState(1)
    const [productLimit, setProductLimit] = useState(8)
     const [formData, setFormData] = useState({
     categoryName: "",
     image: null,
     })


    const token = useSelector((state) => state.loginPage.token)

        
    const productStartIndex = (productPage - 1) * productLimit
    const currentProducts = productsByCategory.slice(productStartIndex, productStartIndex + productLimit)
    const totalProductsPages = Math.ceil(productsByCategory.length / limit)

     const startIndex = (currentPage - 1) * limit
    const currentCategories  = filteredCategories.slice(startIndex, startIndex + limit)
    const totalCategoriesPages = Math.ceil(filteredCategories.length / limit)


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
    

    const fetchCategories = async () => {
        try {
             const response = await api.get("/api/category", {
        headers: {
            Authorization: `Bearer ${token}`
              } 
            })
        setCategories(response.data.categories || [])
        setFilteredCategories(response.data.categories || [])

        } catch (error) {
        console.error("Erreur d'ajout de la categorie :", error);
            
        }
    }
    useEffect (() => {
    fetchCategories()
 }, [])
         
 const askDelete = (Cat) => {
            setSelectedCat(Cat)
            setConfirmDelete(true)
        }

        //SUPPRESSION CATEGORIE
     const handleDelete = async() => {
        if(selectedCat){
            try {
             const response = await api.delete(`/api/category/${selectedCat.id}`, {
        headers: {
            Authorization: `Bearer ${token}`
              } 
            })
            if(response.data.success) {
                setMessage("Categorie supprimée avec succès")
                setMessageType("success")
                fetchCategories()
            }
            else {
                setMessage("Erreur lors de la  suppression de la catégorie")
                setMessageType("error")
                console.error("erreur de suppression de la catégorie");
                
            }
                
            } catch (error) {
                console.error("erreur de suppression de la catégorie");
                setMessage("Erreur serveur")
                setMessageType("error")
            }
            finally {
                setConfirmDelete(false)
                setSelectedCat(null)

                 setTimeout(() => {
              setMessage("");
                 }, 3000);
            }
        }

     }
 


                  // Ajout CATEGORIES------------------------------------------
     const handleSubmit = async (e) => {
     e.preventDefault();

    try {
         
        const data = new FormData()
        data.append("categoryName", formData.categoryName)
        if (formData.image instanceof File) {
            data.append("image", formData.image)
          }
        const apiConfig = { headers: {
              Authorization: `Bearer ${token}`, 
            "Content-Type": "multipart/form-data"
            } };

        const response = editCategory
            ? await api.put(`/api/category/${editCategory}`, data, apiConfig)
            : await api.post("/api/category/add", data, apiConfig);

          if (response?.data?.success === false) {
            setInputError(response?.data?.message || "❌ Catégorie existe déjà")
           } else {
            fetchCategories()
            
        //     setCategories(prevCategories => editCategory
        //     ? [response.data, ...prevCategories.filter(cat => cat.id !== editCategory)]
        //     : [response.data, ...prevCategories]
        //    )

            setMessage(editCategory
                ? "✅ Catégorie éditée avec succès"
                : `✅ Catégorie "${formData.categoryName}" ajoutée avec succès`
            )
            setMessageType("success")
            setFormData({
                 categoryName: "", 
                 image: null 
                })
            setEditCategory(null)
            setOpen(false)
        }
    } catch (error) {
        const backendMessage = error.response?.data?.message || "❌ Erreur serveur";
        setInputError(backendMessage)

        if (!error.response || error.response.status >= 500) {
            console.error("Erreur inattendue :", error)
        }
    } finally {
        setTimeout(() => {
            setMessage("");
        }, 3000);
    }
}
         const handleViewProducts = async (categoryId) => {
      try {
         const response = await api.get(`/api/product/category/${categoryId}`, {
         headers: { Authorization: `Bearer ${token}` }
         })
         setProductsByCategory(response.data.products)
         setViewCategory(categoryId)
         setProductPage(1)
       } catch (error) {
         console.error("Erreur récupération des produits :", error)
       }
       }

    const handleEdit = async(cat) => {
        setEditCategory(cat.id)
        setFormData({
            categoryName: cat.categoryName,
            image: null
        })
        setOpen(true)
    }    
    
    const handleSearch = (e) => {
       const value = e.target.value.toLowerCase()
       const filtered = categories.filter((cat) => 
       cat.categoryName.toLowerCase().includes(value) 
            )

             setFilteredCategories(filtered)
             setCurrentPage(1)
             }   

    

    
  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
          <h1 className="text-2xl font-bold">Gestion Des Catégories</h1>
        <div className="flex justify-between items-center">
            <input
            onChange={handleSearch}
            className="border p-1 bg-white rounded px-4"
            type="text" placeholder="Rechercher" />
             <button 
            onClick={() =>{ setOpen(true)
                setEditCategory(null)
                setCategoryName("")
            }}
            className="px-3 py-2 bg-blue-600 text-black rounded-lg cursor-pointer hover:bg-blue-700 transition">New Catégorie</button>
            </div>
     <div>
        {message && 
        <div className="fixed inset-0 text-3xl flex items-center justify-center ">
         <div className={` rounded-xl ${messageType === "success" ? " bg-green-200 text-green-800" : "bg-red-200 text-red-800"} `} >{message}</div>
        </div>
        }

           {confirmDelete && selectedCat && (
        <div className="fixed inset-0 flex items-center justify-center ">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
            <p className="text-white text-2xl mb-4">Voulez-vous supprimer cette catégorie <br /> 
            <span className="text-green-400"> {selectedCat.categoryName} ??</span></p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(selectedCat)}
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

       {!viewCategory ? ( 
         <>
            <table className=" w-full  border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="w-5 border border-gray-200 ">N°</th>
                        <th className="w-1/6 border border-gray-200 p-2">Image</th>
                        <th className="w-2/6 border border-gray-200 p-2">Categorie</th>
                        <th className="w-3/6 border border-gray-200 p-2">Action</th>
                    </tr>
                </thead>
                    
                <tbody>
                
               { currentCategories.map((cat, index) => (
                    <tr  key={cat.id || index}>
                        <td className="border items-center justify-center border-gray-200 p-1">{startIndex + index + 1}</td>
                       <td className="border flex justify-center border-gray-200 p-2">
                          {cat.image ? (
                              <img
                                  src={
                                      cat.image.startsWith("data:") 
                                      ? cat.image 
                                      : `${import.meta.env.VITE_API_URL}/${cat.image}`
                                  }
                                  alt="categorie"
                                  className="w-11 h-11 rounded-4xl object-cover"
                              />
                          ) : (
                              "-"
                          )}
                      </td>
                        <td className="border border-gray-200 p-2">{cat.categoryName}</td>
                        <td className="border border-gray-200 p-2" >
                            <div className="flex flex-wrap gap-3 justify-end">
                            <button 
                            onClick={() => {
                                handleEdit(cat)
                                setOpen(true)
                            }}
                            className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300">Editer</button>
                            <button 
                            onClick={() => handleViewProducts (cat.id)}
                            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700">Visionner</button>
                            <button
                            onClick={() => askDelete(cat)}
                            className="px-3 py-1 bg-red-500 rounded hover:bg-red-600">Supprimer</button>
                            </div>
                        </td>
                    </tr>

                 ))}
                 
              
                </tbody>
                
            </table>
            <Pagination
           currentPage={currentPage}
            totalPages={totalCategoriesPages}
            onPageChange={setCurrentPage}
              />
            </>
            
       ) : ( 
         
        <>
        <button
      onClick={() => setViewCategory(null)} 
      className="mb-4 px-3 py-2 bg-gray-500 text-white rounded"
    >
      ← Retour aux catégories
    </button>
         <table className=" w-full border-collapse border border-gray-300 mt-4" >
                <thead>
                    <tr className="bg-gray-200">
                        <th  className="w-2 border border-gray-100 p-2">N°</th>
                        <th className=" border border-gray-100 p-2">Image</th>
                        <th className=" border border-gray-100 p-2">Nom du Produit</th>
                        <th className=" border border-gray-100 p-2">Stock </th>
                        <th className=" border border-gray-100 p-2">Prix en détail </th>
                        <th className=" border border-gray-100 p-2">Prix en gros</th>
                    </tr>
                </thead>
                
                <tbody>
                  {currentProducts.map((product, index) => (
         <tr  key={product.id || index}>
                        <td className="border items-center justify-center border-gray-200 p-1">{productStartIndex + index + 1}</td>
                       <td className="border flex justify-center border-gray-200 p-2">
                          {product.image ? (
                              <img 
                                  src={
                                      product.image.startsWith('data:') 
                                      ? product.image 
                                      : `${import.meta.env.VITE_API_URL}/${product.image}`
                                  } 
                                  alt={product.name} 
                                  className="w-11 h-10 rounded-4xl object-cover" 
                              />
                          ) : (
                              "-"
                          )}
                      </td>
                        <td className="border border-gray-200 p-2">{product.name}</td>
                        <td className="border border-gray-200 p-2">
                            <span>
                                {product.stock > 2? ( <span className="text-green-400">{product.stock}</span> ) : (
                                    <span className="text-red-400">{product.stock}</span>
                                )}
                            </span>
                             </td>
                        <td className="border border-gray-200 p-2">{product.retailPrice?.toLocaleString('fr-FR') || '-'}</td>
                        <td className="border border-gray-200 p-2">{product.wholesalePrice?.toLocaleString('fr-FR') || '-'}</td>
                        
                    </tr>
                   ))}
        
                </tbody>
            </table>
            <Pagination
            currentPage={productPage}
            totalPages={totalProductsPages}
            onPageChange={setProductPage}
              />
           
            </>
       ) }
            
      

            

            
        
            <p className="p-4 text-center text-gray-500">
              { filteredCategories.length === 0
             ? (categories.length === 0 
             ? "Aucun Catégorie ajoutée" 
             : "Aucune Cateégorie trouvée")
             : null
             }
           </p>
           

    

    {open && (
       <>
        <div className=" fixed inset-0 bg-slate-700/10  items-center justify-center">
            <div className="fixed inset-0 flex items-center justify-center z-50">
        <div 
        onClick={e => e.stopPropagation()}
        className="bg-slate-800 p-6 rounded-lg shadow-lg w-84"
        >
        <h2 className="text-lg text-white text-center uppercase font-bold mb-4"> {editCategory ? "Editer une catégorie" : "Ajouter une catégorie" } </h2>
        <form onSubmit={handleSubmit}>
        <input
         type="file"
         accept="image/*"
         onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
         className="text-white border p-2 rounded"
        />
        <input  
        name="categoryName"
        type="text"
        placeholder="Nom de la catégorie"
        value={formData.categoryName}
        onChange={(e) => setFormData({...formData, categoryName: e.target.value })}
        className="w-full text-white border rounded p-2 mb-4 focus:outline-none focus:ring-0"
        />
           
       {inputError && (
        <p className="text-red-600 text-xl mb-4 "> {inputError} </p>
       )}
        <div className="flex justify-end space-x-2">
            
        <button 

         onClick={() => { setOpen(false)
         setEditCategory(null)
         setCategoryName("")
         setInputError("")
        }}
        className="px-4 py-2 bg-gray-300 text-white rounded hover:bg-gray-400 ">Annulez</button>
        <button 
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700  "> {editCategory ? "Confirmer" : "Validez" }</button>
        </div>
    </form>
        </div>
        </div>
        </div>
        </>
    )}
    </div>
  )
}
export default Categories