import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import LoginPage from "./components/pages/LoginPage"
import Dashboard from './components/pages/Dashboard'
import Categories from './components/Categories'
import Customers from './components/customersComponents/Customers'
import Products from './components/Products'
import Logout from './components/Logout'
import Users from './components/Users'
import Sales from './components/salesComponents/Sales'
import CashManagement from './components/cashManagement/CashManagement'
import Versement from './components/salesComponents/Versement'


function App() {
  

  return (
   <Router>
    <Routes>
      <Route path="/" element={<LoginPage/>}></Route>
       <Route path="/dashboard" element={<Dashboard/>}>
       <Route 
       index
       element={<Sales />}
       />
       
       <Route 
       path="categories"
       element={<Categories />}
       />
       <Route 
       path="products"
       element={<Products />}
       />
       <Route 
       path="customers"
       element={<Customers />}
       />
       <Route 
       path="sales"
       element={<Sales/>}
       />
       <Route 
       path="versement"
       element={<Versement />}
       />
       <Route 
       path="cashManagement"
       element={<CashManagement />}
       />
       <Route 
       path="users"
       element={ <Users /> }
       />
       <Route 
       path="logout"
       element={<Logout />}
       />
       
       
       </Route>
    </Routes>
   </Router>
  )
}

export default App
