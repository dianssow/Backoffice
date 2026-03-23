import { NavLink } from "react-router-dom"
import {FaHome,FaTable,FaBox,FaCashRegister,FaHandHoldingUsd,FaShoppingCart ,FaUsers,FaUser,FaSignOutAlt, FaTruck} from "react-icons/fa"
function Sidebar() {

    const menuItems = [
        {name: "Produits",path:"/dashboard/products",icon: <FaBox />, isParent: false},
        {name: "Clients",path:"/dashboard/customers",icon: <FaUsers />, isParent: false},
        {name: "Ventes",path:"/dashboard/sales",icon: <FaShoppingCart />, isParent: false},
        {name: "Versements",path:"/dashboard/versement",icon: <FaHandHoldingUsd />, isParent: false},
        {name: "Cash Management",path:"/dashboard/cashManagement",icon: <FaCashRegister />, isParent: false},
        {name: "Utilisateurs",path:"/dashboard/users",icon: <FaUser />, isParent: false},
        {name: "Categories",path:"/dashboard/categories",icon: <FaTable  />, isParent: false},
        {name: "Fournisseurs",path:"/dashboard/supplier",icon: <FaTruck />, isParent: false},
        {name: "Deconnexion",path:"/dashboard/logout",icon: <FaSignOutAlt />, isParent: false},
    ]

  return (
    <div className=" flex flex-col h-screen p-3 bg-slate-800 text-white w-16 md:w-64 fixed ">
        <div className="h-16 flex flex-items justify-center">
            <span className="hidden md:block text-xl font-serif tracking-wide">GAP DISTRIBUTION</span>
            <span className="md:hidden text-xl font-bold">GAPD</span>
        </div>

        <div>
            <ul className="space-y-2 p-2">
                {menuItems.map((item) =>{
                    return(
                    <li key={item.name}>
                        <NavLink
                         className= {({isActive}) => (isActive ? " bg-gray-400 justify-center " : "") + "flex items-center p-2 justify-center  text-gray-900 rounded-lg hover:bg-gray-400 transition duration-200 md:justify-start"}
                        to={item.path}>
                           <span className="  text-white text-xl">{item.icon}</span>
                           <span className="text-white ml-4 hidden md:block">{item.name}</span>
                        </NavLink>

                    </li>
                    )
                })}
            </ul>
        </div>
    </div>
  )
}
export default Sidebar