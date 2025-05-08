import { FaSignInAlt, FaSignOutAlt, FaUser, FaSearch, FaCloudUploadAlt, FaStar } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../features/auth/authSlice'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)


  return (
    <header className='main-header'>
      <div className='header-content'>
        {/* Logo */}
        <div className='logo-container'>
          <Link to='/'>
            <img className="header-logo" src="/Logo_Toro.png" alt="Logo" />
          </Link>
        </div>

        {/* Navegación */}
        <nav className='header-nav'>
          <Link to="/explore" className='nav-link'>Explorar</Link>
        </nav>

        {/* Barra de búsqueda */}
        <div className='search-box'>
          <input type="text" placeholder="Buscar" />
          <button className='search-btn'>
            <FaSearch />
          </button>
        </div>

        {/* Autenticación */}
        <div className='auth-section'>
        {user ? (
              <>
                <Link to="/upload" className="btn-logout">
                  Subir 
                </Link>
                
                <button className="icon-button">
                  <FaStar />
                </button>
  
                <Link to="/profile" className="icon-button">
                  <FaUser />
                </Link>
              
              </>
            ) : (
              <>
                <Link to='/register' className='btn-register'>
                  <FaUser /> Registrarse
                </Link>
                <Link to='/login' className='btn-login'>
                  <FaSignInAlt /> Iniciar Sesión
                </Link>
              </>
            )}
        </div>
      </div>
    </header>
  )
}

export default Header