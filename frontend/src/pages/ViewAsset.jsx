import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAssetById, reset } from '../features/assets/assetSlice'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import Spinner from '../components/Spinner'
import './ViewAsset.css'

function ViewAsset() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [imagesLoaded, setImagesLoaded] = useState({})
  const [imagesError, setImagesError] = useState({})
  
  const { asset, isLoading, isError, message } = useSelector(
    (state) => state.assets
  )

  useEffect(() => {
    if (isError) {
      console.log(message)
    }

    dispatch(getAssetById(id))

    return () => {
      dispatch(reset())
    }
  }, [id, isError, message, dispatch])

  // Función para obtener la URL de la imagen adaptada para usar nuestro proxy
  const getImageUrl = (url) => {
    if (!url) return '';
    
    // Si la URL ya es de nuestro proxy, la usamos directamente
    if (url.startsWith('/api/proxy/image/')) {
      return url;
    }
    
    // Si es una URL de Google Drive, extraemos el ID y usamos nuestro proxy
    if (url.includes('drive.google.com')) {
      // Intentar obtener el ID del parámetro id=
      const idParam = url.match(/[?&]id=([^&]+)/);
      if (idParam && idParam[1]) {
        return `/api/proxy/image/${idParam[1]}`;
      }
      
      // Intentar obtener el ID del patrón /d/ o /file/d/
      const pathId = url.match(/\/d\/([^\/\?]+)/) || url.match(/\/file\/d\/([^\/\?]+)/);
      if (pathId && pathId[1]) {
        return `/api/proxy/image/${pathId[1]}`;
      }
    }
    
    // Para cualquier otra URL, la devolvemos tal cual
    return url;
  };

  // Manejar la carga/error de la imagen principal
  const handleMainImageLoad = () => {
    setImagesLoaded(prev => ({ ...prev, main: true }))
  }

  const handleMainImageError = () => {
    setImagesError(prev => ({ ...prev, main: true }))
  }

  // Manejar la carga/error de imágenes adicionales
  const handleImageLoad = (index) => {
    setImagesLoaded(prev => ({ ...prev, [index]: true }))
  }

  const handleImageError = (index) => {
    setImagesError(prev => ({ ...prev, [index]: true }))
  }

  // Convertir el string JSON de imágenes en un array
  const getAdditionalImages = () => {
    if (!asset.imagesUrl) return [];
    try {
      return JSON.parse(asset.imagesUrl);
    } catch (e) {
      console.error('Error parsing images:', e);
      return [];
    }
  }

  if (isLoading) {
    return <Spinner />
  }

  if (!asset || !asset._id) {
    return (
      <div className="asset-not-found">
        <h2>Asset no encontrado</h2>
        <Link to="/" className="back-link">
          <FaArrowLeft /> Volver al inicio
        </Link>
      </div>
    )
  }

  const additionalImages = getAdditionalImages();
  const formattedDate = asset.date ? new Date(asset.date).toLocaleDateString() : '';

  return (
    <div className="asset-view-container">
      <div className="asset-view-header">
        <Link to="/" className="back-link">
          <FaArrowLeft /> Volver al inicio
        </Link>
        <h1>{asset.title}</h1>
        <div className="asset-metadata">
          <span className="asset-type">{asset.typeContent}</span>
          {formattedDate && <span className="asset-date">{formattedDate}</span>}
        </div>
      </div>

      <div className="asset-view-content">
        <div className="asset-main-image">
          {!imagesLoaded.main && !imagesError.main && (
            <div className="image-placeholder">Cargando imagen principal...</div>
          )}
          {imagesError.main && (
            <div className="image-error">
              <p>Error al cargar la imagen principal</p>
            </div>
          )}
          <img 
            src={getImageUrl(asset.coverImageUrl)} 
            alt={asset.title} 
            onLoad={handleMainImageLoad}
            onError={handleMainImageError}
            style={{ display: imagesLoaded.main && !imagesError.main ? 'block' : 'none' }}
          />
        </div>

        <div className="asset-description">
          <h2>Descripción</h2>
          <p>{asset.description}</p>
        </div>

        {additionalImages && additionalImages.length > 0 && (
          <div className="asset-gallery">
            <h2>Galería de imágenes</h2>
            <div className="asset-additional-images">
              {additionalImages.map((imageUrl, index) => (
                <div className="gallery-image" key={index}>
                  {!imagesLoaded[index] && !imagesError[index] && (
                    <div className="image-placeholder">Cargando...</div>
                  )}
                  {imagesError[index] && (
                    <div className="image-error">
                      <p>Error</p>
                    </div>
                  )}
                  <img 
                    src={getImageUrl(imageUrl)} 
                    alt={`${asset.title} - imagen ${index + 1}`} 
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                    style={{ display: imagesLoaded[index] && !imagesError[index] ? 'block' : 'none' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {asset.contentUrl && (
          <div className="asset-download">
            <h2>Contenido</h2>
            <a 
              href={asset.contentUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="download-btn"
            >
              Descargar contenido
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewAsset