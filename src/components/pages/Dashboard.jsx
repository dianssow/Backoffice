import Sidebar from "../Sidebar"
import { Outlet } from "react-router-dom"
function Dashboard() {
  return (
    <div>
        <div className="flex z-30">
          <Sidebar/>
          <div className='flex-1 ml-16 md:ml-64 bg-gray-100 min-h-screen relative'>
            <Outlet />
          </div>
        </div>
    </div>
  )
}
export default Dashboard