// src/pages/ExplorarCategoria.jsx (corregido)
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { getAssets } from '../features/assets/assetSlice'
import AssetItem from '../components/AssetItem'
import Spinner from '../components/Spinner'
import './ExplorarCategoria.css'

function ExplorarCategoria() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { categoria } = useParams()
  const { assets, isLoading, isError, message } = useSelector(state => state.assets)
  const [selectedTag, setSelectedTag] = useState(null)
  
  // Verificar si tenemos una categoría válida
  useEffect(() => {
    if (!categoria) {
      // Redireccionar a la página principal si no hay categoría
      navigate('/')
      return
    }
  }, [categoria, navigate])
  
  // Obtener assets al cargar
  useEffect(() => {
    if (isError) {
      console.log(message)
    }
    
    dispatch(getAssets())
  }, [dispatch, isError, message])
  
  // Si no hay categoría, no renderizar nada (o mostrar spinner mientras redirige)
  if (!categoria) {
    return <Spinner />
  }
  
  // Filtrar assets por categoría
  const categoryAssets = assets.filter(asset => 
    asset.category && asset.category.toLowerCase() === categoria.toLowerCase()
  )
  
  // Filtrar por etiqueta si hay una seleccionada
  const filteredAssets = selectedTag 
    ? categoryAssets.filter(asset => 
        asset.tags && asset.tags.some(tag => 
          tag.toLowerCase() === selectedTag.toLowerCase()
        )
      ) 
    : categoryAssets
  
  // Extraer todas las etiquetas únicas de los assets de esta categoría
  const allTags = []
  categoryAssets.forEach(asset => {
    if (asset.tags && Array.isArray(asset.tags)) {
      asset.tags.forEach(tag => {
        if (!allTags.includes(tag)) {
          allTags.push(tag)
        }
      })
    }
  })
  
  // Manejar clic en etiqueta
  const handleTagClick = (tag) => {
    setSelectedTag(tag === selectedTag ? null : tag)
  }
  
  if (isLoading) {
    return <Spinner />
  }
  
  return (
    <div className="explorer-container">
      <h1 className="category-title">Categoría: {categoria}</h1>
      
      <div className="explorer-content">
        {/* Sidebar de etiquetas */}
        <div className="tags-sidebar">
          <h2 className="tags-title">Etiquetas</h2>
          <div className="tags-list">
            {allTags.map((tag, index) => (
              <button 
                key={index} 
                className={`tag-button ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                #{tag}
              </button>
            ))}
            
            {allTags.length === 0 && (
              <p className="no-tags">No hay etiquetas disponibles</p>
            )}
          </div>
        </div>
        
        {/* Grid de assets */}
        <div className="category-assets">
          {filteredAssets.length > 0 ? (
            <div className="assets-grid">
              {filteredAssets.map(asset => (
                <AssetItem key={asset._id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="no-assets">
              <p>No hay assets disponibles {selectedTag ? `con la etiqueta #${selectedTag}` : 'en esta categoría'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExplorarCategoria