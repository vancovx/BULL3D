import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getAssets, reset } from '../features/assets/assetSlice'
import Spinner from '../components/Spinner'
import AssetItem from '../components/AssetItem'
import './Inicio.css'

function Inicio() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [filter, setFilter] = useState('all')

  const { user } = useSelector((state) => state.auth)
  const { assets, isLoading, isError, message } = useSelector(
    (state) => state.assets
  )

  useEffect(() => {
    if (isError) {
      console.log(message)
    }

    if (!user) {
      navigate('/login')
    } else {
      dispatch(getAssets())
    }

    return () => {
      dispatch(reset())
    }
  }, [user, navigate, isError, message, dispatch])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  // Filtrar los assets por tipo de contenido
  const filteredAssets = filter === 'all' 
    ? assets 
    : assets.filter(asset => asset.typeContent === filter)

  if (isLoading) {
    return <Spinner />
  }

  // Obtener los tipos únicos de contenido para el selector de filtro
  const assetTypes = assets && assets.length > 0 
    ? ['all', ...new Set(assets.map(asset => asset.typeContent))] 
    : ['all']

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Explora los Assets</h1>
        <div className="filter-container">
          <label htmlFor="filter">Filtrar por tipo:</label>
          <select 
            id="filter" 
            value={filter} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            {assetTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'Todos' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredAssets && filteredAssets.length > 0 ? (
        <div className="assets-grid">
          {filteredAssets.map((asset) => (
            <AssetItem key={asset._id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="no-assets">
          <p>No hay assets disponibles</p>
        </div>
      )}
    </div>
  )
}

export default Inicio