import { FaSignInAlt, FaSignOutAlt, FaUser, FaSearch } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../features/auth/authSlice'
import '../Header.css'

function Header() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const onLogout = () => {
    dispatch(logout())
    dispatch(reset())
    navigate('/')
  }

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
          <Link to="/contact" className='nav-link'>Contactanos</Link>
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
                <Link to="/profile" className="profile-icon" title="Mi Perfil">
                  <FaUser />
                </Link>
                <button className='btn-logout' onClick={onLogout}>
                  <FaSignOutAlt /> Cerrar Sesión
                </button>
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