import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { getAssets, reset } from '../features/assets/assetSlice'
import Spinner from '../components/Spinner'
import AssetItem from '../components/AssetItem'
import './Inicio.css'

function Inicio() {
  const dispatch = useDispatch()
  const location = useLocation()
  const [filter, setFilter] = useState('all')

  const { assets, isLoading, isError, message } = useSelector(
    (state) => state.assets
  )

  useEffect(() => {
    if (isError) {
      console.log(message)
    }

    // Fetch assets regardless of authentication status
    dispatch(getAssets())

    return () => {
      dispatch(reset())
    }
  }, [isError, message, dispatch])
  
  // Comprobar si hay una categoría en la URL query
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const categoryParam = queryParams.get('category')
    
    if (categoryParam) {
      setFilter(categoryParam)
    } else {
      setFilter('all')
    }
  }, [location.search])

  // Filtrar los assets por categoría (solo si viene de la URL)
  const filteredAssets = filter === 'all' 
    ? assets 
    : assets.filter(asset => 
        asset.category === filter
      )

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="home-container">


      {filteredAssets && filteredAssets.length > 0 ? (
        <div className="assets-grid">
          {filteredAssets.map((asset) => (
            <AssetItem key={asset._id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="no-assets">
          <p>No hay assets disponibles{filter !== 'all' ? ' en esta categoría' : ''}</p>
        </div>
      )}
    </div>
  )
}

export default Inicio