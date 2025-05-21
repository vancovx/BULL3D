// Modificación del componente Header para navegar a ExplorarCategoria
import { useState, useEffect, useRef } from 'react'
import { FaSignInAlt, FaSignOutAlt, FaUser, FaSearch, FaCloudUploadAlt, FaStar, FaChevronDown } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../features/auth/authSlice'
import { getAssets } from '../features/assets/assetSlice'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { assets } = useSelector((state) => state.assets)
  
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const [categories, setCategories] = useState([])

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoriesDropdown(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Obtener los assets para extraer sus categorías
  useEffect(() => {
    dispatch(getAssets())
  }, [dispatch])

  // Extraer categorías únicas de los assets
  useEffect(() => {
    if (assets && assets.length > 0) {
      const uniqueCategories = [...new Set(assets.map(asset => asset.category))]
      setCategories(uniqueCategories.filter(Boolean))
    }
  }, [assets])

  // Función para cerrar sesión
  const onLogout = () => {
    dispatch(logout())
    dispatch(reset())
    navigate('/')
  }

  // Función para navegar a la categoría seleccionada - MODIFICADA
  const navigateToCategory = (category) => {
    if (category) {
      navigate(`/categoria/${category}`)
      setShowCategoriesDropdown(false)
    } else {
      console.error('Intentando navegar a una categoría indefinida')
      navigate('/')
    }
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
          <div className="nav-dropdown-container" ref={dropdownRef}>
            <button 
              className={`nav-link explore-btn ${showCategoriesDropdown ? 'active' : ''}`}
              onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
            >
              Explorar <FaChevronDown className="dropdown-icon" />
            </button>
            
            {showCategoriesDropdown && (
              <div className="categories-dropdown">
                <div className="categories-grid">
                  {categories.map((category, index) => (
                    <div 
                      key={index} 
                      className="category-item"
                      onClick={() => navigateToCategory(category)}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
                
                <Link to="/favorites" className="icon-button" title="Mis Favoritos">
                  <FaStar />
                </Link>
  
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