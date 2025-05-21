import { useState, useEffect, useRef } from 'react'
import { FaSignInAlt, FaSignOutAlt, FaUser, FaSearch, FaCloudUploadAlt, FaStar, FaChevronDown, FaTimes } from 'react-icons/fa'
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)
  const [categories, setCategories] = useState([])

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoriesDropdown(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
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

  // Función para navegar a la categoría seleccionada
  const navigateToCategory = (category) => {
    if (category) {
      navigate(`/categoria/${category}`)
      setShowCategoriesDropdown(false)
    } else {
      console.error('Intentando navegar a una categoría indefinida')
      navigate('/')
    }
  }

  // Función para manejar el cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() !== '') {
      // Filtrar assets que coincidan con la búsqueda
      const results = assets.filter(asset => 
        asset.title.toLowerCase().includes(query.toLowerCase()) ||
        (asset.category && asset.category.toLowerCase().includes(query.toLowerCase())) ||
        (asset.description && asset.description.toLowerCase().includes(query.toLowerCase())) ||
        (asset.tags && Array.isArray(asset.tags) && asset.tags.some(tag => 
          tag.toLowerCase().includes(query.toLowerCase())
        ))
      );
      
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Función para manejar la búsqueda al presionar Enter
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  // Función para navegar a un asset específico desde los resultados de búsqueda
  const navigateToAsset = (assetId) => {
    navigate(`/assets/${assetId}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Función para limpiar la búsqueda
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

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
        <div className='search-box' ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Buscar assets..." 
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim() !== '' && setShowSearchResults(true)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="clear-search-btn" 
                onClick={clearSearch}
                title="Limpiar búsqueda"
              >
                <FaTimes />
              </button>
            )}
            <button type="submit" className='search-btn' title="Buscar">
              <FaSearch />
            </button>
          </form>
          
          {/* Resultados de búsqueda */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results">
              <div className="search-results-header">
                <h3>Resultados</h3>
                <p>{searchResults.length} encontrados</p>
              </div>
              <div className="search-results-list">
                {searchResults.slice(0, 5).map(asset => (
                  <div 
                    key={asset._id} 
                    className="search-result-item"
                    onClick={() => navigateToAsset(asset._id)}
                  >
                    <div className="search-result-image">
                      <img 
                        src={asset.coverImageUrl} 
                        alt={asset.title} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                    <div className="search-result-info">
                      <h4>{asset.title}</h4>
                      <span className="search-result-category">{asset.category}</span>
                    </div>
                  </div>
                ))}
                
                {searchResults.length > 5 && (
                  <div className="see-all-results">
                    <Link to={`/search?q=${encodeURIComponent(searchQuery)}`} onClick={() => setShowSearchResults(false)}>
                      Ver todos los resultados ({searchResults.length})
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {showSearchResults && searchResults.length === 0 && searchQuery.trim() !== '' && (
            <div className="search-results">
              <div className="no-search-results">
                <p>No se encontraron resultados para "{searchQuery}"</p>
              </div>
            </div>
          )}
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