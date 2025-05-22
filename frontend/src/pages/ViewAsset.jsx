import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAssetById, reset } from '../features/assets/assetSlice'
import { getUserById } from '../features/users/userSlice'
import { checkFavorite, addFavorite, removeFavorite, reset as favoriteReset } from '../features/favorites/favoriteSlice'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaArrowLeft, FaStar, FaRegStar, FaDownload, FaLock } from 'react-icons/fa'
import Spinner from '../components/Spinner'
import Comments from '../components/Comments'
import './ViewAsset.css'

function ViewAsset() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [imagesLoaded, setImagesLoaded] = useState({})
  const [imagesError, setImagesError] = useState({})
  const [assetOwner, setAssetOwner] = useState(null)
  
  const { asset, isLoading, isError, message } = useSelector(
    (state) => state.assets
  )
  
  const { user } = useSelector(state => state.auth)
  const { isFavorite, isLoading: favoriteLoading } = useSelector(state => state.favorites)

  // Efecto para cargar el asset
  useEffect(() => {
    setAssetOwner(null);
    setImagesLoaded({});
    setImagesError({});
    
    if (isError) {
      console.log(message)
    }

    dispatch(getAssetById(id))

    return () => {
      dispatch(reset())
      dispatch(favoriteReset())
    }
  }, [id, isError, message, dispatch])

  // Efecto para cargar los datos del usuario creador del asset
  useEffect(() => {
    if (asset && asset.user) {
      console.log('Cargando usuario del asset:', asset.user);
      
      setAssetOwner(null);
      
      dispatch(getUserById(asset.user))
        .unwrap()
        .then(userData => {
          console.log('Usuario cargado:', userData);
          setAssetOwner(userData)
        })
        .catch(error => {
          console.error('Error al cargar el usuario:', error)
          setAssetOwner(null)
        })
    } else {
      setAssetOwner(null)
    }
  }, [asset?.user, dispatch])

  // Comprobar si el asset está en favoritos cuando se carga (solo si el usuario está autenticado)
  useEffect(() => {
    if (user && asset && asset._id) {
      dispatch(checkFavorite(asset._id))
    }
  }, [user, asset, dispatch])

  // Función para obtener la URL de la imagen adaptada para usar nuestro proxy
  const getImageUrl = (url) => {
    if (!url) return '';
    
    if (url.startsWith('/api/proxy/image/')) {
      return url;
    }
    
    if (url.includes('drive.google.com')) {
      const idParam = url.match(/[?&]id=([^&]+)/);
      if (idParam && idParam[1]) {
        return `/api/proxy/image/${idParam[1]}`;
      }
      
      const pathId = url.match(/\/d\/([^\/\?]+)/) || url.match(/\/file\/d\/([^\/\?]+)/);
      if (pathId && pathId[1]) {
        return `/api/proxy/image/${pathId[1]}`;
      }
    }
    
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

  // Funciones de utilidad
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  // Manejar clic en botón de favoritos
  const handleFavoriteClick = () => {
    if (!user) {
      toast.info('Inicia sesión para añadir a favoritos');
      navigate('/login');
      return;
    }

    if (isFavorite) {
      dispatch(removeFavorite(asset._id))
        .unwrap()
        .then(() => {
          toast.success('Eliminado de favoritos');
        })
        .catch(error => {
          toast.error('Error al eliminar de favoritos');
        });
    } else {
      dispatch(addFavorite(asset._id))
        .unwrap()
        .then(() => {
          toast.success('Añadido a favoritos');
        })
        .catch(error => {
          toast.error('Error al añadir a favoritos');
        });
    }
  };


const handleDownload = () => {
  // Verificar si el usuario está autenticado
  if (!user) {
    toast.info('Inicia sesión para descargar este asset');
    navigate('/login');
    return;
  }

  // Verificar que el asset tiene una URL de descarga
  if (asset && asset.downloadUrl) {
    try {
      console.log('Iniciando descarga desde:', asset.downloadUrl);
      
      // Obtener nombre de archivo para la descarga basado en el título del asset
      const fileName = asset.title 
        ? `${asset.title.replace(/[^a-zA-Z0-9]/g, '_')}` 
        : 'asset_content';
      
      // Crear un elemento <a> temporal para la descarga
      const link = document.createElement('a');
      link.href = asset.downloadUrl; // URL DIRECTA de Google Drive
      link.setAttribute('download', fileName); // Nombre sugerido para el archivo
      // REMOVIDO: link.setAttribute('target', '_blank'); - Esto causaba que se abra en nueva pestaña
      link.style.display = 'none';
      
      // Añadir al DOM, hacer clic y eliminar
      document.body.appendChild(link);
      link.click();
      
      // Eliminar el elemento inmediatamente
      document.body.removeChild(link);
      
      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error al iniciar la descarga:', error);
      toast.error('Error al iniciar la descarga');
    }
  } else {
    toast.error('No hay contenido disponible para descargar');
  }
};

  // Redireccionar a login
  const redirectToLogin = () => {
    toast.info('Debes iniciar sesión para utilizar esta función');
    navigate('/login');
  };

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
    <>
      {/* Contenedor principal */}
      <div className="main-container">
        {/* Sección de visualización del modelo */}
        <div className="asset-main-view">
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

          {/* Botón de volver al inicio */}
          <div className="back-button-container">
            <Link to="/" className="back-link">
              <FaArrowLeft /> Volver al inicio
            </Link>
          </div>

          {/* Miniaturas */}
          {additionalImages && additionalImages.length > 0 && (
            <div className="asset-thumbnails">
              {additionalImages.slice(0, 3).map((imageUrl, index) => (
                <div className="thumbnail" key={index}>
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
          )}
          
          {/* Sección de comentarios */}
          <Comments assetId={id} />
        </div>

        {/* Barra lateral con información del asset */}
        <div className="asset-sidebar">
          <div className="creator-info">
            <div className="creator-avatar">
              {assetOwner ? (
                <div className="profile-initials">
                  {getInitial(assetOwner.name)}
                </div>
              ) : (
                <div className="profile-initials">?</div>
              )}
            </div>
            <div className="creator-details">
              <div className="creator-name">{assetOwner ? assetOwner.name : 'Cargando...'}</div>
              <div className="creator-username">@{assetOwner ? assetOwner.username : '...'}</div>
            </div>
          </div>

          <div className="download-actions">
            {user ? (
              <>
                <button className="download-button" onClick={handleDownload}>
                  <FaDownload /> Descargar
                </button>
                <button 
                  className={`favorite-button ${isFavorite ? 'favorite-active' : ''}`} 
                  onClick={handleFavoriteClick}
                  disabled={favoriteLoading}
                >
                  {isFavorite ? <FaStar /> : <FaRegStar />}
                </button>
              </>
            ) : (
              <>
                <button className="download-button disabled" onClick={redirectToLogin}>
                  <FaLock /> Descargar
                </button>
                <button 
                  className="favorite-button disabled"
                  onClick={redirectToLogin}
                >
                  <FaRegStar />
                </button>
              </>
            )}
          </div>

          {asset.tags && asset.tags.length > 0 && (
            <div className="etiquetas-section">
              <div className="etiquetas-title">Etiquetas</div>
              <div className="etiquetas">
                {asset.tags.map((tag, index) => (
                  <div className="etiqueta" key={index}>#{tag}</div>
                ))}
              </div>
            </div>
          )}

          <div className="asset-info-section">
            <h1 className="asset-title">{asset.title}</h1>
            <div className="asset-type-category">
              <span className="asset-category">{asset.category}</span>
            </div>
            <div className="asset-description">
              {asset.description}
            </div>
            {formattedDate && <span className="asset-date">{formattedDate}</span>}
          </div>
        </div>
      </div>
    </>
  )
}

export default ViewAsset