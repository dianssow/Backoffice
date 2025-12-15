import { useState, useEffect} from "react"
import { useSelector} from "react-redux"
import Pagination from "./Pagination"
import api from   "../api"


function Products() {

    const[openModal, setOpenModal] = useState(false)
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [editProduct, setEditProduct] = useState(false)
    const[confirmDelete, setConfirmDelete]  = useState(false)
    const[selectedProduct, setSelectedProduct] = useState(null)
    const [filteredProducts, setFilteredProducts] = useState([])
    const [limit, setLimit] = useState(8)
    const [currentPage, setCurrentPage] = useState(1)

    const token = useSelector((state) => state.loginPage.token)
    const [formData, setFormData] = useState({
        image:"",
        name: "",
        stockCartons: "",
        piecesPerCarton:"",
        retailPrice: "",
        wholesalePrice: "",
        categoryId:"",
        featured: false
    })
    const startIndex = (currentPage - 1) * limit
    const currentProducts = filteredProducts.slice(startIndex, startIndex + limit)
    const totalPages = Math.ceil(filteredProducts.length / limit)


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
        return() => window.removeEventListener("resize", handleResize)
    }, [])

      const fetchCategories = async () => {
        try {
             const response = await api.get("/api/category", {
        headers: {
            Authorization: `Bearer ${token}`
              }
            })
            if(response.data.success ) {
            setCategories(response.data.categories || [])
            }
        } catch (error) {
        console.error("Erreur de creation de la catégorie :", error);

        }
    }

    // Fetch et Show Produits
    const fetchProducts = async () => {
        try {
             const response = await api.get("/api/product", {
        headers: {
            Authorization: `Bearer ${token}`
              }
            })
            if(response.data.success ) {
            setProducts(response.data.products || [])
            setFilteredProducts(response.data.products || [])

            }
        } catch (error) {
        console.error("Erreur de creation du produit :", error);

        }
    }
     useEffect(() => {
            fetchProducts()
            fetchCategories()
        }, [])

   const handleSubmit = async (e) => {
    e.preventDefault()


    try {

        const data = new FormData()
          data.append("name", formData.name)
          data.append("stockCartons", Number(formData.stockCartons))
          data.append("piecesPerCarton", Number(formData.piecesPerCarton))
          data.append("retailPrice", Number(formData.retailPrice))
          data.append("wholesalePrice", Number(formData.wholesalePrice))
          data.append("categoryId", formData.categoryId)
          data.append("featured", formData.featured)
          if (formData.image instanceof File) {
            data.append("image", formData.image)
          }

        const apiConfig = {
            headers: { Authorization: `Bearer ${token}` },
            "Content-Type": "multipart/form-data"
        };
        if (!formData.categoryId) {
        alert("Veuillez choisir une catégorie !");
        return;
}

        const response = editProduct
            ? await api.put(`/api/product/${editProduct}`, data, apiConfig)
            : await api.post("/api/product/add", data, apiConfig)
        if (response?.data?.success) {
            fetchProducts()
            setOpenModal(false)
            setFormData({
                 image: "",
                 name: "",
                 stockCartons: "",
                 piecesPerCarton: "",
                 retailPrice: "",
                 wholesalePrice: "",
                 categoryId: "",
                 featured: false
             });
            setEditProduct(false)
        } else {
            console.error("Erreur côté serveur :", response?.data?.message)
        }
    } catch (error) {
        if (error.response) {
            console.error("Erreur serveur :", error.response.data)
        } else if (error.request) {
            console.error("Pas de réponse du serveur :", error.request)
        } else {
            console.error("Erreur Api :", error.message)
        }
    }
}

const toggleFeatured = async (productId, currentStatus) => {
  try {
    const response = await api.put(
      `/api/product/${productId}/featured`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      fetchProducts(); // rafraîchit la liste
    }
  } catch (error) {
    console.error("Erreur lors du changement de statut featured :", error);
  }
};

     const handleChange = (e) => {
        const {name, value, files, type, checked} = e.target
    setFormData((prevData) => ({
        ...prevData,
        [name]: type === "checkbox" ? checked :  (files ? files[0]: value),
    }))
}

      const handleEdit = async(product) => { setFormData({
        image: product.image || "",
        name: product.name || "",
        stockCartons:  product.stockCartons || "",
        piecesPerCarton:  product.piecesPerCarton || "",
        retailPrice: product.retailPrice || "",
        wholesalePrice: product.wholesalePrice || "",
        categoryId: product.categoryId ? product.categoryId.id : "" ,
        featured: product.featured || false
        })
        setEditProduct(product.id)
        setOpenModal(true)
    }


         const askDelete = (Product) => {
                    setSelectedProduct(Product)
                    setConfirmDelete(true)
                }

                //SUPPRESSION CATEGORIE
             const handleDelete = async() => {
                if(selectedProduct){
                    try {
                     const response = await api.delete(`/api/product/${selectedProduct.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                      }
                    })
                    if(response.data.success) {
                        fetchProducts()
                    }
                    else {
                        console.error("erreur de suppression du Produit");

                    }

                    } catch (error) {
                        console.error("erreur de suppression du Produit");
                    }
                    finally {
                        setConfirmDelete(false)
                        setSelectedProduct(null)
                    }
                }

             }


             const handleSearch = (e) => {
                const value = e.target.value.toLowerCase()
                const filtered = products.filter((product) =>
             product.name.toLowerCase().includes(value)
            )

             setFilteredProducts(filtered)
             setCurrentPage(1)
             }



  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
          <h1 className="text-2xl font-bold">Gestion Des Produits</h1>
        <div className="flex justify-between items-center">
            <input
            onChange={handleSearch}
            className="border p-1 bg-white rounded px-4"
            type="text" placeholder="Rechercher" />
            <button
            onClick={() => setOpenModal(true)}
            className="px-3 py-2 bg-blue-600 text-black rounded-lg cursor-pointer hover:bg-blue-700 transition">New Produit</button>
            </div>


              {confirmDelete && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center ">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
            <p className="text-white text-2xl mb-4">Voulez-vous definitivement supprimer ce Client <br />
            <span className="text-green-400"> {selectedProduct.name} ??</span></p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(selectedProduct)}
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


             <table className=" w-full border-collapse border border-gray-300 mt-4" >
                <thead>
                    <tr className="bg-gray-200">
                        <th  className="w-2 border border-gray-100 p-2">N°</th>
                        <th className=" border border-gray-100 p-2">Image</th>
                        <th className=" border border-gray-100 p-2">Nom du Produit</th>
                        <th className=" border border-gray-100 p-2">Stock </th>
                        <th className=" border border-gray-100 p-2">Prix en détail </th>
                        <th className=" border border-gray-100 p-2">Prix en gros </th>
                        <th className=" border border-gray-100 p-2">Catégorie</th>
                        <th className=" border border-gray-100 p-2">Accueil</th>
                        <th className="  border border-gray-100 p-2">Action</th>
                    </tr>
                </thead>

                <tbody>

               {currentProducts.map((product, index) => (
                    <tr  key={product.id || index}>
                        <td className="border items-center justify-center border-gray-200 p-1">{startIndex + index + 1}</td>
                        <td className="border flex justify-center border-gray-200 p-2">
                            {product.image ? (  <img src={`${import.meta.env.VITE_API_URL}/${product.image}`} alt={product.name} className="w-11 h-10 rounded-4xl object-cover" />) : (
                                "-"
                            )}
                        </td>
                        <td className="border border-gray-200 p-2">{product.name}</td>
                        <td className="border border-gray-200 p-2">
                            <span>
                                {product.stockCartons > 2? ( <span className="text-green-400">{product.stockCartons}</span> ) : (
                                    <span className="text-red-400">{product.stockCartons}</span>
                                )}
                            </span>
                             </td>
                        <td className="border border-gray-200 p-2">{product.retailPrice?.toLocaleString('fr-FR') || '-'}</td>
                        <td className="border border-gray-200 p-2">{product.wholesalePrice?.toLocaleString('fr-FR') || '-'}</td>
                        <td className="border border-gray-200 p-2">{product.categoryId ? product.categoryId.categoryName : "—"} </td>
                        <td className="border border-gray-200 p-2 text-center">
                        <button
                        onClick={() => toggleFeatured(product.id, product.featured)}
                         className={`px-2 py-1 rounded ${
                          product.featured ? "bg-green-500 text-white" : "bg-gray-300 text-black"
                          }`}
                         >
                      {product.featured ? " ✅ Oui" : "✘ Non"}
                      </button>
                      </td>
                        <td className="border border-gray-200 p-2" >
                            <div className="flex flex-wrap gap-3 justify-end">
                            <button
                            onClick={() => handleEdit(product)}
                            className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300">Modifier</button>
                            <button className="px-3 py-1 bg-green-600 rounded hover:bg-green-700">Visionner</button>
                            <button
                            onClick={() => askDelete(product)}
                            className="px-3 py-1 bg-red-500 rounded hover:bg-red-600">Supprimer</button>
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
              {filteredProducts.length === 0
             ? (products.length === 0
             ? "Aucun produit ajouté"
             : "Aucun produit trouvé")
             : null
             }
           </p>


                 { openModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-slate-700/10   flex justify-center items-center ">
            <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-800 p-4 rounded-lg w-[45%] relative">
            <h1 className="text-xl text-white text-center uppercase font-bold"> {editProduct ? "Modifier le Produit" : "Ajouter un Produit"} </h1>

             <form
             onSubmit={handleSubmit}
             className="flex flex-col gap-4 mt-4" >
                <button
                onClick={() => {setOpenModal(false)
                     setFormData({
                 image:"",
                 name: "",
                 stockCartons: "",
                 piecesPerCarton:"",
                 retailPrice: "",
                 wholesalePrice: "",
                 categoryId: ""
             }) }
                }
                className="text-red-500 font-bold rouded  absolute top-4 right-4 text-lg cursor-pointer">X</button>
                <input
                  name="image"
                  type="file"
                  accept="image"
                  onChange={(e) => setFormData({...formData, image:e.target.files[0]})}
                  placeholder="Image"
                  className=" text-white font-bold border p-1  rounded px-4 focus:outline-none focus:ring-0"
                  />
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                 placeholder="Nom du Produit"
                 className=" text-white font-bold border p-1  rounded px-4 focus:outline-none focus:ring-0"
                />
                <div className="flex w-full">
                 <input
                   name="stockCartons"
                   value={formData.stockCartons}
                   min="0"
                   onChange={handleChange}
                   type="number"
                   placeholder="Stock Cartons"
                   className=" text-white w-[50%] font-bold border mr-1 p-1 rounded px-4  focus:outline-none focus:ring-0"
                 />
                 <input
                   name="piecesPerCarton"
                   value={formData.piecesPerCarton}
                   min="0"
                   onChange={handleChange}
                   type="number"
                   placeholder="Nombres Pièces"
                   className=" text-white font-bold border w-[50%] p-1 rounded px-4 focus:outline-none focus:ring-0"
                 />
                 </div>
                 <div className="flex w-full">
                  <input
                  name="retailPrice"
                  value={formData.retailPrice}
                  onChange={handleChange}
                  type="number"
                  placeholder="Prix en détail"
                  className="w-[50%] text-white font-bold border  mr-1 p-1 rounded px-4 focus:outline-none focus:ring-0 "
                />
                  <input
                  // name="retailPrice"
                  // value={formData.retailPrice}
                  // onChange={handleChange}
                  type="number"
                  placeholder="Prix limite"
                  className="w-[50%] text-white font-bold border p-1 rounded px-4 focus:outline-none focus:ring-0 "
                />
                </div>

                <div className="flex w-full">
                <input
                  name="wholesalePrice"
                  value={formData.wholesalePrice}
                  onChange={handleChange}
                  type="number"
                  placeholder="Prix en gros"
                  className="w-[50%] text-white font-bold border  mr-1 p-1 rounded px-4 focus:outline-none focus:ring-0 "
                  />
                <input
                  name="wholesalePrice"
                  // value={formData.wholesalePrice}
                  // onChange={handleChange}
                  type="number"
                  placeholder="Prix limite"
                  className="w-[50%] text-white font-bold border p-1 rounded px-4 focus:outline-none focus:ring-0 "
                  />
                  </div>

                <label className="flex text-white font-bold items-center gap-2">
                <input
                 type="checkbox"
                 name="featured"
                 checked={formData.featured}
                 onChange={handleChange}
                />
                Produit en accueil
                </label>


                <div className="w-full border" >
                    <select
                    name="categoryId"
                    value={formData.categoryId || ""}
                    onChange={handleChange}
                    className="w-full p-2 bg-blue-600 text-white ">
                        <option  value="">Choisir une Catégorie</option>
                        {categories && categories.map((category) => {
                            return (
                            <option className="text-white bg-slate-800 " key={category.id} value={category.id} >{category.categoryName} </option>
                       )
                        })}
                    </select>
                </div>



               {/* {inputError && (
        <p className="text-red-600 text-xl mb-4 "> {inputError} </p>
       )} */}
        <div className="flex justify-end space-x-2">

        <button
         onClick={() => {setOpenModal(false)
             setFormData({
                 image: "",
                 name: "",
                 stockCartons: "",
                 piecesPerCarton:"",
                 retailPrice: "",
                 wholesalePrice: "",
                 categoryId: ""
             }) }
         }
        className="px-4 py-2 bg-gray-300 text-white rounded hover:bg-gray-400 ">Annulez</button>
        <button

        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700  "> {editProduct ? "Modifier" : "Ajouter"}</button>
        </div>
             </form>
            </div>
        </div>
     )}

    </div>
  )
}
export default Products