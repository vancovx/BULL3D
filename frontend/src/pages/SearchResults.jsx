import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getAssets } from '../features/assets/assetSlice'
import { FaSearch, FaArrowLeft } from 'react-icons/fa'
import AssetItem from '../components/AssetItem'
import Spinner from '../components/Spinner'
import './SearchResults.css'

function SearchResults() {
  const location = useLocation()
  const dispatch = useDispatch()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredAssets, setFilteredAssets] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  
  const { assets, isLoading, isError, message } = useSelector(
    (state) => state.assets
  )

  // Extraer la consulta de búsqueda de la URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const query = queryParams.get('q')
    if (query) {
      setSearchQuery(query)
    }
  }, [location.search])

  // Cargar assets
  useEffect(() => {
    if (isError) {
      console.log(message)
    }
    
    dispatch(getAssets())
  }, [isError, message, dispatch])

  // Filtrar assets según la consulta de búsqueda
  useEffect(() => {
    if (assets && searchQuery) {
      const results = assets.filter(asset => 
        asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.category && asset.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (asset.tags && Array.isArray(asset.tags) && asset.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
      
      setFilteredAssets(results)
    } else {
      setFilteredAssets([])
    }
  }, [assets, searchQuery])

  // Obtener todas las categorías de los resultados para los filtros
  const getCategories = () => {
    if (filteredAssets.length === 0) return []
    
    const allCategories = filteredAssets
      .map(asset => asset.category)
      .filter(Boolean)
    
    return [...new Set(allCategories)]
  }

  // Aplicar filtro por categoría
  const filterByCategory = (category) => {
    setActiveFilter(category)
  }

  // Obtener los resultados filtrados según la categoría seleccionada
  const getFilteredResults = () => {
    if (activeFilter === 'all') {
      return filteredAssets
    }
    
    return filteredAssets.filter(asset => asset.category === activeFilter)
  }

  const resultsToShow = getFilteredResults()
  const categories = getCategories()

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="search-results-page">
      <div className="search-header">
        <Link to="/" className="back-link">
          <FaArrowLeft /> Volver
        </Link>
        <h1>
          <FaSearch /> Resultados para "{searchQuery}"
        </h1>
        <p className="results-count">
          {filteredAssets.length} resultados encontrados
        </p>
      </div>
      
      {filteredAssets.length > 0 ? (
        <div className="search-content">
          {/* Filtros de categoría */}
          {categories.length > 1 && (
            <div className="search-filters">
              <h3>Filtrar por categoría</h3>
              <div className="category-filters">
                <button 
                  className={`category-filter ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => filterByCategory('all')}
                >
                  Todos ({filteredAssets.length})
                </button>
                
                {categories.map((category, index) => {
                  const count = filteredAssets.filter(asset => asset.category === category).length
                  return (
                    <button 
                      key={index}
                      className={`category-filter ${activeFilter === category ? 'active' : ''}`}
                      onClick={() => filterByCategory(category)}
                    >
                      {category} ({count})
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Resultados */}
          <div className="search-results-grid">
            {resultsToShow.length > 0 ? (
              resultsToShow.map(asset => (
                <AssetItem key={asset._id} asset={asset} />
              ))
            ) : (
              <div className="no-filtered-results">
                <p>No hay resultados para el filtro seleccionado</p>
                <button 
                  className="reset-filter-btn"
                  onClick={() => setActiveFilter('all')}
                >
                  Mostrar todos los resultados
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="no-results">
          <p>No se encontraron resultados para <strong>"{searchQuery}"</strong></p>
          <div className="search-suggestions">
            <h3>Sugerencias:</h3>
            <ul>
              <li>Revisa que todas las palabras estén escritas correctamente</li>
              <li>Prueba con diferentes palabras clave</li>
              <li>Intenta usando términos más generales</li>
              <li>Busca por categoría usando el menú "Explorar"</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchResults