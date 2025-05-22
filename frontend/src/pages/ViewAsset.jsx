import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAssetById, reset } from '../features/assets/assetSlice'
import { getUserById } from '../features/users/userSlice'
import { checkFavorite, addFavorite, removeFavorite, reset as favoriteReset } from '../features/favorites/favoriteSlice'
import { registerDownload } from '../features/downloads/downloadSlice'
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
  const [isDownloading, setIsDownloading] = useState(false)
  
  // NUEVO: Estado para manejar la imagen principal seleccionada
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1) // -1 = imagen de portada, 0+ = índice de imagen adicional
  
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
    setSelectedImageIndex(-1); // NUEVO: Resetear imagen seleccionada
    
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

  // NUEVO: Función para obtener la URL de la imagen principal actual
  const getCurrentMainImageUrl = () => {
    if (selectedImageIndex === -1) {
      // Mostrar imagen de portada
      return getImageUrl(asset.coverImageUrl);
    } else {
      // Mostrar imagen adicional seleccionada
      const additionalImages = getAdditionalImages();
      if (additionalImages[selectedImageIndex]) {
        return getImageUrl(additionalImages[selectedImageIndex]);
      }
      // Fallback a imagen de portada si no existe la imagen seleccionada
      return getImageUrl(asset.coverImageUrl);
    }
  };

  // NUEVO: Función para obtener el alt text de la imagen principal actual
  const getCurrentMainImageAlt = () => {
    if (selectedImageIndex === -1) {
      return asset.title;
    } else {
      return `${asset.title} - imagen ${selectedImageIndex + 1}`;
    }
  };

  // NUEVO: Función para manejar el clic en las miniaturas
  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
    // Resetear estados de carga para la nueva imagen principal
    setImagesLoaded(prev => ({ ...prev, main: false }));
    setImagesError(prev => ({ ...prev, main: false }));
  };

  // NUEVO: Función para manejar el clic en la imagen de portada (miniatura)
  const handleCoverThumbnailClick = () => {
    setSelectedImageIndex(-1);
    // Resetear estados de carga
    setImagesLoaded(prev => ({ ...prev, main: false }));
    setImagesError(prev => ({ ...prev, main: false }));
  };

  // Funciones de utilidad
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  // Manejar clic en botón de favoritos
  const handleFavoriteClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isFavorite) {
      dispatch(removeFavorite(asset._id))
        .unwrap()
        .then(() => {
          
        })
        .catch(error => {
          toast.error('Error al eliminar de favoritos');
        });
    } else {
      dispatch(addFavorite(asset._id))
        .unwrap()
        .then(() => {
          
        })
        .catch(error => {
          toast.error('Error al añadir a favoritos');
        });
    }
  };

  // Función modificada para manejar la descarga con registro en historial
  const handleDownload = async () => {
    // Verificar si el usuario está autenticado
    if (!user) {
      navigate('/login');
      return;
    }

    // Verificar que el asset tiene una URL de descarga
    if (!asset || !asset.downloadUrl) {
      toast.error('No hay contenido disponible para descargar');
      return;
    }

    // Evitar múltiples descargas simultáneas
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {

      
      // Primero registrar la descarga en el historial
      const downloadResponse = await dispatch(registerDownload(asset._id)).unwrap();
      
      
      
      // Si el registro fue exitoso, proceder con la descarga
      if (downloadResponse && downloadResponse.downloadUrl) {
        // Obtener nombre de archivo para la descarga basado en el título del asset
        const fileName = asset.title 
          ? `${asset.title.replace(/[^a-zA-Z0-9]/g, '_')}` 
          : 'asset_content';
        
        // Crear un elemento <a> temporal para la descarga
        const link = document.createElement('a');
        link.href = downloadResponse.downloadUrl; // Usar la URL del response
        link.setAttribute('download', fileName);
        link.style.display = 'none';
        
        // Añadir al DOM, hacer clic y eliminar
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Descarga iniciada y registrada en tu historial');
      } else {
        // Si no hay URL en el response, usar la URL original del asset
        const fileName = asset.title 
          ? `${asset.title.replace(/[^a-zA-Z0-9]/g, '_')}` 
          : 'asset_content';
        
        const link = document.createElement('a');
        link.href = asset.downloadUrl;
        link.setAttribute('download', fileName);
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Descarga iniciada y registrada en tu historial');
      }
      
    } catch (error) {
      console.error('Error al registrar la descarga:', error);
      
      // Si falla el registro, aún permitir la descarga pero sin historial
      if (asset.downloadUrl) {
        try {
          const fileName = asset.title 
            ? `${asset.title.replace(/[^a-zA-Z0-9]/g, '_')}` 
            : 'asset_content';
          
          const link = document.createElement('a');
          link.href = asset.downloadUrl;
          link.setAttribute('download', fileName);
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.warning('Descarga iniciada, pero no se pudo registrar en el historial');
        } catch (downloadError) {
          console.error('Error al iniciar la descarga:', downloadError);
          toast.error('Error al iniciar la descarga');
        }
      } else {
        toast.error('Error al procesar la descarga');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Redireccionar a login
  const redirectToLogin = () => {
    navigate('/login');
  };

  // NUEVO: Función para navegar al perfil del usuario
  const navigateToUserProfile = () => {
    if (assetOwner && asset.user) {
      navigate(`/user/${asset.user}`);
    }
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
            {/* MODIFICADO: Usar la función getCurrentMainImageUrl() */}
            <img 
              src={getCurrentMainImageUrl()} 
              alt={getCurrentMainImageAlt()} 
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

          {/* MODIFICADO: Miniaturas con funcionalidad de clic */}
          <div className="asset-thumbnails">
            {/* Miniatura de la imagen de portada */}
            <div 
              className={`thumbnail ${selectedImageIndex === -1 ? 'thumbnail-active' : ''}`}
              onClick={handleCoverThumbnailClick}
            >
              {!imagesLoaded.cover && !imagesError.cover && (
                <div className="image-placeholder">Cargando...</div>
              )}
              {imagesError.cover && (
                <div className="image-error">
                  <p>Error</p>
                </div>
              )}
              <img 
                src={getImageUrl(asset.coverImageUrl)} 
                alt={`${asset.title} - portada`} 
                onLoad={() => setImagesLoaded(prev => ({ ...prev, cover: true }))}
                onError={() => setImagesError(prev => ({ ...prev, cover: true }))}
                style={{ display: imagesLoaded.cover && !imagesError.cover ? 'block' : 'none' }}
              />
            </div>

            {/* Miniaturas de imágenes adicionales */}
            {additionalImages && additionalImages.length > 0 && 
              additionalImages.slice(0, 2).map((imageUrl, index) => ( // Solo mostrar 2 adicionales para que no se desborde
                <div 
                  className={`thumbnail ${selectedImageIndex === index ? 'thumbnail-active' : ''}`} 
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                >
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
              ))
            }
          </div>
          
          {/* Sección de comentarios */}
          <Comments assetId={id} />
        </div>

        {/* Barra lateral con información del asset */}
        <div className="asset-sidebar">
          <div className="creator-info">
            <div 
              className="creator-avatar"
              onClick={navigateToUserProfile}
              style={{ cursor: assetOwner ? 'pointer' : 'default' }}
              title={assetOwner ? `Ver perfil de ${assetOwner.name}` : ''}
            >
              {assetOwner ? (
                <div className="profile-initials">
                  {getInitial(assetOwner.name)}
                </div>
              ) : (
                <div className="profile-initials">?</div>
              )}
            </div>
            <div className="creator-details">
              <div 
                className="creator-name"
                onClick={navigateToUserProfile}
                style={{ 
                  cursor: assetOwner ? 'pointer' : 'default',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => assetOwner && (e.target.style.color = '#8c52ff')}
                onMouseLeave={(e) => assetOwner && (e.target.style.color = '#fff')}
                title={assetOwner ? `Ver perfil de ${assetOwner.name}` : ''}
              >
                {assetOwner ? assetOwner.name : 'Cargando...'}
              </div>
              <div className="creator-username">@{assetOwner ? assetOwner.username : '...'}</div>
            </div>
          </div>

          <div className="download-actions">
            {user ? (
              <>
                <button 
                  className={`download-button ${isDownloading ? 'downloading' : ''}`}
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  <FaDownload /> {isDownloading ? 'Descargando...' : 'Descargar'}
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
              // Solo mostrar el botón de descarga cuando no hay usuario logueado
              <button className="download-button disabled" onClick={redirectToLogin}>
                <FaLock /> Iniciar sesión para descargar
              </button>
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