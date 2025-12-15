import {useEffect} from "react"
import {useDispatch} from  "react-redux"
import {logout} from "../feature/loginPage.js"
import {useNavigate} from"react-router"
function Logout() {
  
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(logout())
        navigate("/")
    }, [dispatch, navigate])

    return null
}
export default Logout